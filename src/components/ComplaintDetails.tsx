/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, MapPin, Send, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, RefreshCw, Star, UserCheck, 
  HelpCircle, Eye, ShieldCheck, Landmark, Tag, Sparkles, X, Printer, QrCode
} from 'lucide-react';
import { updateComplaint, addComplaintMessage, fetchQuickUsers } from '../lib/api';
import { Complaint, User, ComplaintStatus, Message } from '../types';
import { TranslationSet } from '../lib/translations';

interface ComplaintDetailsProps {
  complaint: Complaint;
  currentUser: User;
  onBack: () => void;
  onUpdate: (updated: Complaint) => void;
  t: TranslationSet;
  currentLang: string;
}

const STATUS_LABELS: Record<ComplaintStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Awaiting Review', color: 'text-red-700 border-red-200', bg: 'bg-red-50/75', dot: 'bg-red-500' },
  under_review: { label: 'In Review', color: 'text-cyan-700 border-cyan-200', bg: 'bg-cyan-50/75', dot: 'bg-cyan-500' },
  in_progress: { label: 'Under Investigation', color: 'text-amber-700 border-amber-200', bg: 'bg-amber-50/75', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved & Fixed', color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-50/75', dot: 'bg-emerald-500' },
  rejected: { label: 'Declined / Closed', color: 'text-slate-700 border-slate-200', bg: 'bg-slate-50', dot: 'bg-slate-500' }
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ComplaintDetails({ complaint, currentUser, onBack, onUpdate, t, currentLang }: ComplaintDetailsProps) {
  const [commentText, setCommentText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [officers, setOfficers] = useState<User[]>([]);
  
  // Official form state
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [selectedOfficer, setSelectedOfficer] = useState(complaint.assignedTo || '');
  const [officialRemark, setOfficialRemark] = useState('');

  // Citizen satisfaction review state
  const [starRating, setStarRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // AI & Receipt states
  const [aiLoading, setAiLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleGenerateAIResponse = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId: complaint.id, context: officialRemark })
      });
      if (!res.ok) throw new Error('API failed to generate reply');
      const data = await res.json();
      setOfficialRemark(data.replyText);
    } catch (e) {
      console.error(e);
      setOfficialRemark(`Dear ${complaint.complainantName},\n\nWe have analyzed your grievance regarding "${complaint.title}" (Tracking ID: ${complaint.trackingId}). An investigation is officially underway by the ${complaint.department} division. We will keep you updated.`);
    } finally {
      setAiLoading(false);
    }
  };

  const messengerBottomRef = useRef<HTMLDivElement>(null);

  // Fetch candidate official users for assignments
  useEffect(() => {
    async function loadOfficials() {
      try {
        const users = await fetchQuickUsers();
        // Filter officials or admins
        const assignedPool = users.filter(u => u.role === 'official' || u.role === 'admin');
        setOfficers(assignedPool);
      } catch (e) {
        console.error('Error fetching officer list', e);
      }
    }
    loadOfficials();
  }, []);

  // Auto-scroll discussion comments
  useEffect(() => {
    messengerBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [complaint.messages]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComplaintMessage(complaint.id, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: commentText.trim()
      });
      setCommentText('');
      
      // Refresh local view
      const updated = { ...complaint };
      updated.messages.push({
        id: Math.random().toString(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: commentText.trim(),
        timestamp: new Date().toISOString()
      });
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfficialAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const updated = await updateComplaint(complaint.id, {
        status: selectedStatus,
        assignedTo: selectedOfficer || undefined,
        updaterName: currentUser.name,
        updaterRole: currentUser.role
      });
      
      // If administrative remark text is added, append it as a comment in messenger too
      if (officialRemark.trim()) {
        await addComplaintMessage(complaint.id, {
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: `[OFFICIAL REMARK] ${officialRemark.trim()}`
        });
        setOfficialRemark('');
      }

      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCitizenFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateComplaint(complaint.id, {
        rating: starRating,
        feedback: feedbackText.trim() || 'No additional comments provided.',
        updaterName: currentUser.name,
        updaterRole: currentUser.role
      });
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const isAdminOrOfficial = currentUser.role === 'admin' || currentUser.role === 'official';
  const isAssignedOfficer = complaint.assignedTo === currentUser.id;
  const canPerformOfficialUpdates = currentUser.role === 'admin' || (currentUser.role === 'official' && isAssignedOfficer);
  const statusDetails = STATUS_LABELS[complaint.status];

  const getStatusLabel = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending': return t.action_required;
      case 'under_review': return t.under_review;
      case 'in_progress': return t.in_progress;
      case 'resolved': return t.resolved;
      case 'rejected': return t.declined;
      default: return status;
    }
  };

  return (
    <div className="space-y-6" id="complaint-details-view">
      {/* Back Header navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-lg text-slate-600 hover:text-slate-900 transition-all font-semibold text-[10px] uppercase cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-600" /> Print Receipt
          </button>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-medium">Ticket ID</span>
          <p className="font-mono text-sm font-bold text-slate-800">{complaint.trackingId}</p>
        </div>
      </div>

      {/* Main Grid: Details + Timeline (Left) & Chat/Action (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area (Details & Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            
            {/* Title & Badge */}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-slate-800">{complaint.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusDetails.color} ${statusDetails.bg} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDetails.dot}`} />
                    {getStatusLabel(complaint.status)}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${PRIORITY_LABELS[complaint.priority]}`}>
                    {complaint.priority} priority
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/50 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" /> {complaint.category}
                  </span>
                </div>
              </div>
              
              <div className="text-right text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
                <span className="block text-[10px] mt-0.5 text-slate-400">Filed by {complaint.complainantName}</span>
              </div>
            </div>

            {/* Description Text */}
            <div className="pt-4 border-t border-slate-50">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Description</h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{complaint.description}</p>
            </div>

            {/* Location block */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Incident Site Address</span>
                  <p className="text-slate-800 font-medium mt-0.5">{complaint.location}</p>
                </div>
              </div>
              {complaint.landmark && (
                <div className="flex items-start gap-2">
                  <Landmark className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Location Landmark</span>
                    <p className="text-slate-800 font-medium mt-0.5">{complaint.landmark}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Attachment thumbnail */}
            {complaint.attachment && (
              <div className="pt-4 border-t border-slate-50">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Visual Proof Attached</h4>
                <div className="relative rounded-xl overflow-hidden border border-slate-100 max-h-80 bg-slate-100 group">
                  <img 
                    src={complaint.attachment} 
                    alt="Proof attachment" 
                    className="w-full h-full object-contain max-h-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-xs text-white px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3.5 h-3.5" /> High-Resolution Photo
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vertical Tracking Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" /> Municipal Investigation Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 pt-2">
              {complaint.timeline.map((event, index) => {
                const isLatest = index === complaint.timeline.length - 1;
                const badge = STATUS_LABELS[event.status];
                
                return (
                  <div key={event.id} className="relative">
                    {/* Circle timeline dot */}
                    <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white ${badge.dot} ${isLatest ? 'pulse-dot' : ''}`} />
                    
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className={`text-xs font-bold ${isLatest ? 'text-slate-800 font-bold' : 'text-slate-600 font-semibold'}`}>
                          {event.title}
                        </h4>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{event.description}</p>
                        <span className="inline-block text-[9px] mt-1.5 px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 font-medium rounded-sm">
                          By: {event.updatedBy}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area (Action / Chat Panel) */}
        <div className="space-y-6">
          
          {/* Action Box: Admin Assign/Status controls */}
          {isAdminOrOfficial && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4" id="official-action-control-panel">
              <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-cyan-600" />
                <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Official Action Dashboard</h3>
              </div>

              {!canPerformOfficialUpdates ? (
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Only the assigned investigating official ({complaint.assignedToName || 'Admin'}) can change status.</span>
                </div>
              ) : (
                <form onSubmit={handleOfficialAction} className="space-y-4">
                  {/* Status update */}
                  <div>
                    <label htmlFor="select-status" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Update Case Status
                    </label>
                    <select
                      id="select-status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors font-sans"
                    >
                      <option value="pending">{t.action_required} (Pending)</option>
                      <option value="under_review">{t.under_review}</option>
                      <option value="in_progress">{t.in_progress}</option>
                      <option value="resolved">{t.resolved}</option>
                      <option value="rejected">{t.declined}</option>
                    </select>
                  </div>

                  {/* Officer Assignment (Only Admin can re-assign across officials) */}
                  {currentUser.role === 'admin' && (
                    <div>
                      <label htmlFor="select-officer" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Assign Official Investigator
                      </label>
                      <select
                        id="select-officer"
                        value={selectedOfficer}
                        onChange={(e) => setSelectedOfficer(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors"
                      >
                        <option value="">-- Unassigned (Keep Pool) --</option>
                        {officers.map(off => (
                          <option key={off.id} value={off.id}>
                            {off.name} ({off.role === 'admin' ? 'Admin' : off.department})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Optional remark */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="official-remark" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Add Official Remark (Timeline)
                      </label>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleGenerateAIResponse}
                        className="text-[9px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {aiLoading ? (
                          <>
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Drafting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5" /> Draft Auto-Reply
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      id="official-remark"
                      value={officialRemark}
                      onChange={(e) => setOfficialRemark(e.target.value)}
                      placeholder="Explain action taken, parts required, timeline, or reason for closure..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="w-full py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {updatingStatus ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Updates...
                      </>
                    ) : (
                      'Save Administrative Action'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Citizen Rating & Review (Only Complainant can rate when Resolved) */}
          {complaint.status === 'resolved' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4" id="citizen-feedback-panel">
              <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
                <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Citizen Resolution Survey</h3>
              </div>

              {complaint.rating ? (
                // Feedback registered already
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`w-5 h-5 ${idx < (complaint.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Verified Citizen Feedback</span>
                    <p className="text-slate-700 text-xs italic mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{complaint.feedback}"
                    </p>
                  </div>
                </div>
              ) : currentUser.id === complaint.complainantId ? (
                // Citizen can submit feedback
                <form onSubmit={handleCitizenFeedback} className="space-y-4">
                  <p className="text-slate-500 text-xs">This complaint has been marked as resolved. Please rate the speed and effectiveness of this service.</p>
                  
                  {/* Stars rating */}
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const ratingVal = idx + 1;
                      const active = ratingVal <= (hoveredStar ?? starRating);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onMouseEnter={() => setHoveredStar(ratingVal)}
                          onMouseLeave={() => setHoveredStar(null)}
                          onClick={() => setStarRating(ratingVal)}
                          className="text-slate-200 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-7 h-7 ${active ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label htmlFor="feedback-comment" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Your Comments (Optional)
                    </label>
                    <textarea
                      id="feedback-comment"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What was great? How could our municipal department improve execution?"
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Submit Resolution Review
                  </button>
                </form>
              ) : (
                // General user sees "Pending Feedback"
                <div className="p-3 bg-slate-50 text-slate-500 rounded-xl text-xs text-center border border-slate-200/50">
                  Awaiting feedback from citizen complainant.
                </div>
              )}
            </div>
          )}

          {/* Discussion Messenger (Live Chat) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[400px]" id="complaint-chat-messenger">
            {/* Chat header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600" />
                <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Grievance Discussion</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] text-slate-400 border border-slate-200/40 font-semibold uppercase">
                {complaint.messages.length} comments
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-container">
              {complaint.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="w-8 h-8 text-slate-200 mb-1" />
                  <p className="text-xs text-slate-400 font-medium">No official messages yet.</p>
                  <p className="text-[10px] text-slate-400/80 max-w-xs mt-1">Start discussion below regarding site investigations or updates.</p>
                </div>
              ) : (
                complaint.messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isOfficial = msg.senderRole === 'official' || msg.senderRole === 'admin';
                  const isSystemRemark = msg.text.startsWith('[OFFICIAL REMARK]');
                  const cleanText = isSystemRemark ? msg.text.replace('[OFFICIAL REMARK]', '') : msg.text;

                  if (isSystemRemark) {
                    return (
                      <div key={msg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Administrative Update
                        </span>
                        <p className="text-slate-600 text-xs mt-1 font-medium italic">{cleanText}</p>
                        <span className="block text-[9px] text-slate-400 mt-1">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      {/* Message sender label */}
                      <span className="text-[9px] text-slate-400 font-medium mb-1">
                        {msg.senderName} 
                        {isOfficial && (
                          <span className="ml-1 px-1 py-0.2 bg-cyan-50 border border-cyan-100 text-[8px] text-cyan-600 font-semibold rounded">
                            Official
                          </span>
                        )}
                      </span>

                      {/* Chat text box */}
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                        isMe 
                          ? 'bg-slate-800 text-white rounded-br-none' 
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/40'
                      }`}>
                        <p className="whitespace-pre-line">{cleanText}</p>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[9px] text-slate-400 font-medium mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messengerBottomRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handlePostComment} className="p-3 border-t border-slate-50 bg-slate-50 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-600 transition-colors placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Printable QR Code Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 p-6 shadow-2xl text-slate-800 space-y-6 animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-display font-bold text-slate-800 text-sm">Download QR Receipt</h4>
              <button 
                onClick={() => setShowReceipt(false)} 
                className="text-slate-400 hover:text-slate-800 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Printable Receipt Layout */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-4 text-center bg-slate-50/50" id="printable-receipt">
              <div className="space-y-1">
                <h5 className="font-bold font-display text-xs tracking-tight text-slate-800">CIVIC_NETWORK PORTAL</h5>
                <p className="text-[8px] text-slate-400 uppercase font-mono tracking-widest">OFFICIAL RECEIPT PROOF</p>
              </div>
              
              <div className="p-2 bg-white rounded-lg inline-block border border-slate-200/40">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${complaint.trackingId}`} 
                  alt="Tracking QR" 
                  className="w-32 h-32 mx-auto"
                />
              </div>
              
              <div className="space-y-1 text-[11px] text-slate-600 font-medium">
                <p className="font-bold text-slate-800 font-mono">ID: {complaint.trackingId}</p>
                <p className="truncate px-2">Title: "{complaint.title}"</p>
                <p>Dept: {complaint.department}</p>
                <p className="text-[9px] text-slate-400">Filed on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print PDF
              </button>
              <button 
                onClick={() => setShowReceipt(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
