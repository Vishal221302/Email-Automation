import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchAccounts } from '../redux/slices/accountsSlice';
import { fetchTemplates } from '../redux/slices/templatesSlice';
import { fetchSentEmails, fetchScheduledEmails } from '../redux/slices/emailsSlice';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.settings);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initialize theme class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch all user records from database on login/mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAccounts());
      dispatch(fetchTemplates());
      dispatch(fetchSentEmails());
      dispatch(fetchScheduledEmails());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="flex w-full min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Panel */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


