/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, AlertCircle, Clock, CheckCircle2, XOctagon, 
  Plus, Search, Filter, LogOut, ChevronRight, MapPin, Building, Calendar,
  Shield, Check, UserPlus, Info, RefreshCw, BarChart3, HelpCircle, Languages
} from 'lucide-react';
import { fetchComplaints, fetchQuickUsers, loginUser, registerUser } from './lib/api';
import { Complaint, User, ComplaintStatus, ComplaintPriority } from './types';
import StatsDashboard from './components/StatsDashboard';
import ComplaintForm from './components/ComplaintForm';
import ComplaintDetails from './components/ComplaintDetails';
import { LANGUAGES, TRANSLATIONS } from './lib/translations';
import AIChatbot from './components/AIChatbot';

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Awaiting Action', bg: 'bg-red-50', text: 'text-red-700 border-red-100', dot: 'bg-red-500' },
  under_review: { label: 'Under Review', bg: 'bg-cyan-50', text: 'text-cyan-700 border-cyan-100', dot: 'bg-cyan-500' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700 border-amber-100', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved & Closed', bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  rejected: { label: 'Declined', bg: 'bg-slate-50', text: 'text-slate-700 border-slate-100', dot: 'bg-slate-500' }
};

const PRIORITY_BADGES: Record<ComplaintPriority, string> = {
  high: 'bg-red-100 text-red-800 border-red-200/50',
  medium: 'bg-amber-100 text-amber-800 border-amber-200/50',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200/50'
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [quickUsers, setQuickUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const t = TRANSLATIONS[currentLang];

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isRtl = LANGUAGES[currentLang]?.rtl || false;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => {
      setIsOnline(true);
      handleRefreshList();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Navigation & Tabs
  const [currentTab, setCurrentTab] = useState<'tickets' | 'analytics'>('tickets');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isLodgeOpen, setIsLodgeOpen] = useState(false);

  // Authentication Fields (Manual Entry)
  const [manualEmail, setManualEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('citizen');
  const [regDept, setRegDept] = useState('Water Supply');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Load Initial Authentication & Config
  useEffect(() => {
    async function loadAuth() {
      try {
        const users = await fetchQuickUsers();
        setQuickUsers(users);
        
        // Auto-login citizen for fast preview evaluation
        const citizenUser = users.find(u => u.role === 'citizen') || users[0];
        if (citizenUser) {
          setCurrentUser(citizenUser);
        }
      } catch (err: any) {
        console.error(err);
        setError('Connection error: backend api is offline');
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, []);

  // Fetch Complaints when current user or filter updates
  useEffect(() => {
    if (!currentUser) return;
    
    async function loadComplaints() {
      setLoadingComplaints(true);
      try {
        const filterParams: any = {};
        
        if (currentUser.role === 'citizen') {
          filterParams.complainantId = currentUser.id;
        } else if (currentUser.role === 'official') {
          filterParams.assignedTo = currentUser.id;
        }
        
        const list = await fetchComplaints(filterParams);
        setComplaints(list);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoadingComplaints(false);
      }
    }
    
    loadComplaints();
  }, [currentUser]);

  // Handle User Quick Selection
  const handleQuickLogin = async (user: User) => {
    setCurrentUser(user);
    setSelectedComplaint(null);
    setIsLodgeOpen(false);
  };

  // Handle Manual Log In
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    setAuthError(null);
    try {
      const user = await loginUser(manualEmail.trim());
      setCurrentUser(user);
    } catch (err: any) {
      setAuthError('Failed to sign in. Please check your credentials.');
    }
  };

  // Handle Manual Register
  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setAuthError('Please fill in Name and Email fields.');
      return;
    }
    setAuthError(null);
    try {
      const user = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        department: regRole === 'official' ? regDept : undefined
      });
      setCurrentUser(user);
      setIsRegistering(false);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    }
  };

  // Logout action
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedComplaint(null);
    setIsLodgeOpen(false);
  };

  // Refresh current list of complaints
  const handleRefreshList = async () => {
    if (!currentUser) return;
    setLoadingComplaints(true);
    try {
      const filterParams: any = {};
      if (currentUser.role === 'citizen') filterParams.complainantId = currentUser.id;
      else if (currentUser.role === 'official') filterParams.assignedTo = currentUser.id;
      
      const list = await fetchComplaints(filterParams);
      setComplaints(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Active list filters
  const filteredComplaints = complaints.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesDept = deptFilter === 'all' || ticket.department === deptFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-sm">
            <ClipboardList className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-800">Online Complaint Registration</h1>
            <p className="text-xs text-slate-400 mt-1">Connecting municipal networks with rapid service</p>
          </div>
          <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full animate-progress" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans" id="app-root-container" dir={LANGUAGES[currentLang].rtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Header */}
      <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs" id="main-app-header">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-xs">
            <ClipboardList className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight font-display text-slate-800">{t.title}</h1>
            <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest mt-0.5">{t.subtitle}</p>
          </div>

          <div className="h-6 w-[1px] bg-slate-100 hidden sm:block mx-2" />

          {/* Multilingual Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 rounded-xl px-2.5 py-1.5 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors cursor-pointer text-xs relative group font-semibold">
            <Languages className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">{LANGUAGES[currentLang].native}</span>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Change Language"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Connectivity Badge (PWA Sync Support) */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 rounded-xl px-2.5 py-1.5 text-slate-600 text-xs font-semibold select-none" title="All operations run securely locally with automatic offline caching and synchronizations">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-700 font-bold tracking-tight text-[10px] uppercase font-mono">
              {isOnline ? 'Online Sync' : 'Offline Cache'}
            </span>
          </div>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-4" id="header-user-status-widget">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center justify-end gap-1">
                {currentUser.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3 text-cyan-600" /> Administrative Lead
                  </>
                ) : currentUser.role === 'official' ? (
                  `Official: ${currentUser.department}`
                ) : (
                  'Citizen Portal'
                )}
              </span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-100" />
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Logout session"
              id="btn-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Anonymous Shell</span>
          </div>
        )}
      </header>

      {!currentUser ? (
        // Auth Page
        <div className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex flex-col justify-center space-y-8" id="auth-box-section">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-display text-slate-800 tracking-tight">Access Municipal System</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Select a pre-configured team member or sign in manually to lodge and manage grievances.</p>
          </div>

          {/* Quick profile switch for testing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> Select Team Member Profile
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {quickUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/40 hover:border-slate-300 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                      user.role === 'admin' ? 'bg-cyan-100 text-cyan-700' :
                      user.role === 'official' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {user.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950">{user.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {user.role} {user.department ? `(${user.department})` : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Manual Auth Form Toggle */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-all cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need a custom profile? Create Account'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isRegistering ? (
              // Custom Registration
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleManualRegister}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4"
              >
                <h4 className="text-sm font-bold text-slate-800">Register Custom Member</h4>
                {authError && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">{authError}</div>}
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="reg-name" className="block text-slate-500 font-semibold mb-1">Full Name</label>
                    <input
                      id="reg-name"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sravan Kumar"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-slate-500 font-semibold mb-1">Email Address</label>
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. sravan@municipality.gov"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-role" className="block text-slate-500 font-semibold mb-1">System Role</label>
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 cursor-pointer"
                      >
                        <option value="citizen">Citizen (Complainant)</option>
                        <option value="official">Department Official</option>
                        <option value="admin">Admin Manager</option>
                      </select>
                    </div>

                    {regRole === 'official' && (
                      <div>
                        <label htmlFor="reg-dept" className="block text-slate-500 font-semibold mb-1">Department Assigned</label>
                        <select
                          id="reg-dept"
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 cursor-pointer"
                        >
                          <option value="Water Supply">Water Supply</option>
                          <option value="Sanitation & Waste">Sanitation & Waste</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                          <option value="Public Safety">Public Safety</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Create and Sign In
                </button>
              </motion.form>
            ) : (
              // Manual Sign In
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleManualLogin}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4"
              >
                <h4 className="text-sm font-bold text-slate-800">Login via Email</h4>
                {authError && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">{authError}</div>}
                
                <div className="text-xs">
                  <label htmlFor="login-email" className="block text-slate-500 font-semibold mb-1">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. bommanaboinasravankumar2@gmail.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // Application Dashboard Layout
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8" id="dashboard-main-shell">
          
          {/* Left Menu / Sidebar controls */}
          <aside className="lg:w-64 flex flex-col gap-4 flex-shrink-0">
            {/* Quick Profile Panel */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center uppercase">
                  {currentUser.name.substring(0,2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</h4>
                  <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">{currentUser.email}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                Registered on: {new Date(currentUser.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1.5" id="nav-navigation-menu">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    setCurrentTab('analytics');
                    setSelectedComplaint(null);
                    setIsLodgeOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    currentTab === 'analytics' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Overview Analytics
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentTab('tickets');
                  setSelectedComplaint(null);
                  setIsLodgeOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                  currentTab === 'tickets' && !isLodgeOpen && !selectedComplaint
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4" /> 
                  {currentUser.role === 'citizen' ? t.my_grievances : t.queue_title}
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 rounded-md border border-slate-200/40 font-mono">
                  {complaints.length}
                </span>
              </button>

              {currentUser.role === 'citizen' && (
                <button
                  onClick={() => {
                    setIsLodgeOpen(true);
                    setSelectedComplaint(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    isLodgeOpen 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  <Plus className="w-4 h-4" /> {t.lodge_complaint}
                </button>
              )}
            </nav>

            {/* Quick Testing helper panel */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40 mt-auto space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" /> Switch Roles
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed">Instantly switch profiles to evaluate the different Citizen, Official, and Admin states:</p>
              
              <div className="space-y-1">
                {quickUsers.filter(u => u.id !== currentUser.id).slice(0, 3).map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="w-full text-left p-1.5 bg-white border border-slate-200/40 hover:border-slate-300 rounded-lg text-[10px] font-semibold text-slate-600 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{user.name.split(' ')[0]} ({user.role})</span>
                    <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Area (Content Dynamic Section) */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isLodgeOpen && currentUser.role === 'citizen' ? (
                // New ticket lodging
                <motion.div
                  key="lodge-screen"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <ComplaintForm
                    currentUser={currentUser}
                    onCancel={() => setIsLodgeOpen(false)}
                    t={t}
                    currentLang={currentLang}
                    onSuccess={(newTicket) => {
                      setComplaints([newTicket, ...complaints]);
                      setIsLodgeOpen(false);
                      setSelectedComplaint(newTicket);
                    }}
                  />
                </motion.div>
              ) : selectedComplaint ? (
                // View specific ticket
                <motion.div
                  key="details-screen"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <ComplaintDetails
                    complaint={selectedComplaint}
                    currentUser={currentUser}
                    t={t}
                    currentLang={currentLang}
                    onBack={() => {
                      setSelectedComplaint(null);
                      handleRefreshList();
                    }}
                    onUpdate={(updated) => {
                      setSelectedComplaint(updated);
                      // Update complaint locally inside lists
                      setComplaints(complaints.map(c => c.id === updated.id ? updated : c));
                    }}
                  />
                </motion.div>
              ) : currentTab === 'analytics' && currentUser.role === 'admin' ? (
                // Overview analytics
                <motion.div
                  key="analytics-screen"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <StatsDashboard />
                </motion.div>
              ) : (
                // Ticket list queue view
                <motion.div
                  key="list-screen"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Search & Filter Header bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4" id="list-filtering-controls">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold font-display text-slate-800">
                          {currentUser.role === 'citizen' ? 'My Filed Grievances' : 'Municipal Grievances Queue'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {currentUser.role === 'citizen' 
                            ? 'Track and chat live regarding your submitted complaints' 
                            : currentUser.role === 'official'
                            ? `Tickets assigned to your department (${currentUser.department})`
                            : 'All municipal operations across city wards'
                          }
                        </p>
                      </div>

                      <button
                        onClick={handleRefreshList}
                        className="self-start md:self-auto px-3.5 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        disabled={loadingComplaints}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingComplaints ? 'animate-spin' : ''}`} />
                        Refresh List
                      </button>
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {/* Search box */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t.search_placeholder}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors placeholder-slate-400 font-medium"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      </div>

                      {/* Status Dropdown */}
                      <div>
                        <select
                          id="filter-status"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer focus:outline-none focus:border-cyan-600 font-sans"
                        >
                          <option value="all">{t.status}: All</option>
                          <option value="pending">{t.status}: {t.action_required}</option>
                          <option value="under_review">{t.status}: {t.under_review}</option>
                          <option value="in_progress">{t.status}: {t.in_progress}</option>
                          <option value="resolved">{t.status}: {t.resolved}</option>
                          <option value="rejected">{t.status}: {t.declined}</option>
                        </select>
                      </div>

                      {/* Priority Dropdown */}
                      <div>
                        <select
                          id="filter-priority"
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer focus:outline-none focus:border-cyan-600 font-sans"
                        >
                          <option value="all">{t.priority}: All</option>
                          <option value="high">{t.priority}: High</option>
                          <option value="medium">{t.priority}: Medium</option>
                          <option value="low">{t.priority}: Low</option>
                        </select>
                      </div>

                      {/* Department Dropdown */}
                      <div>
                        <select
                          id="filter-dept"
                          value={deptFilter}
                          onChange={(e) => setDeptFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer focus:outline-none focus:border-cyan-600 font-sans"
                        >
                          <option value="all">{t.department}: All</option>
                          <option value="Water Supply">Water Supply</option>
                          <option value="Sanitation & Waste">Sanitation & Waste</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                          <option value="Public Safety">Public Safety</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Complaint list rows */}
                  <div className="space-y-3" id="complaints-list-items">
                    {loadingComplaints ? (
                      <div className="bg-white py-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
                        <span className="text-xs font-semibold">Loading municipal list database...</span>
                      </div>
                    ) : filteredComplaints.length === 0 ? (
                      <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3 shadow-xs">
                        <ClipboardList className="w-10 h-10 text-slate-200 mx-auto" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">No complaints found</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">There are no complaints matches your active search queries or filters inside the system database.</p>
                        </div>
                        {currentUser.role === 'citizen' && (
                          <button
                            onClick={() => setIsLodgeOpen(true)}
                            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Lodge your First Complaint
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredComplaints.map((ticket, i) => {
                        const statusDetails = STATUS_CONFIG[ticket.status];
                        return (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.03 }}
                            onClick={() => setSelectedComplaint(ticket)}
                            className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative overflow-hidden group"
                          >
                            <div className="space-y-3 max-w-2xl">
                              {/* Header row details */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-cyan-600 transition-colors">
                                  {ticket.trackingId}
                                </span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                  <Building className="w-3 h-3 text-slate-400" /> {ticket.department}
                                </span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                                  {ticket.category}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
                                  {ticket.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                  {ticket.description}
                                </p>
                              </div>

                              {/* Site location & Complainant details */}
                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-medium text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {ticket.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(ticket.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </span>
                                {currentUser.role !== 'citizen' && (
                                  <span className="text-slate-400">
                                    By: {ticket.complainantName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Badges Column */}
                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusDetails.text} ${statusDetails.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDetails.dot}`} />
                                {getStatusLabel(ticket.status)}
                              </span>

                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${PRIORITY_BADGES[ticket.priority]}`}>
                                {ticket.priority} priority
                              </span>

                              {ticket.assignedToName && (
                                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 border border-slate-100 rounded-sm px-1.5 py-0.5">
                                  Assigned: {ticket.assignedToName.split(' ')[0]}
                                </span>
                              )}
                            </div>
                            
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white mt-auto text-center text-xs text-slate-400 font-medium" id="main-app-footer">
        <p>© 2026 Municipal Grievance Network. Managed by Municipal IT Operations & Civic Support.</p>
      </footer>

      {/* Floating AI Concierge Companion */}
      <AIChatbot currentUser={currentUser} t={t} />
    </div>
  );
}
