import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  User,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  BellOff,
  BellRing
} from 'lucide-react';
import { toggleTheme } from '../redux/slices/settingsSlice';
import { markAsRead, markAllRead, removeNotification } from '../redux/slices/notificationsSlice';
import { logout } from '../redux/slices/authSlice';
import Drawer from './ui/Drawer';
import Button from './ui/Button';

const Navbar = ({ setIsMobileOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.settings);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  const [isNtfOpen, setIsNtfOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Track browser notification permission state
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied'
  );

  // Must be called from a user click — browsers block programmatic permission requests
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === 'granted') {
      // Play a quick test chime so user knows sound works
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } catch (_) {}
      new Notification('MailFlow Pro', {
        body: 'Notifications enabled! You will be alerted on new emails.',
        icon: '/vite.svg',
        silent: true
      });
    }
  };

  // Compute display name and initials from logged-in user
  const displayName = user?.name || user?.username || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleComposeClick = () => {
    navigate('/compose');
  };

  const handleNotificationClick = (id) => {
    dispatch(markAsRead(id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success shrink-0" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-danger shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Menu Icon */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
      >
        <Menu className="w-5.5 h-5.5" />
      </button>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search candidates, templates, or emails..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
        />
      </div>
      <div className="flex-1 sm:hidden" />

      {/* Nav Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Compose */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleComposeClick}
          icon={Plus}
          className="hidden md:inline-flex"
        >
          Compose Email
        </Button>

        {/* Notification Permission Button — shown only when not yet granted */}
        {notifPermission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            title="Click to enable real-time email notifications"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5" />
            Enable Alerts
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-button text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setIsNtfOpen(true)}
            className="p-2 rounded-button text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 focus:outline-none cursor-pointer group"
          >
            {/* Avatar Circle with real initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-primary/40 transition-all">
              {initials}
            </div>
            {/* Name shown on md+ screens */}
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[110px] truncate">{displayName}</span>
              <span className="text-[10px] text-slate-400 max-w-[110px] truncate">{displayEmail}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div
                onClick={() => setIsProfileOpen(false)}
                className="fixed inset-0 z-50 bg-transparent"
              />
              <div className="absolute right-0 mt-2.5 w-52 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl py-1.5 z-[51]">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    dispatch(logout());
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors text-left border-t border-slate-100 dark:border-slate-800/80 mt-1.5 pt-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    {/* Notifications Drawer */}
      <Drawer
        isOpen={isNtfOpen}
        onClose={() => setIsNtfOpen(false)}
        title={`Notifications (${unreadCount} unread)`}
        size="md"
      >
        <div className="flex flex-col gap-4 h-full">
          <div className="flex justify-between items-center">
            <button
              onClick={() => dispatch(markAllRead())}
              className="text-xs font-bold text-primary hover:text-primary-hover cursor-pointer"
            >
              Mark all as read
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              View all notifications
            </button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[80vh] pr-1">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No notifications yet.</p>
            ) : (
              notifications.map((ntf) => (
                <div
                  key={ntf.id}
                  onClick={() => handleNotificationClick(ntf.id)}
                  className={`p-3.5 pl-6.5 rounded-card border text-left transition-all relative group flex gap-3 cursor-pointer
                    ${ntf.isRead
                      ? 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800/60'
                      : 'bg-white dark:bg-slate-800/80 border-indigo-150/40 dark:border-indigo-900/40 ring-1 ring-indigo-500/5 shadow-sm'
                    }`}
                >
                  {!ntf.isRead && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {getIcon(ntf.type)}
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className={`text-xs font-bold truncate ${ntf.isRead ? 'text-slate-500 dark:text-slate-450' : 'text-slate-900 dark:text-white'}`}>
                        {ntf.title}
                      </h4>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 shrink-0">
                        {new Date(ntf.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-normal line-clamp-2">
                      {ntf.message}
                    </p>
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeNotification(ntf.id));
                    }}
                    className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;
