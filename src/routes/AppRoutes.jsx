import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import ComposeEmail from '../pages/ComposeEmail';
import Templates from '../pages/Templates';
import TemplateEditor from '../pages/TemplateEditor';
import BulkEmail from '../pages/BulkEmail';
import ScheduledEmails from '../pages/ScheduledEmails';
import SentEmails from '../pages/SentEmails';
import ConnectedAccounts from '../pages/ConnectedAccounts';
import Analytics from '../pages/Analytics';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import LoginSuccess from '../pages/LoginSuccess';
import Button from '../components/ui/Button';

// Route Protection Wrapper (Only accessible to logged-in users)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public-Only Route Wrapper (Prevent logged-in users from seeing Login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Central routing page transition wrapper
const AnimatedRoute = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className="w-full"
  >
    {children}
  </motion.div>
);

// Premium 404 View
const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-transparent">
    <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 text-primary rounded-full mb-4 animate-bounce">
      <span className="text-4xl font-extrabold">404</span>
    </div>
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Workspace Page Not Found</h2>
    <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed font-semibold">
      The dashboard view you are trying to access does not exist or has been shifted to a new route.
    </p>
    <Button variant="primary" size="sm" onClick={() => window.location.replace('/')}>
      Return to Performance Workspace
    </Button>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login Endpoint */}
      <Route path="/login" element={<AnimatedRoute><PublicRoute><Login /></PublicRoute></AnimatedRoute>} />
      <Route path="/login-success" element={<LoginSuccess />} />

      {/* Protected Dashboard Views */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard Pages */}
        <Route path="/" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
        <Route path="/compose" element={<AnimatedRoute><ComposeEmail /></AnimatedRoute>} />
        
        {/* Templates Pages */}
        <Route path="/templates" element={<AnimatedRoute><Templates /></AnimatedRoute>} />
        <Route path="/templates/new" element={<AnimatedRoute><TemplateEditor /></AnimatedRoute>} />
        <Route path="/templates/edit/:id" element={<AnimatedRoute><TemplateEditor /></AnimatedRoute>} />
        
        {/* Email Pipelines */}
        <Route path="/bulk" element={<AnimatedRoute><BulkEmail /></AnimatedRoute>} />
        <Route path="/scheduled" element={<AnimatedRoute><ScheduledEmails /></AnimatedRoute>} />
        <Route path="/sent" element={<AnimatedRoute><SentEmails /></AnimatedRoute>} />
        
        {/* Integrity connections and analytics */}
        <Route path="/accounts" element={<AnimatedRoute><ConnectedAccounts /></AnimatedRoute>} />
        <Route path="/analytics" element={<AnimatedRoute><Analytics /></AnimatedRoute>} />
        <Route path="/notifications" element={<AnimatedRoute><Notifications /></AnimatedRoute>} />
        
        {/* User admin profiles */}
        <Route path="/profile" element={<AnimatedRoute><Profile /></AnimatedRoute>} />
        <Route path="/settings" element={<AnimatedRoute><Settings /></AnimatedRoute>} />
        
        {/* Catch-all 404 */}
        <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
