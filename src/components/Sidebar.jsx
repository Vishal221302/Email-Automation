import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MailPlus,
  FileText,
  Database,
  CalendarClock,
  Send,
  MailX,
  History,
  KeyRound,
  LineChart,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { logout } from '../redux/slices/authSlice';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);
  const { sentEmails } = useSelector((state) => state.emails);
  const { scheduledEmails } = useSelector((state) => state.emails);
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  const displayName = user?.name || user?.username || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const failedCount = sentEmails.filter((e) => e.status === 'failed').length;
  const pendingCount = scheduledEmails.filter((e) => e.status === 'pending').length;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Compose Email', icon: MailPlus, path: '/compose' },
    { name: 'Templates', icon: FileText, path: '/templates' },
    { name: 'Bulk Email', icon: Database, path: '/bulk' },
    {
      name: 'Scheduled Emails',
      icon: CalendarClock,
      path: '/scheduled',
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-indigo-500'
    },
    { name: 'Sent Emails', icon: Send, path: '/sent' },
    {
      name: 'Failed Emails',
      icon: MailX,
      path: '/failed',
      badge: failedCount > 0 ? failedCount : null,
      badgeColor: 'bg-danger'
    },
    { name: 'Email History', icon: History, path: '/history' },
    { name: 'Connected Accounts', icon: KeyRound, path: '/accounts' },
    { name: 'Analytics', icon: LineChart, path: '/analytics' },
    {
      name: 'Notifications',
      icon: Bell,
      path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-cyan-500'
    },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Logged Out', 'You have been successfully logged out.');
  };

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 78 }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 h-10">
          <div className="p-2 bg-gradient-to-tr from-primary to-secondary text-white rounded-xl shadow-md shadow-primary/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
            >
              MailFlow Pro
            </motion.span>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[70vh] pr-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3.5 px-3 py-2.5 rounded-button text-sm font-semibold transition-all group cursor-pointer
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {item.badge && (
                    <span
                      className={`absolute right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white leading-none ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {/* Collapsed Tooltip */}
                  {isCollapsed && !isMobileOpen && (
                    <div className="absolute left-16 px-2.5 py-1.5 rounded-md bg-slate-950 text-white font-medium text-xs opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info + Logout Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-2">
        {/* User Card - shown when expanded */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-button bg-slate-50 dark:bg-slate-800/50 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{displayName}</span>
              <span className="text-[10px] text-slate-400 truncate leading-tight">{displayEmail}</span>
            </div>
          </div>
        )}

        {/* Collapsed: show avatar only */}
        {isCollapsed && !isMobileOpen && (
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow">
              {initials}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-3 py-2.5 rounded-button text-sm font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer group relative"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          {isCollapsed && !isMobileOpen && (
            <div className="absolute left-16 px-2.5 py-1.5 rounded-md bg-danger text-white font-medium text-xs opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50 whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 md:hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Desktop/Tablet Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="hidden md:block shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 z-30"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default Sidebar;
