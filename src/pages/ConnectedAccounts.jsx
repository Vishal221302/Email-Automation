import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  Star,
  ShieldCheck,
  Edit,
  Eye,
  EyeOff,
  Mail
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
import api from '../services/api';

const ConnectedAccounts = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const { accounts } = useSelector((state) => state.accounts);

  // Add New Account State
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Edit Account State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Loading indicator for syncing
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Detect SMTP host from email (mirrors backend logic)
  const getSmtpHost = (email) => {
    const domain = (email || '').split('@')[1] || '';
    const domainMap = {
      'gmail.com': 'smtp.gmail.com',
      'googlemail.com': 'smtp.gmail.com',
      'yahoo.com': 'smtp.mail.yahoo.com',
      'yahoo.in': 'smtp.mail.yahoo.com',
      'outlook.com': 'smtp-mail.outlook.com',
      'hotmail.com': 'smtp-mail.outlook.com',
      'live.com': 'smtp-mail.outlook.com',
      'icloud.com': 'smtp.mail.me.com',
    };
    return domainMap[domain.toLowerCase()] || `smtp.${domain}`;
  };

  const handleConnectAccount = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Invalid Password', 'App Password must be at least 8 characters (Google App Passwords are 16 characters).');
      return;
    }

    setIsConnecting(true);
    try {
      const smtpHost = getSmtpHost(newEmail);
      const smtpPort = smtpHost.includes('outlook') ? '587' : '465';

      await dispatch(connectAccount({
        email: newEmail,
        connectionType: 'SMTP App Password',
        clientId: smtpHost,        // SMTP Host (auto-detected)
        clientSecret: newPassword, // SMTP App Password
        refreshToken: smtpPort     // SMTP Port (auto-selected)
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Account Connected',
        message: `${newEmail} linked successfully via SMTP App Password.`
      }));
      toast.success('Account Connected', `${newEmail} is now ready for sending emails.`);
      setIsConnectOpen(false);
      setNewEmail('');
      setNewPassword('');
      setShowNewPassword(false);
    } catch (err) {
      toast.error('Connection Failed', err || 'Failed to save account credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (id, email) => {
    dispatch(disconnectAccount(id));
    dispatch(addNotification({
      type: 'warning',
      title: 'Account Disconnected',
      message: `SMTP account removed: ${email}.`
    }));
    toast.info('Account Removed', `${email} has been disconnected.`);
  };

  const handleSetPrimary = (id, email) => {
    dispatch(setPrimaryAccount(id));
    dispatch(addNotification({
      type: 'info',
      title: 'Primary Account Updated',
      message: `Default sender changed to: ${email}.`
    }));
    toast.success('Default Updated', `${email} set as primary sender.`);
  };

  const handleSyncNow = async (id, email) => {
    setSyncingId(id);
    try {
      await dispatch(syncAccount(id)).unwrap();
      toast.success('Connection Verified', `SMTP credentials confirmed for ${email}.`);
    } catch (err) {
      toast.error('Verification Failed', err || 'Could not verify connection.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleEditClick = (acc) => {
    setEditingAccountId(acc.id);
    setEditEmail(acc.email);
    setEditPassword(acc.clientSecret || '');
    setShowEditPassword(false);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editPassword || editPassword.length < 8) {
      toast.error('Invalid Password', 'App Password must be at least 8 characters.');
      return;
    }

    setIsEditing(true);
    try {
      const smtpHost = getSmtpHost(editEmail);
      const smtpPort = smtpHost.includes('outlook') ? '587' : '465';

      await api.put(`/accounts/${editingAccountId}`, {
        clientId: smtpHost,
        clientSecret: editPassword,
        refreshToken: smtpPort
      });
      toast.success('Credentials Updated', 'Your SMTP App Password has been saved.');
      setIsEditOpen(false);
      dispatch(fetchAccounts());
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.error || 'Failed to update credentials.');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Email Accounts
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Connect your email accounts using App Passwords to send outreach emails securely.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setShowNewPassword(false); setIsConnectOpen(true); }}
          icon={Plus}
        >
          Add Email Account
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-[14px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
        <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">How to get an App Password (Gmail)</span>
          <span className="text-[11px] text-indigo-500 dark:text-indigo-400 leading-relaxed">
            Go to Google Account → Security → 2-Step Verification → App Passwords → Generate a 16-character password for "Mail".
            Use that password here instead of your regular Google account password.
          </span>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <Card key={acc.id} hoverEffect={false} className="flex flex-col justify-between gap-5 text-left border relative overflow-hidden">
            {/* Sync Overlay */}
            {syncingId === acc.id && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-200">Verifying...</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Avatar & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
                  {acc.email[0].toUpperCase()}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="success" pulse={true}>Connected</Badge>
                  {acc.isPrimary && (
                    <Badge variant="primary" className="rounded-md uppercase tracking-wider text-[8px] px-1.5">Primary</Badge>
                  )}
                </div>
              </div>

              {/* Email and SMTP Info */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                  {acc.email}
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {acc.clientId || getSmtpHost(acc.email)} · Port {acc.refreshToken || '465'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Last Synced</span>
                <span className="text-slate-600 dark:text-slate-350">
                  {new Date(acc.lastSync).toLocaleDateString()} {new Date(acc.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2.5 py-1.5 text-xs flex-1"
                  onClick={() => handleSyncNow(acc.id, acc.email)}
                  icon={RefreshCw}
                >
                  Verify
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="px-2.5 py-1.5 text-xs flex-1"
                  onClick={() => handleEditClick(acc)}
                  icon={Edit}
                >
                  Edit
                </Button>

                {!acc.isPrimary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 text-xs flex-1"
                    onClick={() => handleSetPrimary(acc.id, acc.email)}
                    icon={Star}
                  >
                    Set Default
                  </Button>
                )}

                <button
                  onClick={() => handleDisconnect(acc.id, acc.email)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-400 hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer"
                  title="Remove account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
              <Mail className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">No email accounts connected</span>
              <span className="text-xs text-slate-400">Add your first email account to start sending outreach.</span>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsConnectOpen(true)}>
              Add Email Account
            </Button>
          </div>
        )}
      </div>

      {/* ── ADD ACCOUNT MODAL ── */}
      <Modal
        isOpen={isConnectOpen}
        onClose={() => { setIsConnectOpen(false); setNewEmail(''); setNewPassword(''); setShowNewPassword(false); }}
        title="Add Email Account"
        size="sm"
      >
        <form onSubmit={handleConnectAccount} className="flex flex-col gap-4 text-left">
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your email address and Google App Password. The SMTP server will be auto-configured.
          </p>

          <Input
            label="Email Address"
            placeholder="e.g. yourname@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
            required
            icon={Mail}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              App Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="16-character App Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full py-2.5 px-3.5 pr-12 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              Google: Account → Security → 2-Step Verification → App Passwords
            </span>
          </div>

          {/* Auto-detect preview */}
          {newEmail && newEmail.includes('@') && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Auto-detected: <span className="text-slate-700 dark:text-slate-200">{getSmtpHost(newEmail)}</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsConnectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="sm" icon={Plus} isLoading={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT ACCOUNT MODAL ── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditPassword(''); setShowEditPassword(false); }}
        title="Update App Password"
        size="sm"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-left">
          <p className="text-xs text-slate-500 leading-relaxed">
            Update the App Password for <strong className="text-slate-700 dark:text-slate-200">{editEmail}</strong>.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              New App Password
            </label>
            <div className="relative">
              <input
                type={showEditPassword ? 'text' : 'password'}
                placeholder="16-character App Password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                required
                className="w-full py-2.5 px-3.5 pr-12 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowEditPassword(!showEditPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
              >
                {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="sm" icon={KeyRound} isLoading={isEditing}>
              {isEditing ? 'Saving...' : 'Save Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConnectedAccounts;
