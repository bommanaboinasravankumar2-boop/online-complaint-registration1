/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Complaint, User, ComplaintStatus, ComplaintPriority, Message, TimelineEvent } from '../types';

// ==========================================
// SEED DATA FOR OFFLINE / LOCAL STORAGE FALLBACK
// ==========================================

const SEED_USERS: User[] = [
  {
    id: 'citizen-demo',
    name: 'Sravan Kumar (Citizen)',
    email: 'citizen@municipality.gov',
    role: 'citizen',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-1',
    name: 'Bommanaboina Sravan kumar (Team Lead)',
    email: 'bommanaboinasravankumar2@gmail.com',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-1',
    name: 'Manjusree Konduru',
    email: 'kondurumanjusree2005@gmail.com',
    role: 'official',
    department: 'Water Supply',
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-2',
    name: 'Rachana N',
    email: 'rachanavasu7671@gmail.com',
    role: 'official',
    department: 'Sanitation & Waste',
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-3',
    name: 'K Raviteja',
    email: 'techraviteja589@gmail.com',
    role: 'official',
    department: 'Electricity',
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-4',
    name: 'Kommindala Tejasree',
    email: 'teju62509@gmail.com',
    role: 'official',
    department: 'Roads & Infrastructure',
    createdAt: new Date().toISOString()
  }
];

