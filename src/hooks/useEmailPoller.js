/**
 * useEmailPoller.js
 * Background hook that polls Gmail every 30s for new inbox emails.
 * On new email: plays sound, shows browser notification, dispatches Redux alert.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../redux/slices/notificationsSlice';
import {
  playNotificationSound,
  showBrowserNotification,
  requestNotificationPermission
} from '../services/notificationSound';
import api from '../services/api';

const POLL_INTERVAL_MS = 30_000; // poll every 30 seconds

const useEmailPoller = () => {
  const dispatch = useDispatch();
  const { accounts } = useSelector((state) => state.accounts);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Map of accountId → lastHistoryId (persisted across renders via ref)
  const historyMap = useRef({});
  const intervalRef = useRef(null);
  const isInitialised = useRef(false);

  const pollAccount = useCallback(async (account) => {
    try {
      const lastHistoryId = historyMap.current[account.id] ?? null;

      const res = await api.post(`/accounts/check-new-emails/${account.id}`, {
        lastHistoryId
      });

      const { newEmails, historyId, reset } = res.data;

      // Always update to the latest historyId
      if (historyId) {
        historyMap.current[account.id] = historyId;
      }

      // If history was reset, silently skip this cycle
      if (reset || !lastHistoryId) return;

      // Process each new email
      if (newEmails && newEmails.length > 0) {
        // Play notification chime once (even for multiple emails)
        playNotificationSound();

        newEmails.forEach((email) => {
          const senderName = (email.from || 'Unknown').split('<')[0].trim();
          const subject    = email.subject || '(No Subject)';
          const preview    = email.snippet ? email.snippet.slice(0, 80) : '';

          // Browser desktop push notification
          showBrowserNotification(
            `New Email from ${senderName}`,
            `${subject}\n${preview}`
          );

          // Redux in-app notification (shows in bell + Notifications page)
          dispatch(addNotification({
            type: 'info',
            title: `📩 New Email from ${senderName}`,
            message: `${subject}${preview ? ` — ${preview}` : ''}`
          }));
        });
      }
    } catch (err) {
      // Silently ignore poll errors (network blips, token refresh)
      if (err?.response?.status !== 401) {
        console.warn(`[EmailPoller] Poll failed for ${account.email}:`, err.message);
      }
    }
  }, [dispatch]);

  const runPoll = useCallback(() => {
    // Only poll primary account (or first account) to avoid Gmail rate limits
    const primaryAccount = accounts.find(a => a.isPrimary) || accounts[0];
    if (primaryAccount) {
      pollAccount(primaryAccount);
    }
  }, [accounts, pollAccount]);

  useEffect(() => {
    if (!isAuthenticated || accounts.length === 0) return;

    // Request browser notification permission on first load
    if (!isInitialised.current) {
      requestNotificationPermission();
      isInitialised.current = true;

      // Run immediately on first mount to get baseline historyId
      runPoll();
    }

    // Clear any existing interval before setting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(runPoll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, accounts, runPoll]);
};

export default useEmailPoller;
