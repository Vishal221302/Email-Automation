import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  Star,
  Sparkles,
  Link2,
  Copy,
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
  refreshToken,
  syncAccount
} from '../redux/slices/accountsSlice';
import { addNotification } from '../redux/slices/notificationsSlice';

const ConnectedAccounts = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const { accounts } = useSelector((state) => state.accounts);
  
  // Modals state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [connectionType, setConnectionType] = useState('Gmail OAuth');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [copied, setCopied] = useState(false);

  // Loading indicator for syncing
  const [syncingId, setSyncingId] = useState(null);

  const REDIRECT_URI = 'http://localhost:5000/api/accounts/oauth/callback';

  // Ref flag to ensure OAuth callback toast fires exactly once per page load
  const oauthHandled = useRef(false);

  // Handle OAuth redirects callback parameters - run ONCE on mount only
  useEffect(() => {
    if (oauthHandled.current) return;

    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      oauthHandled.current = true;
      toast.success('Authorization Success', 'Your Google Account has been connected and authorized successfully!');
      dispatch(fetchAccounts());
      // Clear URL params without triggering re-render loop
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      oauthHandled.current = true;
      toast.error('Authorization Error', decodeURIComponent(error));
      window.history.replaceState({}, '', window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const copyToClipboard = () => {
    navigator.clipboard.writeText(REDIRECT_URI);
    setCopied(true);
    toast.success('Copied', 'Redirect URI copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectAccount = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Connection Error', 'Please input a valid email address.');
      return;
    }

    if (connectionType === 'Gmail OAuth') {
      if (!clientId || !clientSecret) {
        toast.error('Validation Error', 'Google Client ID and Client Secret are required for Gmail OAuth.');
        return;
      }
    }

    try {
      const actionResult = await dispatch(connectAccount({
        email: newEmail,
        connectionType,
        clientId: connectionType === 'Gmail OAuth' ? clientId : null,
        clientSecret: connectionType === 'Gmail OAuth' ? clientSecret : null
      })).unwrap();

      if (connectionType === 'Gmail OAuth') {
        toast.info('Authorizing', 'Redirecting to Google Sign-In consent page...');
        const token = localStorage.getItem('token');
        // Redirect browser to authorize dynamic keys
        window.location.href = `http://localhost:5000/api/accounts/oauth/auth-url?accountId=${actionResult.id}&token=${token}`;
      } else {
        dispatch(addNotification({
          type: 'success',
          title: 'Account Connected',
          message: `Account ${newEmail} connected successfully via App Password.`
        }));
        toast.success('Connection Success', `Credentials linked for ${newEmail}.`);
        setIsConnectOpen(false);
        setNewEmail('');
        setClientId('');
        setClientSecret('');
      }
    } catch (err) {
      toast.error('Connection Failed', err || 'Failed to save account credentials.');
    }
  };

  const handleDisconnect = (id, email) => {
    dispatch(disconnectAccount(id));
    dispatch(addNotification({
      type: 'warning',
      title: 'Account Disconnected',
      message: `Integrations access removed for Gmail account: ${email}.`
    }));
    toast.info('Account Disconnected', `Removed credential links for ${email}.`);
  };

  const handleSetPrimary = (id, email) => {
    dispatch(setPrimaryAccount(id));
    toast.success('Primary Settings Saved', `${email} set as default outbox relay.`);
  };

  const handleSyncNow = (id, email) => {
    setSyncingId(id);
    setTimeout(() => {
      dispatch(syncAccount(id));
      setSyncingId(null);
      toast.success('Sync Completed', `Synchronized inbox metrics for ${email}.`);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Gmail Integrations
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Link and authorize SMTP relays via Google OAuth API to allow background scheduling.
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
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-200">Re-indexing mailbox...</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                {acc.profilePicture ? (
                  <img
                    src={acc.profilePicture}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-slate-100 dark:ring-slate-800"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
                    {acc.email[0].toUpperCase()}
                  </div>
                )}
                
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={acc.status === 'connected' ? 'success' : acc.status === 'pending_auth' ? 'warning' : 'danger'} pulse={acc.status === 'connected'}>
                    {acc.status === 'connected' ? 'Connected' : acc.status === 'pending_auth' ? 'Pending Auth' : 'Expired'}
                  </Badge>
                  {acc.isPrimary && (
                    <Badge variant="primary" className="rounded-md uppercase tracking-wider text-[8px] px-1.5 py-0.2">
                      Primary
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                {acc.displayName && (
                  <span className="text-base font-black text-slate-800 dark:text-slate-150 leading-none mb-1">
                    {acc.displayName}
                  </span>
                )}
                <span className="text-sm font-bold text-slate-650 dark:text-slate-350 truncate leading-tight">
                  {acc.email}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Integration Type: {acc.connectionType}
                </span>
              </div>
            </div>

            {/* Account Details and syncing */}
            <div className="flex flex-col gap-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Last Sync Check</span>
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
                  disabled={acc.status === 'pending_auth'}
                  icon={RefreshCw}
                >
                  Sync
                </Button>

                {/* Primary Setting */}
                {!acc.isPrimary ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 text-xs flex-1"
                    onClick={() => handleSetPrimary(acc.id, acc.email)}
                    disabled={acc.status === 'pending_auth'}
                    icon={Star}
                  >
                    Default
                  </Button>
                ) : (
                  <div className="flex-1 py-1 px-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/10 text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-success" /> Active Relay
                  </div>
                )}

                {/* Authorize/Renew */}
                {acc.status === 'pending_auth' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-2.5 py-1.5 text-xs flex-1 animate-pulse"
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      window.location.href = `http://localhost:5000/api/accounts/oauth/auth-url?accountId=${acc.id}&token=${token}`;
                    }}
                    icon={Sparkles}
                  >
                    Authorize
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
        title="Add Google Developer Connection"
        size="md"
      >
        <form onSubmit={handleConnectAccount} className="flex flex-col gap-4 text-left">
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure your own custom Google Developer Credentials to authenticate the OAuth 2.0 pipeline securely.
          </p>

          <Input
            label="Gmail Address to Sync"
            placeholder="e.g. candidate@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            icon={KeyRound}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Connection Protocol
            </label>
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
              className="w-full py-2.5 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="Gmail OAuth">Gmail OAuth 2.0 Client (Official)</option>
              <option value="SMTP App Password">Mock Simulation Account</option>
            </select>
          </div>

          {connectionType === 'Gmail OAuth' && (
            <div className="flex flex-col gap-3.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-[16px] border border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Google Console Configuration Required</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 leading-normal">
                    You must register the Authorized Redirect URI below in your Google Developer Project credentials settings:
                  </span>
                </div>
              </div>

              {/* Copy Redirect URI */}
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-[10px] text-xs font-mono text-slate-600 dark:text-slate-350">
                <span className="truncate select-all">{REDIRECT_URI}</span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy Redirect URI"
                >
                  <Copy className="w-4.5 h-4.5" />
                </button>
              </div>

              <Input
                label="Google Client ID"
                placeholder="Paste client ID from Google Cloud Console"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                type="text"
              />

              <Input
                label="Google Client Secret"
                placeholder="Paste client secret from Google Cloud Console"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                required
                type="password"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3.5 border-t border-slate-100 dark:border-slate-750 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsConnectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="sm" icon={Plus}>
              {connectionType === 'Gmail OAuth' ? 'Approve & Authenticate' : 'Save Connection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConnectedAccounts;
