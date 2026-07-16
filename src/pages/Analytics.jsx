import React from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Percent,
  Mail,
  Eye,
  MousePointerClick,
  AlertCircle,
  FileText,
  Key
} from 'lucide-react';
import Card from '../components/ui/Card';
import {
  DAILY_EMAIL_STATS,
  WEEKLY_ACTIVITY,
  CATEGORY_DISTRIBUTION
} from '../constants/mockData';

const Analytics = () => {
  const { sentEmails } = useSelector((state) => state.emails);
  const { templates } = useSelector((state) => state.templates);

  // Dynamic calculations from redux store
  const totalSent = sentEmails.filter(e => e.status === 'sent').length;
  const totalFailed = sentEmails.filter(e => e.status === 'failed').length;
  const totalTotal = sentEmails.length;
  
  const openedEmails = sentEmails.filter(e => e.openRate > 0).length;
  const clickedEmails = sentEmails.filter(e => e.clickRate > 0).length;

  const openRate = totalSent > 0 ? Math.round((openedEmails / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((clickedEmails / totalSent) * 100) : 0;
  const bounceRate = totalTotal > 0 ? Math.round((totalFailed / totalTotal) * 100) : 0;

  const metrics = [
    { label: 'Outbox Sent', value: totalSent, icon: Mail, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Average Open Rate', value: `${openRate}%`, icon: Eye, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Click-Through Rate', value: `${clickRate}%`, icon: MousePointerClick, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Bounce Rate', value: `${bounceRate}%`, icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' }
  ];

  // Mock template usage ratings
  const topTemplates = [
    { name: 'Frontend Engineer Application', usage: 38, openRate: '88%', clickRate: '45%' },
    { name: 'Application Follow-up (1 Week)', usage: 22, openRate: '92%', clickRate: '12%' },
    { name: 'Cold Outreach - Networking', usage: 15, openRate: '65%', clickRate: '28%' },
    { name: 'Interview Thank You Note', usage: 10, openRate: '98%', clickRate: '5%' }
  ];

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
          Campaign Analytics
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
          Detailed overview of outreach effectiveness, delivery diagnostics, and response benchmarks.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} hoverEffect={true} className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${m.bg} ${m.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{m.value}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full delivery chart */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delivery Success Ratios</h3>
            <p className="text-xs text-slate-400">Chronological analysis of delivered vs opened outcomes</p>
          </div>
          <div className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_EMAIL_STATS} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415512" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area name="Delivered" type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSent)" />
                <Area name="Opened" type="monotone" dataKey="opened" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpened)" />
                <Area name="Failed" type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category distribution */}
        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Outreach Breakdown</h3>
            <p className="text-xs text-slate-400">Dispatch split by application categories</p>
          </div>
          <div className="h-[220px] w-full flex items-center justify-center relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-950 dark:text-white">65%</span>
              <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">Apply</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            {CATEGORY_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Stacked charts & tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked activity categories volume */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Pipeline Progression</h3>
            <p className="text-xs text-slate-400">Dispatch quantities mapped weekly by target outreach goals</p>
          </div>
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ACTIVITY} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415512" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name="Job Applications" dataKey="JobApplications" stackId="a" fill="#4F46E5" radius={[0, 0, 0, 0]} />
                <Bar name="Follow-ups" dataKey="FollowUps" stackId="a" fill="#06B6D4" radius={[0, 0, 0, 0]} />
                <Bar name="Networking" dataKey="Networking" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top performing templates */}
        <Card className="flex flex-col gap-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Performing Templates</h3>
            <p className="text-xs text-slate-400">Outreach shells ranked by recipient engagement rates</p>
          </div>
          
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-850 overflow-y-auto max-h-[300px]">
            {topTemplates.map((tpl, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3 text-left">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {tpl.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Used {tpl.usage} times
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-success">{tpl.openRate}</span>
                    <span className="text-[9px] text-slate-450 font-semibold uppercase tracking-wider">Open</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-secondary">{tpl.clickRate}</span>
                    <span className="text-[9px] text-slate-450 font-semibold uppercase tracking-wider">Click</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
