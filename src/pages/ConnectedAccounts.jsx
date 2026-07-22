import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  Star,
  Link2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import {
  fetchAccounts,
  connectAccount,
  disconnectAccount,
  setPrimaryAccount,
  syncAccount
} from '../redux/slices/accountsSlice';
import { addNotification } from '../redux/slices/notificationsSlice';

const ConnectedAccounts = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const { accounts } = useSelector((state) => state.accounts);
  
  // Modals state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [clientId, setClientId] = useState('smtp.gmail.com'); // Repurposed for SMTP Host
  const [clientSecret, setClientSecret] = useState('');       // Repurposed for SMTP Password
  const [smtpPort, setSmtpPort] = useState('465');            // Repurposed for SMTP Port

  // Loading indicator for syncing
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleConnectAccount = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Connection Error', 'Please input a valid email address.');
      return;
    }

    if (!clientId || !clientSecret) {
      toast.error('Validation Error', 'SMTP Host Address and App Password are required.');
      return;
    }

    try {
      await dispatch(connectAccount({
        email: newEmail,
        connectionType: 'SMTP App Password',
        clientId, // SMTP Host
        clientSecret, // SMTP App Password
        refreshToken: smtpPort // SMTP Port
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Account Connected',
        message: `Account ${newEmail} connected successfully via SMTP App Password.`
      }));
      toast.success('Connection Success', `SMTP credentials linked for ${newEmail}.`);
      setIsConnectOpen(false);
      setNewEmail('');
      setClientId('smtp.gmail.com');
      setClientSecret('');
      setSmtpPort('465');
    } catch (err) {
      toast.error('Connection Failed', err || 'Failed to save account credentials.');
    }
  };

  const handleDisconnect = (id, email) => {
    dispatch(disconnectAccount(id));
    dispatch(addNotification({
      type: 'warning',
      title: 'Account Disconnected',
      message: `Integrations access removed for SMTP account: ${email}.`
    }));
    toast.info('Account Disconnected', `Removed credential links for ${email}.`);
  };

  const handleSetPrimary = (id, email) => {
    dispatch(setPrimaryAccount(id));
    dispatch(addNotification({
      type: 'info',
      title: 'Primary Account Shifted',
      message: `Primary default sending inbox redirected to: ${email}.`
    }));
    toast.success('Default Updated', `${email} set as primary sender account.`);
  };

  const handleSyncNow = async (id, email) => {
    setSyncingId(id);
    try {
      await dispatch(syncAccount(id)).unwrap();
      toast.success('Sync Completed', `Synchronized SMTP connection metrics for ${email}.`);
    } catch (err) {
      toast.error('Sync Failed', err || 'Could not verify connection endpoints.');
    } finally {
      setSyncingId(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            SMTP Integrations
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Link and configure outgoing SMTP servers to allow outbound email campaign delivery.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsConnectOpen(true)}
          icon={Plus}
        >
          Connect New Account
        </Button>
      </div>

      {/* Grid Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <Card key={acc.id} hoverEffect={false} className="flex flex-col justify-between gap-5 text-left border relative overflow-hidden">
            {/* Sync Overlay Indicator */}
            {syncingId === acc.id && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-200">Checking connection...</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
                  {acc.email[0].toUpperCase()}
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="success" pulse={true}>
                    Connected
                  </Badge>
                  {acc.isPrimary && (
                    <Badge variant="primary" className="rounded-md uppercase tracking-wider text-[8px] px-1.5 py-0.2">
                      Primary
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-655 dark:text-slate-350 truncate leading-tight">
                  {acc.email}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Host: {acc.clientId} (Port: {acc.refreshToken || '465'})
                </span>
              </div>
            </div>

            {/* Account Details and syncing */}
            <div className="flex flex-col gap-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Last Connection Test</span>
                <span className="text-slate-700 dark:text-slate-350">
                  {new Date(acc.lastSync).toLocaleDateString()} at{' '}
                  {new Date(acc.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                {/* Sync */}
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2.5 py-1.5 text-xs flex-1"
                  onClick={() => handleSyncNow(acc.id, acc.email)}
                  icon={RefreshCw}
                >
                  Verify
                </Button>

                {/* Primary Setting */}
                {!acc.isPrimary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 text-xs flex-1"
                    onClick={() => handleSetPrimary(acc.id, acc.email)}
                    icon={Star}
                  >
                    Default
                  </Button>
                )}

                {/* Disconnect */}
                <button
                  onClick={() => handleDisconnect(acc.id, acc.email)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-400 hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer"
                  title="Disconnect account credentials"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Connect New Account Dialog Modal */}
      <Modal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        title="Connect SMTP Email Account"
        size="md"
      >
        <form onSubmit={handleConnectAccount} className="flex flex-col gap-4 text-left">
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure your outgoing SMTP server credentials to send real email outreach runs securely.
          </p>

          <Input
            label="Sender Email Address"
            placeholder="e.g. candidate@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            icon={KeyRound}
          />

          <div className="flex flex-col gap-3.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-[16px] border border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">SMTP Connection Credentials</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 leading-normal">
                  Provide the SMTP Host (e.g. smtp.gmail.com), select the port, and enter your secure App Password.
                </span>
              </div>
            </div>

            <Input
              label="SMTP Host Address"
              placeholder="e.g. smtp.gmail.com"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              type="text"
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                SMTP Port Protocol
              </label>
              <select
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full py-2.5 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-bold"
              >
                <option value="465">465 (SSL/TLS - Secure)</option>
                <option value="587">587 (STARTTLS)</option>
                <option value="25">25 (Non-Secure)</option>
              </select>
            </div>

            <Input
              label="SMTP App Password"
              placeholder="Enter App Password (usually 16 characters)"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              required
              type="password"
            />
          </div>

          <div className="flex items-center justify-end gap-3.5 border-t border-slate-100 dark:border-slate-750 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsConnectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="sm" icon={Plus}>
              Save Connection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConnectedAccounts;
