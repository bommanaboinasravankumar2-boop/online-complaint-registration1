/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'citizen' | 'admin' | 'official';

export type ComplaintStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string; // For official roles
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  updatedBy: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  department: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: string;
  landmark?: string;
  complainantId: string;
  complainantName: string;
  assignedTo?: string; // Official ID
  assignedToName?: string; // Official Name
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  messages: Message[];
  attachment?: string; // Base64 or image url
  rating?: number; // Citizen satisfaction rating (1-5)
  feedback?: string; // Citizen satisfaction feedback
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  assignedCount: number;
}