const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-1',
    trackingId: 'COM-492815',
    title: 'Water contamination in Sector 4 block B',
    description: 'The drinking water supply has been coming out brownish and muddy since yesterday morning. It smells highly chlorinated but remains turbid. Highly risky for children and elder residents.',
    department: 'Water Supply',
    category: 'Dirty Water supply',
    priority: 'high',
    status: 'in_progress',
    location: 'Sector 4, Block B, Street 12',
    landmark: 'Opposite Community Center',
    complainantId: 'citizen-demo',
    complainantName: 'Sravan Kumar (Citizen)',
    assignedTo: 'official-1',
    assignedToName: 'Manjusree Konduru',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    timeline: [
      {
        id: 't-1',
        status: 'pending',
        title: 'Complaint Registered',
        description: 'Your complaint has been successfully registered in the system.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'System'
      },
      {
        id: 't-2',
        status: 'under_review',
        title: 'Assigned to Department',
        description: 'Administrator routed this complaint to the Water Supply Department.',
        timestamp: new Date(Date.now() - 1.8 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Bommanaboina Sravan kumar'
      },
      {
        id: 't-3',
        status: 'in_progress',
        title: 'Investigation Initiated',
        description: 'Officer assigned to inspect water lines and flush secondary lines.',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Manjusree Konduru'
      }
    ],
    messages: [
      {
        id: 'm-1',
        senderId: 'official-1',
        senderName: 'Manjusree Konduru',
        senderRole: 'official',
        text: 'A plumbing inspection crew will arrive at Street 12 by 2 PM today to check the main water pipe lines. Please ensure someone is available at the street gates.',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'm-2',
        senderId: 'citizen-demo',
        senderName: 'Sravan Kumar (Citizen)',
        senderRole: 'citizen',
        text: 'Thank you! We will alert the security guards to let the crew in directly.',
        timestamp: new Date(Date.now() - 0.9 * 24 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'comp-2',
    trackingId: 'COM-723019',
    title: 'Damaged streetlights causing safety issues',
    description: 'Multiple streetlights along the park road are completely out. It gets extremely dark after 7 PM, making it unsafe for women, children, and evening walkers. High risk of accidents or theft.',
    department: 'Electricity',
    category: 'Streetlight Not Working',
    priority: 'medium',
    status: 'resolved',
    location: 'Parkside Boulevard, Ward 15',
    landmark: 'Adjacent to Sunrise Public Park',
    complainantId: 'citizen-demo',
    complainantName: 'Sravan Kumar (Citizen)',
    assignedTo: 'official-3',
    assignedToName: 'K Raviteja',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString(),
    timeline: [
      {
        id: 't-11',
        status: 'pending',
        title: 'Complaint Registered',
        description: 'Successfully registered in system.',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'System'
      },
      {
        id: 't-12',
        status: 'under_review',
        title: 'Under Review',
        description: 'Assigned to Electrical maintenance division.',
        timestamp: new Date(Date.now() - 4.5 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Bommanaboina Sravan kumar'
      },
      {
        id: 't-13',
        status: 'in_progress',
        title: 'Technical Inspection',
        description: 'Replacement bulbs and cable checking allocated to lineman team.',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'K Raviteja'
      },
      {
        id: 't-14',
        status: 'resolved',
        title: 'Fitted and Verified',
        description: 'Line repairs completed and 4 LED streetlight bulbs successfully replaced.',
        timestamp: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'K Raviteja'
      }
    ],
    messages: [
      {
        id: 'm-11',
        senderId: 'official-3',
        senderName: 'K Raviteja',
        senderRole: 'official',
        text: 'The streetlight fixture replacement has been completed. The LED fittings should operate automatically at dusk.',
        timestamp: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString()
      }
    ],
    rating: 5,
    feedback: 'Excellent response and speedy resolution! The park road is fully illuminated now.'
  },
  {
    id: 'comp-3',
    trackingId: 'COM-883192',
    title: 'Garbage dump pile-up on corner plot',
    description: 'No municipal truck has visited for over a week. Strays are scattering waste across the road causing severe odor and unhygienic conditions.',
    department: 'Sanitation & Waste',
    category: 'Garbage Collection Failure',
    priority: 'medium',
    status: 'pending',
    location: 'Main Bazar Crossing, Block C',
    landmark: 'Behind Royal Sweets Shop',
    complainantId: 'citizen-demo',
    complainantName: 'Sravan Kumar (Citizen)',
    createdAt: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString(),
    timeline: [
      {
        id: 't-21',
        status: 'pending',
        title: 'Complaint Logged',
        description: 'Successfully submitted. Awaiting admin assignment.',
        timestamp: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString(),
        updatedBy: 'System'
      }
    ],
    messages: []
  }
];

// ==========================================
// LOCAL STORAGE HELPER UTILITIES
// ==========================================

function getLocalUsers(): User[] {
  if (typeof window === 'undefined') return SEED_USERS;
  const stored = localStorage.getItem('civic_users');
  if (!stored) {
    localStorage.setItem('civic_users', JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  return JSON.parse(stored);
}

function saveLocalUsers(users: User[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civic_users', JSON.stringify(users));
  }
}

function getLocalComplaints(): Complaint[] {
  if (typeof window === 'undefined') return SEED_COMPLAINTS;
  const stored = localStorage.getItem('civic_complaints');
  if (!stored) {
    localStorage.setItem('civic_complaints', JSON.stringify(SEED_COMPLAINTS));
    return SEED_COMPLAINTS;
  }
  return JSON.parse(stored);
}

function saveLocalComplaints(complaints: Complaint[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civic_complaints', JSON.stringify(complaints));
  }
}

// ==========================================
// DYNAMIC DUAL-MODE API CLIENT
// ==========================================

let isLocalFallbackActive = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('github.io') ||
  localStorage.getItem('api_fallback_mode') === 'true'
);

async function runWithFallback<T>(apiCall: () => Promise<T>, fallbackCall: () => T): Promise<T> {
  if (isLocalFallbackActive) {
    return fallbackCall();
  }
  try {
    return await apiCall();
  } catch (err) {
    console.warn("Backend API is offline or unreachable. Entering client-only localStorage fallback mode.", err);
    isLocalFallbackActive = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_fallback_mode', 'true');
    }
    return fallbackCall();
  }
}

// ==========================================
// CORE API OPERATIONS
// ==========================================

export async function fetchStats() {
  return runWithFallback(
    async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    () => {
      const complaints = getLocalComplaints();
      const users = getLocalUsers();

      const total = complaints.length;
      const pending = complaints.filter(c => c.status === 'pending').length;
      const underReview = complaints.filter(c => c.status === 'under_review').length;
      const inProgress = complaints.filter(c => c.status === 'in_progress').length;
      const resolved = complaints.filter(c => c.status === 'resolved').length;
      const rejected = complaints.filter(c => c.status === 'rejected').length;

      const departments = ['Water Supply', 'Sanitation & Waste', 'Electricity', 'Roads & Infrastructure', 'Public Safety', 'Others'];
      const departmentStats = departments.map(dept => {
        const deptComplaints = complaints.filter(c => c.department.toLowerCase() === dept.toLowerCase());
        return {
          name: dept,
          count: deptComplaints.length,
          resolved: deptComplaints.filter(c => c.status === 'resolved').length
        };
      });

      const priorityStats = (['low', 'medium', 'high'] as ComplaintPriority[]).map(pri => ({
        priority: pri.toUpperCase(),
        count: complaints.filter(c => c.priority === pri).length
      }));

      const officials = users.filter(u => u.role === 'official');
      const teamWorkload = officials.map(off => {
        const assignedComplaints = complaints.filter(c => c.assignedTo === off.id);
        return {
          name: off.name,
          role: off.department || 'Officer',
          email: off.email,
          assignedCount: assignedComplaints.length,
          resolvedCount: assignedComplaints.filter(c => c.status === 'resolved').length,
          pendingCount: assignedComplaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length
        };
      });

      // Simple time-series generator for Recharts
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const trendStats = last7Days.map(dateStr => {
        const dailyComplaints = complaints.filter(c => c.createdAt.startsWith(dateStr));
        return {
          date: dateStr.substring(5), // MM-DD format
          count: dailyComplaints.length,
          resolved: dailyComplaints.filter(c => c.status === 'resolved').length
        };
      });

      return {
        summary: { total, pending, underReview, inProgress, resolved, rejected },
        departmentStats,
        priorityStats,
        teamWorkload,
        trendStats
      };
    }
  );
}

export async function fetchComplaints(filters: {
  complainantId?: string;
  assignedTo?: string;
  department?: string;
  status?: string;
} = {}) {
  return runWithFallback(
    async () => {
      const params = new URLSearchParams();
      if (filters.complainantId) params.append('complainantId', filters.complainantId);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      return res.json() as Promise<Complaint[]>;
    },
    () => {
      let complaints = getLocalComplaints();

      if (filters.complainantId) {
        complaints = complaints.filter(c => c.complainantId === filters.complainantId);
      }
      if (filters.assignedTo) {
        complaints = complaints.filter(c => c.assignedTo === filters.assignedTo);
      }
      if (filters.department) {
        complaints = complaints.filter(c => c.department.toLowerCase() === filters.department!.toLowerCase());
      }
      if (filters.status) {
        complaints = complaints.filter(c => c.status === filters.status);
      }

      complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return complaints;
    }
  );
}

export async function fetchComplaintById(id: string) {
  return runWithFallback(
    async () => {
      const res = await fetch(`/api/complaints/${id}`);
      if (!res.ok) throw new Error('Complaint not found');
      return res.json() as Promise<Complaint>;
    },
    () => {
      const complaints = getLocalComplaints();
      const complaint = complaints.find(c => c.id === id);
      if (!complaint) throw new Error('Complaint not found');
      return complaint;
    }
  );
}

export async function createComplaint(complaintData: {
  title: string;
  description: string;
  department: string;
  category: string;
  priority: string;
  location: string;
  landmark?: string;
  complainantId: string;
  complainantName: string;
  attachment?: string;
}) {
  return runWithFallback(
    async () => {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData),
      });
      if (!res.ok) throw new Error('Failed to register complaint');
      return res.json() as Promise<Complaint>;
    },
    () => {
      const trackingId = 'COM-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date().toISOString();

      const newComplaint: Complaint = {
        id: 'comp-' + Math.random().toString(36).substring(2, 11),
        trackingId,
        title: complaintData.title,
        description: complaintData.description,
        department: complaintData.department,
        category: complaintData.category,
        priority: complaintData.priority as ComplaintPriority,
        status: 'pending',
        location: complaintData.location,
        landmark: complaintData.landmark,
        complainantId: complaintData.complainantId,
        complainantName: complaintData.complainantName,
        createdAt: now,
        updatedAt: now,
        attachment: complaintData.attachment,
        timeline: [
          {
            id: 't-' + Math.random().toString(36).substring(2, 11),
            status: 'pending',
            title: 'Complaint Registered',
            description: `Successfully filed under the ${complaintData.department} department.`,
            timestamp: now,
            updatedBy: complaintData.complainantName
          }
        ],
        messages: []
      };

      const complaints = getLocalComplaints();
      complaints.push(newComplaint);
      saveLocalComplaints(complaints);
      return newComplaint;
    }
  );
}

