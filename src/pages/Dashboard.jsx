import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Calendar,
  Send,
  AlertOctagon,
  Percent,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MailWarning,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  Legend
} from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  DAILY_EMAIL_STATS,
  WEEKLY_ACTIVITY,
  CATEGORY_DISTRIBUTION
} from '../constants/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { sentEmails, scheduledEmails } = useSelector((state) => state.emails);
  const { accounts } = useSelector((state) => state.accounts);
  const { templates } = useSelector((state) => state.templates);

  // Dynamic calculations from Redux State
  const totalSentCount = sentEmails.filter(e => e.status === 'sent').length;
  const totalFailedCount = sentEmails.filter(e => e.status === 'failed').length;
  const totalScheduledCount = scheduledEmails.filter(e => e.status === 'pending').length;
  const totalCount = sentEmails.length + scheduledEmails.length;
  
  const successRate = sentEmails.length > 0 
    ? Math.round((totalSentCount / sentEmails.length) * 100) 
    : 100;

  const kpis = [
    {
      title: 'Total Outbox',
      value: totalCount,
      icon: Mail,
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '+12% from last week',
      trendUp: true
    },
    {
      title: 'Scheduled Queue',
      value: totalScheduledCount,
      icon: Calendar,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      trend: `${scheduledEmails.length} items total`,
      trendUp: true
    },
    {
      title: 'Delivered',
      value: totalSentCount,
      icon: Send,
      color: 'text-success',
      bg: 'bg-success/10',
      trend: '94% delivery rate',
      trendUp: true
    },
    {
      title: 'Failed Delivery',
      value: totalFailedCount,
      icon: AlertOctagon,
      color: 'text-danger',
      bg: 'bg-danger/10',
      trend: `${totalFailedCount} bounces logged`,
      trendUp: false
    },
    {
      title: 'Overall Success Rate',
      value: `${successRate}%`,
      icon: Percent,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: 'Industry avg is 88%',
      trendUp: true
    }
  ];

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Performance Workspace
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Monitor email pipelines, templates, and connected Gmail credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bulk')}
            icon={Plus}
          >
            Bulk Run
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/compose')}
            icon={Mail}
          >
            Quick Send
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} hoverEffect={true} className="flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-3xl font-extrabold text-slate-950 dark:text-white">
                  {kpi.value}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  {kpi.trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success inline" />
                  ) : (
                    <MailWarning className="w-3.5 h-3.5 text-danger inline" />
                  )}
                  {kpi.trend}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Email Volume */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Volume Tracker</h3>
              <p className="text-xs text-slate-400">Total dispatches, opens, and link clicks</p>
            </div>
          </div>
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_EMAIL_STATS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
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
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                <Area name="Sent" type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSent)" />
                <Area name="Opened" type="monotone" dataKey="opened" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpened)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories Distribution */}
        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Outreach Breakdown</h3>
            <p className="text-xs text-slate-400 font-normal">Templates distribution by category</p>
          </div>
          <div className="h-[220px] w-full flex items-center justify-center relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
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
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-950 dark:text-white">65%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Applications</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
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

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming scheduled runs */}
        <Card className="flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Scheduled Dispatch Queue</h3>
              <p className="text-xs text-slate-400">Automated candidate mail drops in queue</p>
            </div>
            <button
              onClick={() => navigate('/scheduled')}
              className="text-xs font-bold text-primary hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              Calendar View <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[300px] overflow-y-auto pr-1">
            {scheduledEmails.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No emails scheduled.</p>
            ) : (
              scheduledEmails.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-left">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {item.to}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {item.subject}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={item.status === 'paused' ? 'warning' : 'primary'} className="rounded">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {item.status === 'paused' ? 'Paused' : 'Pending'}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(item.scheduledAt).toLocaleDateString()} at{' '}
                      {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Connected Google Accounts */}
        <Card className="flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Gmail Integrations</h3>
              <p className="text-xs text-slate-400">SMTP and OAuth relay setups</p>
            </div>
            <button
              onClick={() => navigate('/accounts')}
              className="text-xs font-bold text-primary hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              Add Google Account <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-[12px] border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                    {acc.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {acc.email}
                      </span>
                      {acc.isPrimary && (
                        <Badge variant="success" className="px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      OAuth: {acc.connectionType}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={acc.status === 'connected' ? 'success' : 'danger'} pulse={acc.status === 'connected'}>
                    {acc.status === 'connected' ? 'Synced' : 'Expired'}
                  </Badge>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    Sync: {new Date(acc.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
