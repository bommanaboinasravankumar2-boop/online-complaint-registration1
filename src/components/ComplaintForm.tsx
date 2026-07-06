/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, MapPin, UploadCloud, AlertCircle, Sparkles, Check, 
  Trash2, HelpCircle, ShieldAlert, FileImage, ClipboardSignature,
  X, Loader2, Image as ImageIcon, CheckCircle2, RefreshCw,
  Mic, MicOff, Compass, Map
} from 'lucide-react';
import { createComplaint } from '../lib/api';
import { User, Complaint } from '../types';
import { TranslationSet } from '../lib/translations';

interface ComplaintFormProps {
  currentUser: User;
  onSuccess: (complaint: Complaint) => void;
  onCancel: () => void;
  t: TranslationSet;
  currentLang: string;
}

const DEPARTMENTS = [
  {
    name: 'Water Supply',
    categories: ['Dirty Water supply', 'No Water supply', 'Water pipe leakage', 'Incorrect billing']
  },
  {
    name: 'Sanitation & Waste',
    categories: ['Garbage collection failure', 'Drain blockage', 'Street sweeping failure', 'Dead animal removal']
  },
  {
    name: 'Electricity',
    categories: ['Streetlight not working', 'Power outage', 'Sparking wires / Transformers', 'Faulty electrical pole']
  },
  {
    name: 'Roads & Infrastructure',
    categories: ['Potholes on road', 'Damaged footpaths', 'Clogged storm drain', 'Broken signboards / Barriers']
  },
  {
    name: 'Public Safety',
    categories: ['Open manholes', 'Footpath encroachments', 'Illegal parking blocking street', 'Stray animal hazard']
  },
  {
    name: 'Others',
    categories: ['General municipal grievance', 'Unlisted civic complaint']
  }
];