export async function updateComplaint(
  id: string,
  updateData: {
    status?: string;
    assignedTo?: string;
    department?: string;
    rating?: number;
    feedback?: string;
    updaterName: string;
    updaterRole: string;
  }
) {
  return runWithFallback(
    async () => {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update complaint');
      return res.json() as Promise<Complaint>;
    },
    () => {
      const complaints = getLocalComplaints();
      const index = complaints.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Complaint not found');

      const complaint = complaints[index];
      const now = new Date().toISOString();
      const prevStatus = complaint.status;

      if (updateData.rating !== undefined) {
        complaint.rating = updateData.rating;
        complaint.feedback = updateData.feedback;
        complaint.updatedAt = now;
        complaint.timeline.push({
          id: 't-' + Math.random().toString(36).substring(2, 11),
          status: complaint.status,
          title: 'Feedback Provided',
          description: `Complainant submitted a rating of ${updateData.rating}/5.`,
          timestamp: now,
          updatedBy: updateData.updaterName || 'Citizen'
        });
        
        complaints[index] = complaint;
        saveLocalComplaints(complaints);
        return complaint;
      }

      let description = '';

      if (updateData.department && updateData.department !== complaint.department) {
        description += `Re-routed department from ${complaint.department} to ${updateData.department}. `;
        complaint.department = updateData.department;
        if (!updateData.assignedTo) {
          complaint.assignedTo = undefined;
          complaint.assignedToName = undefined;
        }
      }

      if (updateData.assignedTo && updateData.assignedTo !== complaint.assignedTo) {
        const users = getLocalUsers();
        const officer = users.find(u => u.id === updateData.assignedTo);
        if (officer) {
          complaint.assignedTo = officer.id;
          complaint.assignedToName = officer.name;
          description += `Assigned to investigating officer: ${officer.name}. `;
        }
      }

      if (updateData.status && updateData.status !== prevStatus) {
        complaint.status = updateData.status as ComplaintStatus;
        const statusLabels: Record<ComplaintStatus, string> = {
          pending: 'Pending Investigation',
          under_review: 'Under Administrative Review',
          in_progress: 'In Progress / Site Action',
          resolved: 'Resolved & Fixed',
          rejected: 'Closed / Rejected'
        };
        description += `Complaint status changed to: ${statusLabels[updateData.status as ComplaintStatus]}. `;
      }

      if (description) {
        complaint.updatedAt = now;
        complaint.timeline.push({
          id: 't-' + Math.random().toString(36).substring(2, 11),
          status: complaint.status,
          title: updateData.status ? `Status Updated` : `Complaint Updated`,
          description: description.trim(),
          timestamp: now,
          updatedBy: updateData.updaterName || 'Admin'
        });
      }

      complaints[index] = complaint;
      saveLocalComplaints(complaints);
      return complaint;
    }
  );
}

