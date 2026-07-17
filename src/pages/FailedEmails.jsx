import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  RefreshCw,
  Calendar,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { setCurrentCompose } from '../redux/slices/emailsSlice';
import { fetchAccounts } from '../redux/slices/accountsSlice';
import api from '../services/api';

const FailedEmails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { accounts } = useSelector((state) => state.accounts);

  const [searchQuery, setSearchQuery] = useState('');
  const [gmailBounces, setGmailBounces] = useState([]);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedGmailBounce, setSelectedGmailBounce] = useState(null);

  // Fetch accounts list on mount
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Set default selected account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      const primary = accounts.find(a => a.isPrimary);
      setSelectedAccountId(primary ? primary.id : accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Auto-sync Gmail bounces on mount / account change
  useEffect(() => {
    if (selectedAccountId && gmailBounces.length === 0) {
      handleSyncGmailBounces(selectedAccountId);
    }
  }, [selectedAccountId]);

  const handleSyncGmailBounces = async (accountId) => {
    if (!accountId) return;
    setIsSyncingGmail(true);
    try {
      const response = await api.get(`/accounts/bounces/${accountId}`);
      setGmailBounces(response.data);
      toast.success('Bounces Synced', `Fetched ${response.data.length} delivery failure notifications.`);
    } catch (err) {
      toast.error('Sync Error', err.response?.data?.error || 'Failed to fetch bounces from Google.');
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const handleRetry = (email) => {
    dispatch(setCurrentCompose({
      to: email.to,
      candidateName: '',
      companyName: '',
      jobTitle: '',
      subject: email.subject,
      body: email.body,
      fromAccount: '',
      attachments: []
    }));
    toast.success('Loaded in Compose', 'Pre-filled compose form to retry sending.');
    navigate('/compose');
  };

  // Filter synced Gmail bounces
  const filteredGmailBounces = gmailBounces.filter((item) =>
    item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.snippet && item.snippet.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ── GMAIL SYNCHRONIZED BOUNCES COLUMNS ───────────────────────────
  const gmailColumns = [
    {
      key: 'from',
      header: 'Sender Details',
      render: (row) => {
        const fromName = row.from.split('<')[0].trim() || 'Mail Delivery';
        const fromEmail = row.from.includes('<') ? row.from.match(/<([^>]+)>/)?.[1] : row.from;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 dark:text-red-400 text-xs font-black shadow-sm shrink-0">
              M
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{fromName}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 truncate">{fromEmail}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'subject',
      header: 'Email / Bounce Snippet',
      render: (row) => (
        <div className="flex flex-col max-w-[380px] min-w-0">
          <span className="font-bold text-slate-700 dark:text-slate-150 truncate leading-snug">
            {row.subject || '(No Subject)'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5 leading-snug">
            {row.snippet}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Received At',
      render: (row) => (
        <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5" />
          {row.date}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedGmailBounce(row)}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Read bounce detail"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const recipientEmail = row.body.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)?.[1] || '';
              handleRetry({
                to: recipientEmail,
                subject: `Retry: ${row.subject.replace('Delivery Status Notification (Failure)', '').trim()}`,
                body: ''
              });
            }}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary cursor-pointer"
            title="Compose quick retry"
          >
            <ArrowUpRight className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Failed Emails
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Gmail bounce reports and delivery failures.
          </p>
        </div>
      </div>

      {/* Search & Sync Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Gmail bounces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          {accounts.length > 0 && (
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setGmailBounces([]);
              }}
              className="py-2 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 max-w-[220px]"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.email}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => { setGmailBounces([]); handleSyncGmailBounces(selectedAccountId); }}
            disabled={isSyncingGmail || !selectedAccountId}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin text-primary' : ''}`} />
            {isSyncingGmail ? 'Syncing...' : 'Sync Bounces'}
          </button>
        </div>
      </div>

      {/* Gmail Bounces Table */}
      <Card className="p-0 overflow-hidden relative">
        {isSyncingGmail && gmailBounces.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm font-bold text-slate-500">Connecting Gmail bounce reporter...</span>
          </div>
        ) : (
          <Table
            columns={gmailColumns}
            data={filteredGmailBounces}
            onRowClick={(row) => setSelectedGmailBounce(row)}
            emptyMessage="No synced bounce notifications found. Click 'Sync Bounces' to fetch Google delivery reports."
          />
        )}
      </Card>

      {/* ── GMAIL BOUNCE REPORT DETAIL MODAL ─────────────────────────── */}
      <Modal
        isOpen={selectedGmailBounce !== null}
        onClose={() => setSelectedGmailBounce(null)}
        title="Gmail Bounce Message details"
        size="lg"
      >
        {selectedGmailBounce && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">From:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedGmailBounce.from}</span>
                </div>
                <Badge variant="neutral">INBOX</Badge>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">To:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedGmailBounce.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">Date:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedGmailBounce.date}</span>
              </div>
              <div className="flex gap-2 border-t border-slate-150 dark:border-slate-800 pt-2.5">
                <span className="font-bold w-12 text-right">Subject:</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedGmailBounce.subject}</span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-[12px] min-h-[220px] max-h-[350px] overflow-y-auto">
              {selectedGmailBounce.body && selectedGmailBounce.body.includes('<') && selectedGmailBounce.body.includes('>') ? (
                <div
                  className="text-sm font-sans text-slate-750 dark:text-slate-250 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: selectedGmailBounce.body }}
                />
              ) : (
                <pre className="text-sm font-sans text-slate-700 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                  {selectedGmailBounce.body || selectedGmailBounce.snippet}
                </pre>
              )}
            </div>

            <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-700/50 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedGmailBounce(null)}>Close</Button>
              <Button
                variant="primary"
                size="sm"
                icon={Mail}
                onClick={() => {
                  const recipientEmail = selectedGmailBounce.body.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)?.[1] || '';
                  handleRetry({
                    to: recipientEmail,
                    subject: `Retry: ${selectedGmailBounce.subject.replace('Delivery Status Notification (Failure)', '').trim()}`,
                    body: ''
                  });
                  setSelectedGmailBounce(null);
                }}
              >
                Reply / Retry in Compose
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FailedEmails;
