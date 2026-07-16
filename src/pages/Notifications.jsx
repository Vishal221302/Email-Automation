import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  Trash2,
  CheckCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Mail,
  CalendarCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import {
  markAsRead,
  markAllRead,
  removeNotification,
  clearAll
} from '../redux/slices/notificationsSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'unread' | 'read'

  const handleMarkRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
    toast.success('Inbox Read', 'All notifications marked as read.');
  };

  const handleClearAll = () => {
    dispatch(clearAll());
    toast.info('Inbox Cleared', 'Removed all notification alerts.');
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success shrink-0" />;
      case 'danger':
        return <XCircle className="w-5 h-5 text-danger shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-primary shrink-0" />;
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter((ntf) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'unread') return !ntf.isRead;
    return ntf.isRead;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            System Alerts
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Review delivery failures, background queue summaries, and synced Gmail statuses.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              icon={CheckCheck}
            >
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-danger hover:bg-danger/10 border-slate-200 dark:border-slate-800"
              onClick={handleClearAll}
              icon={Trash2}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        {['All', 'unread', 'read'].map((tab) => {
          const countMap = {
            All: notifications.length,
            unread: unreadCount,
            read: notifications.length - unreadCount
          };
          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-button cursor-pointer transition-colors capitalize flex items-center gap-1.5
                ${
                  filterTab === tab
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-primary border border-indigo-150'
                    : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {tab}
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                filterTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {countMap[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification Listing */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 border border-slate-100 dark:border-slate-850 rounded-card bg-white dark:bg-slate-900/10">
            <FolderOpen className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-750 dark:text-slate-300">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">There are no alerts matching this selection.</p>
          </div>
        ) : (
          filteredNotifications.map((ntf) => (
            <Card
              key={ntf.id}
              onClick={() => handleMarkRead(ntf.id)}
              hoverEffect={false}
              className={`flex gap-4.5 p-4.5 text-left border relative group transition-colors cursor-pointer
                ${
                  ntf.isRead
                    ? 'bg-slate-50/20 dark:bg-slate-900/5 border-slate-100 dark:border-slate-850'
                    : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-950/40 shadow-sm ring-1 ring-indigo-500/5'
                }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(ntf.type)}</div>
              
              <div className="flex-1 flex flex-col gap-1 min-w-0 pr-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className={`text-sm font-bold truncate ${ntf.isRead ? 'text-slate-650 dark:text-slate-400 font-medium' : 'text-slate-900 dark:text-slate-100'}`}>
                    {ntf.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                    {new Date(ntf.timestamp).toLocaleDateString()} at{' '}
                    {new Date(ntf.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
                  {ntf.message}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute right-4 top-4.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleRemove(ntf.id, e)}
                  className="p-1.5 rounded hover:bg-danger/10 text-slate-400 hover:text-danger cursor-pointer"
                  title="Remove alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