export async function addComplaintMessage(
  id: string,
  messageData: {
    senderId: string;
    senderName: string;
    senderRole: string;
    text: string;
  }
) {
  return runWithFallback(
    async () => {
      const res = await fetch(`/api/complaints/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      if (!res.ok) throw new Error('Failed to send comment');
      return res.json() as Promise<Message>;
    },
    () => {
      const complaints = getLocalComplaints();
      const index = complaints.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Complaint not found');

      const message: Message = {
        id: 'msg-' + Math.random().toString(36).substring(2, 11),
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderRole: messageData.senderRole as any,
        text: messageData.text,
        timestamp: new Date().toISOString()
      };

      complaints[index].messages.push(message);
      complaints[index].updatedAt = new Date().toISOString();
      saveLocalComplaints(complaints);
      return message;
    }
  );
}

export async function fetchQuickUsers() {
  return runWithFallback(
    async () => {
      const res = await fetch('/api/auth/quick-users');
      if (!res.ok) throw new Error('Failed to fetch quick users');
      return res.json() as Promise<User[]>;
    },
    () => {
      return getLocalUsers();
    }
  );
}

export async function loginUser(email: string) {
  return runWithFallback(
    async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      return data.user as User;
    },
    () => {
      const users = getLocalUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        const newUser: User = {
          id: 'user-' + Math.random().toString(36).substring(2, 11),
          name: email.split('@')[0].replace('.', ' '),
          email: email,
          role: 'citizen',
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        saveLocalUsers(users);
        return newUser;
      }

      return user;
    }
  );
}

export async function registerUser(userData: {
  name: string;
  email: string;
  role: string;
  department?: string;
}) {
  return runWithFallback(
    async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Registration failed');
      }
      const data = await res.json();
      return data.user as User;
    },
    () => {
      const users = getLocalUsers();
      const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (exists) {
        throw new Error('User with this email already exists');
      }

      const newUser: User = {
        id: 'user-' + Math.random().toString(36).substring(2, 11),
        name: userData.name,
        email: userData.email,
        role: userData.role as any,
        department: userData.role === 'official' ? userData.department : undefined,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveLocalUsers(users);
      return newUser;
    }
  );
}
