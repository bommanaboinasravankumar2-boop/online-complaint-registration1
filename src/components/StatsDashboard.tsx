/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ClipboardList, AlertCircle, Clock, CheckCircle2, XOctagon, 
  Users, TrendingUp, ShieldAlert, Award, ArrowUpRight
} from 'lucide-react';
import { fetchStats } from '../lib/api';
import { TeamMember } from '../types';

interface StatsData {
  summary: {
    total: number;
    pending: number;
    underReview: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
  departmentStats: Array<{ name: string; count: number; resolved: number }>;
  priorityStats: Array<{ priority: string; count: number }>;
  teamWorkload: Array<{
    name: string;
    role: string;
    email: string;
    assignedCount: number;
    resolvedCount: number;
    pendingCount: number;
  }>;
  trendStats: Array<{ date: string; count: number; resolved: number }>;
}

const COLORS = ['#06b6d4', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#64748b'];
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

export default function StatsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError('Could not fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    
    // Refresh stats every 30s
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error || 'No statistics data available'}</span>
      </div>
    );
  }

  const { summary, departmentStats, priorityStats, teamWorkload, trendStats } = stats;

  const statCards = [
    {
      title: 'Total Lodged',
      value: summary.total,
      icon: ClipboardList,
      color: 'from-slate-500 to-slate-700',
      bgLight: 'bg-slate-50',
      textColor: 'text-slate-700',
      desc: 'Overall registrations'
    },
    {
      title: 'Pending Action',
      value: summary.pending,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
      desc: 'Unassigned/New'
    },
    {
      title: 'Active Investigation',
      value: summary.underReview + summary.inProgress,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      desc: 'Assigned & under site action'
    },
    {
      title: 'Resolved Cases',
      value: summary.resolved,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      desc: 'Finished & closed successfully'
    },
  ];

  return (
    <div className="space-y-8" id="stats-dashboard-view">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              id={`stat-card-${i}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-3xl font-display font-bold mt-2 text-slate-800 tracking-tight group-hover:text-slate-950 transition-colors">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgLight} ${card.textColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                <span>{card.desc}</span>
                {card.value > 0 && card.title === 'Resolved Cases' && (
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    {Math.round((summary.resolved / summary.total) * 100)}% rate <ArrowUpRight className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-cyan-500 to-blue-500" />
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2" id="chart-trend-box">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base">Weekly Resolution Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily registered vs. resolved complaint counts</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-cyan-600">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Registered
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Resolved
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" name="Registered" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="chart-priority-box">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base mb-1">Priority Allocation</h3>
            <p className="text-xs text-slate-400 mb-6">Severity classification of registered tickets</p>
          </div>
          
          <div className="flex justify-center items-center h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {priorityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-2xl font-bold text-slate-800 font-display">{summary.total}</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Tickets</p>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
            {priorityStats.map((p) => {
              const pct = summary.total > 0 ? Math.round((p.count / summary.total) * 100) : 0;
              const color = PRIORITY_COLORS[p.priority];
              return (
                <div key={p.priority} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="capitalize">{p.priority.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-800">
                    <span>{p.count} cases</span>
                    <span className="text-slate-400 font-normal w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department Workload & Team Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-1" id="chart-dept-box">
          <div className="mb-6">
            <h3 className="font-display font-semibold text-slate-800 text-base">Department Volume</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of cases across municipal sections</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={110} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Total Tickets" radius={[0, 4, 4, 0]}>
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assigned Investigators / Team Workload Tracker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2" id="officers-workload-box">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base">Investigating Team Workload</h3>
              <p className="text-xs text-slate-400 mt-0.5">Municipal squad active assignments & closure rates</p>
            </div>
            <div className="p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              <Users className="w-3.5 h-3.5 ml-1 text-slate-400" />
              <span className="mr-1">{teamWorkload.length} Squad Members</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold pb-3">
                  <th className="py-2.5 font-medium">Squad Member</th>
                  <th className="py-2.5 font-medium">Department Role</th>
                  <th className="py-2.5 font-medium text-center">Active Cases</th>
                  <th className="py-2.5 font-medium text-center">Resolved</th>
                  <th className="py-2.5 font-medium text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teamWorkload.map((member, i) => {
                  const totalAssigned = member.assignedCount;
                  const resolutionRate = totalAssigned > 0 
                    ? Math.round((member.resolvedCount / totalAssigned) * 100) 
                    : 100;
                  
                  return (
                    <tr key={member.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase ${
                          i === 0 ? 'text-cyan-600 bg-cyan-50' : 
                          i === 1 ? 'text-amber-600 bg-amber-50' : 
                          i === 2 ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
                        }`}>
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <span>{member.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{member.email}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] border border-slate-200/50 text-slate-600">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700">
                        {member.pendingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-200/30">
                            {member.pendingCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-center text-slate-600 font-medium">{member.resolvedCount}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-slate-800">{resolutionRate}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                resolutionRate >= 80 ? 'bg-emerald-500' :
                                resolutionRate >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${resolutionRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