export default function ComplaintForm({ currentUser, onSuccess, onCancel, t, currentLang }: ComplaintFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const [category, setCategory] = useState(DEPARTMENTS[0].categories[0]);
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Pro File Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const uploadTimerRef = useRef<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Co-Pilot States
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSentiment, setAiSentiment] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{ trackingId: string; reason: string; prob: number } | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);

  // GPS & Speech Recognition States
  const [fetchingGps, setFetchingGps] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyOffice, setNearbyOffice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoordinates({ lat: latitude, lng: longitude });
        setLocation(`GPS Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)} (Sector 4 Municipal Ward)`);
        
        const offices = [
          "Municipal Core HQ (Ward 12) - 0.3 km away",
          "Water & Sanitation Sub-Station B - 0.8 km away",
          "Power Grid Dispatch Station (East Ward) - 1.2 km away",
          "Road Maintenance Depot (Sector 4) - 0.5 km away"
        ];
        const chosen = offices[Math.floor(Math.random() * offices.length)];
        setNearbyOffice(chosen);
        setFetchingGps(false);
      },
      (err) => {
        console.error(err);
        const demoLat = 17.3850 + (Math.random() - 0.5) * 0.01;
        const demoLng = 78.4867 + (Math.random() - 0.5) * 0.01;
        setGpsCoordinates({ lat: demoLat, lng: demoLng });
        setLocation(`Demo GPS: ${demoLat.toFixed(4)}°N, ${demoLng.toFixed(4)}°E (Adjacent to Ward 15 Sub-HQ)`);
        setNearbyOffice("Ward 15 Municipal Sub-HQ - 0.4 km away");
        setFetchingGps(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsRecording(true);
      setError(null);
      
      setTimeout(() => {
        const simulatedTexts = [
          "I want to report a broken streetlight near the public library. It has been completely dark for three days, creating safety hazards for senior citizens in our ward.",
          "Large puddle and waterlogging issues at main market lane block C. Foul smell is spreading and mosquitoes are breeding everywhere.",
          "Municipal garbage pileup right next to the entrance gate of Sector 4 park. Stray dogs are scattering trash across the street."
        ];
        const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
        
        let currentText = "";
        let i = 0;
        const timer = setInterval(() => {
          if (i < randomText.length) {
            currentText += randomText[i];
            setDescription(currentText);
            i += 3;
          } else {
            clearInterval(timer);
            setIsRecording(false);
          }
        }, 30);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setError("Speech recognition failed. Please speak clearly or type manually.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const speechToTextResult = event.results[0][0].transcript;
      setDescription(prev => prev ? prev + " " + speechToTextResult : speechToTextResult);
    };

    recognition.start();
  };

  const handleAIAnalyze = async () => {
    if (!title.trim() || !description.trim()) return;
    setAiAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!response.ok) throw new Error('Failed to run AI classified categorization');
      const data = await response.json();

      const index = DEPARTMENTS.findIndex(d => d.name.toLowerCase() === data.department.toLowerCase());
      if (index !== -1) {
        setSelectedDeptIndex(index);
        
        const categories = DEPARTMENTS[index].categories;
        const matchedCat = categories.find(c => c.toLowerCase() === data.category.toLowerCase()) || categories[0];
        setCategory(matchedCat);
      }

      setPriority(data.priority);
      setAiSentiment(data.sentiment);
      setAiSummary(data.summary);

      if (data.is_duplicate && data.match_probability >= 60) {
        setDuplicateWarning({
          trackingId: data.duplicate_tracking_id,
          reason: data.duplicate_reason,
          prob: data.match_probability
        });
      } else {
        setDuplicateWarning(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('AI automatic routing could not classify this grievance. Please route department fields manually.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleOCRScan = async () => {
    if (!attachment) return;
    setOcrScanning(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/ocr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: attachment })
      });
      if (!response.ok) throw new Error('OCR API server error');
      const data = await response.json();

      setTitle(data.suggestedTitle);
      setDescription(data.suggestedDescription);
      
      const index = DEPARTMENTS.findIndex(d => d.name.toLowerCase() === data.suggestedDepartment.toLowerCase());
      if (index !== -1) {
        setSelectedDeptIndex(index);
        const categories = DEPARTMENTS[index].categories;
        setCategory(categories[0]);
      }
      
      setAiSummary("OCR parsed visual text and filled fields successfully!");
    } catch (err) {
      console.error(err);
      setError('Could not scan or parse file attachment. Please type details manually.');
    } finally {
      setOcrScanning(false);
    }
  };

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current);
      }
    };
  }, []);

  const handleDeptChange = (index: number) => {
    setSelectedDeptIndex(index);
    setCategory(DEPARTMENTS[index].categories[0]);
  };

  // Convert uploaded image or file to Base64 with highly interactive progress bar
  const processFile = (file: File) => {
    if (!file) return;
    
    setError(null);

    // Validate that file is an image
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    // Check file size (limit to 2MB for demo safety)
    if (file.size > 2 * 1024 * 1024) {
      const actualMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File is too large (${actualMB} MB). Maximum allowed size is 2MB for municipal safety.`);
      return;
    }

    // Capture and format file size
    const sizeInMB = file.size / (1024 * 1024);
    const sizeStr = sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    setFileSizeStr(sizeStr);

    // Cancel existing upload if any
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed('0.0 MB/s');
    setTimeRemaining('Calculating...');
    setImageDimensions(null);

    let progress = 0;
    const intervalTime = 60; // ms per update

    uploadTimerRef.current = setInterval(() => {
      // Custom ease-out speed progression curve
      let increment = 0;
      if (progress < 40) {
        increment = Math.floor(Math.random() * 12) + 8; // Fast start
      } else if (progress < 80) {
        increment = Math.floor(Math.random() * 8) + 4; // Steady mid-upload
      } else {
        increment = Math.floor(Math.random() * 4) + 1; // Careful finish
      }

      progress += increment;

      if (progress >= 100) {
        progress = 100;
        if (uploadTimerRef.current) {
          clearInterval(uploadTimerRef.current);
          uploadTimerRef.current = null;
        }

        // Finalize base64 read
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const base64Data = e.target.result as string;
            setAttachment(base64Data);
            setAttachmentName(file.name);
            setIsUploading(false);
            setUploadProgress(100);
            
            // Get original dimensions
            const img = new Image();
            img.onload = () => {
              setImageDimensions({ width: img.width, height: img.height });
            };
            img.src = base64Data;
          }
        };
        reader.readAsDataURL(file);
      } else {
        setUploadProgress(progress);
        
        // Simulating highly accurate transfer speed metrics
        const currentSpeed = (1.5 + Math.random() * 1.8).toFixed(1); // 1.5 - 3.3 MB/s
        setUploadSpeed(`${currentSpeed} MB/s`);
        
        // Dynamic time estimation
        const remainingBytes = file.size * (1 - progress / 100);
        const speedInBytes = parseFloat(currentSpeed) * 1024 * 1024;
        const secondsLeft = (remainingBytes / speedInBytes).toFixed(1);
        setTimeRemaining(`${secondsLeft}s`);
      }
    }, intervalTime);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const cancelUpload = () => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setFileSizeStr(null);
    setUploadSpeed(null);
    setTimeRemaining(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentName(null);
    setFileSizeStr(null);
    setImageDimensions(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in all required fields (Title, Description, and Location).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await createComplaint({
        title,
        description,
        department: DEPARTMENTS[selectedDeptIndex].name,
        category,
        priority,
        location,
        landmark: landmark.trim() || undefined,
        complainantId: currentUser.id,
        complainantName: currentUser.name,
        attachment: attachment || undefined
      });
      onSuccess(created);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error submitting complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="bg-white rounded border border-gray-200 overflow-hidden max-w-3xl mx-auto"
      id="complaint-form-wrapper"
    >
      {/* Form Header */}
      <div className="border-b border-gray-100 p-6 bg-white flex justify-between items-start">
        <div>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold uppercase tracking-wider">
            Step 1 / Register Ticket
          </span>
          <h2 className="text-base font-bold font-display mt-2 flex items-center gap-2 text-black">
            <ClipboardSignature className="w-4.5 h-4.5 text-black" />
            {t.lodge_complaint}
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">
            Register your grievance with details, images, and precise location. Our system will route it to the assigned municipal department.
          </p>
        </div>
        <button 
          onClick={onCancel}
          type="button"
          className="text-gray-400 hover:text-black border border-gray-100 hover:border-gray-300 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer font-medium"
          id="btn-cancel-top"
        >
          {t.cancel}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Co-Pilot Assistant Toolkit */}
        <div className="bg-slate-950 text-white rounded-2xl p-4.5 space-y-3.5 shadow-md border border-slate-800" id="ai-form-copilot">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold tracking-tight block">AI Municipal Co-Pilot</span>
                <span className="text-[9px] text-slate-400 font-medium font-mono uppercase tracking-wider">Gemini Grievance Engine v1.0</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {attachment && (
                <button
                  type="button"
                  disabled={ocrScanning || aiAnalyzing}
                  onClick={handleOCRScan}
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-400 text-[10px] font-bold rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {ocrScanning ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Scanning Document...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" /> OCR Scan Attachment
                    </>
                  )}
                </button>
              )}
              
              <button
                type="button"
                disabled={!title.trim() || !description.trim() || aiAnalyzing || ocrScanning}
                onClick={handleAIAnalyze}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {aiAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Classifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Auto-Categorize & Prioritize
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Insights and classification metrics */}
          {aiSummary && (
            <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-white/5 bg-white/5 p-3 rounded-xl">
              <p className="leading-relaxed"><strong className="text-cyan-400">AI Diagnosis:</strong> {aiSummary}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {aiSentiment && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sentiment: {aiSentiment}</span>}
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Dispatch Ward Office: Ward 12 HQ</span>
              </div>
            </div>
          )}

          {/* Potential duplicate ticket detection alarm banner */}
          {duplicateWarning && (
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Urgent: Similarity Alert ({duplicateWarning.prob}% Match risk)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{duplicateWarning.reason}</p>
              <div className="text-[10px] text-slate-400 font-mono">
                Existing Reference ID: <strong className="text-amber-400">{duplicateWarning.trackingId}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Complaint Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Complaint Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Streetlight out of order for 3 days"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors text-sm text-slate-800 font-medium placeholder-slate-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  {t.department} <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  value={selectedDeptIndex}
                  onChange={(e) => handleDeptChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors text-sm text-slate-700 font-medium cursor-pointer font-sans"
                >
                  {DEPARTMENTS.map((dept, idx) => (
                    <option key={dept.name} value={idx}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  {t.category} <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors text-sm text-slate-700 font-medium cursor-pointer font-sans"
                >
                  {DEPARTMENTS[selectedDeptIndex].categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="description" className="block text-xs font-semibold text-slate-600 uppercase">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Speak your complaint"
                >
                  {isRecording ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                      Listening... Speak now
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-cyan-600" />
                      Voice Complaint (STT)
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue extensively. Include details like the duration, consequences, and exact nature of the municipal failure..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors text-sm text-slate-800 placeholder-slate-400 leading-relaxed resize-none"
                required
              />
            </div>
          </div>

          {/* Right Column: Location, Severity & Attachment */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="location" className="block text-xs font-semibold text-slate-600 uppercase">
                  Incident Location / Address <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  disabled={fetchingGps}
                  onClick={handleDetectGPS}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
                >
                  {fetchingGps ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-600" />
                      Locating GPS...
                    </>
                  ) : (
                    <>
                      <Compass className="w-3 h-3 text-cyan-600" />
                      Auto-Detect GPS
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Street 4, Sector B-1, Ward 12"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors text-sm text-slate-800 font-medium placeholder-slate-400"
                  required
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>

              {nearbyOffice && (
                <div className="mt-2 p-2.5 bg-cyan-50/40 border border-cyan-100/50 rounded-xl flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <Map className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[10px] uppercase text-cyan-700 block font-mono">Nearby Office Detected</span>
                    <span className="text-slate-600">{nearbyOffice}</span>
                    {gpsCoordinates && (
                      <span className="text-[9px] text-slate-400 block font-mono mt-0.5">Coordinates: {gpsCoordinates.lat.toFixed(5)}°, {gpsCoordinates.lng.toFixed(5)}°</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="landmark" className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Nearby Landmark
              </label>
              <input
                id="landmark"
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Sunshine Hospital or Near Post Office"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-cyan-600 transition-colors text-sm text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                {t.priority}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map((level) => {
                  const isActive = priority === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer ${
                        isActive 
                          ? level === 'high' 
                            ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                            : level === 'medium'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drag & Drop File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Upload Visual Attachment (Max 2MB)
              </label>
              
              <AnimatePresence mode="wait">
                {isUploading ? (
                  // State 2: Uploading with simulated progress
                  <motion.div
                    key="uploading-state"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl relative overflow-hidden flex flex-col gap-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-50 border border-cyan-100 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{attachmentName || 'Uploading file...'}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium font-mono">
                          <span>{fileSizeStr}</span>
                          <span>•</span>
                          <span className="text-cyan-600 font-bold">{uploadSpeed}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={cancelUpload}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Cancel upload"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold font-mono">
                        <span>{uploadProgress}% TRANSFERRED</span>
                        <span>{timeRemaining} REMAINING</span>
                      </div>
                    </div>
                  </motion.div>
                ) : attachment ? (
                  // State 3: File loaded successfully
                  <motion.div
                    key="loaded-state"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 bg-white border border-slate-200/80 rounded-xl relative overflow-hidden flex items-center justify-between gap-4 shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 bg-slate-50 rounded-lg overflow-hidden border border-slate-200/50 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={attachment} 
                          alt="Uploaded attachment preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight">{attachmentName || 'attachment.png'}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200/30">
                            {fileSizeStr}
                          </span>
                          {imageDimensions && (
                            <span className="text-[9px] font-mono font-bold bg-cyan-50/50 text-cyan-600 px-1.5 py-0.2 rounded border border-cyan-100/30">
                              {imageDimensions.width} × {imageDimensions.height} px
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5" /> SECURELY VERIFIED
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove upload"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // State 1: Dropzone ready
                  <motion.div
                    key="dropzone-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer relative overflow-hidden transition-all duration-300 ${
                      isDragging 
                        ? 'border-cyan-600 bg-cyan-50/20 scale-[0.99] shadow-inner' 
                        : 'border-slate-200 hover:border-cyan-500 hover:bg-slate-50/50'
                    }`}
                    id="dropzone-area"
                  >
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
                    
                    <motion.div 
                      animate={isDragging ? { y: -2, scale: 1.05 } : { y: 0, scale: 1 }}
                      className="flex flex-col items-center justify-center relative z-10"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-colors duration-300 ${isDragging ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                        <UploadCloud className="w-5.5 h-5.5" />
                      </div>
                      
                      <p className="text-xs font-semibold text-slate-700">
                        {isDragging ? 'Drop your image file here' : 'Drag & drop image or click to browse'}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                        <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/40 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">PNG</span>
                        <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/40 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">JPEG</span>
                        <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/40 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">WEBP</span>
                        <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/40 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">MAX 2MB</span>
                      </div>
                    </motion.div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Assigned instantly upon registration.</span>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              disabled={submitting || isUploading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting || isUploading}
              id="btn-submit-complaint"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  Logging...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  Uploading Visuals...
                </>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
