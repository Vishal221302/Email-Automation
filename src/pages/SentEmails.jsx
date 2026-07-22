import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  Mail,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  Database,
  Globe
} from 'lucide-react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { fetchSentEmails, setCurrentCompose } from '../redux/slices/emailsSlice';
import { fetchAccounts } from '../redux/slices/accountsSlice';
import api from '../services/api';

const SentEmails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { accounts } = useSelector((state) => state.accounts);
  const { sentEmails, isLoading: dbLoading } = useSelector((state) => state.emails);

  const [searchQuery, setSearchQuery] = useState('');
  const [gmailSentEmails, setGmailSentEmails] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedGmailEmail, setSelectedGmailEmail] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'gmail'

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchSentEmails());
  }, [dispatch]);

  // Set default account once accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      const primary = accounts.find(a => a.isPrimary);
      setSelectedAccountId(primary ? primary.id : accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Auto-sync on mount when account is ready and gmail tab is selected
  useEffect(() => {
    if (activeTab === 'gmail' && selectedAccountId && gmailSentEmails.length === 0) {
      handleSyncGmailSent(selectedAccountId);
    }
  }, [selectedAccountId, activeTab]);

  const handleSyncGmailSent = async (accountId) => {
    if (!accountId) return;
    setIsSyncing(true);
    try {
      const response = await api.get(`/accounts/sent/${accountId}`);
      setGmailSentEmails(response.data);
      toast.success('Gmail Synced', `Fetched ${response.data.length} sent emails from Gmail.`);
    } catch (err) {
      toast.error('Sync Failed', err.response?.data?.error || 'Could not connect to Gmail API.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshDatabase = () => {
    dispatch(fetchSentEmails());
    toast.success('Database Refreshed', 'Successfully fetched email logs from database.');
  };

  const handleDuplicate = (email) => {
    dispatch(setCurrentCompose(email));
    toast.success('Compose Populated', 'Email details copied to compose page.');
    navigate('/compose');
  };

  // Filter Gmail sent
  const filteredGmailSent = gmailSentEmails.filter((item) =>
    (item.to || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.snippet || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter database sent
  const filteredDatabaseSent = sentEmails.filter((item) =>
    (item.to || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.body || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.candidateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Database Sent Columns ──────────────────────────────────────────
  const databaseColumns = [
    {
      key: 'to',
      header: 'Recipient',
      render: (row) => {
        const toRaw = row.to || '';
        const toName = row.candidateName || toRaw.split('<')[0].trim() || toRaw;
        const toEmail = toRaw.includes('<') ? toRaw.match(/<([^>]+)>/)?.[1] : toRaw;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-xs font-black shadow-sm shrink-0">
              {toName[0] ? toName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{toName}</span>
              {toEmail && toEmail !== toName && (
                <span className="text-[10px] text-slate-400 truncate">{toEmail}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'fromAccount',
      header: 'Sender (From)',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold truncate max-w-[180px] block">
          {row.fromAccount}
        </span>
      )
    },
    {
      key: 'subject',
      header: 'Subject / Preview',
      render: (row) => (
        <div className="flex flex-col max-w-[320px] min-w-0">
          <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{row.subject || '(No Subject)'}</span>
          <span className="text-xs text-slate-400 truncate mt-0.5">{row.body?.replace(/<[^>]*>/g, '')}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'sent' ? 'success' : 'danger'}>
          {row.status === 'sent' ? 'Sent' : 'Failed'}
        </Badge>
      )
    },
    {
      key: 'metrics',
      header: 'Engagement',
      render: (row) => {
        if (row.status !== 'sent') return <span className="text-slate-400 text-xs">-</span>;
        return (
          <div className="flex gap-2">
            <Badge variant={row.openRate > 0 ? 'primary' : 'neutral'} className="text-[10px] font-semibold">
              {row.openRate > 0 ? 'Opened' : 'Unopened'}
            </Badge>
            {row.clickRate > 0 && (
              <Badge variant="success" className="text-[10px] font-semibold">
                Clicked
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'date',
      header: 'Sent At',
      render: (row) => (
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(row.sentAt).toLocaleString()}
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
            onClick={() => setSelectedGmailEmail(row)}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Read email"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate({
                to: row.to,
                subject: row.subject,
                body: row.body,
                candidateName: row.candidateName,
                companyName: row.companyName,
                jobTitle: row.jobTitle
              });
            }}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary cursor-pointer"
            title="Duplicate in Compose"
          >
            <ArrowUpRight className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  // ── Gmail Sent Columns ─────────────────────────────────────────────
  const gmailColumns = [
    {
      key: 'to',
      header: 'Recipient',
      render: (row) => {
        const toRaw = row.to || '';
        const toName = toRaw.split('<')[0].trim() || toRaw;
        const toEmail = toRaw.includes('<') ? toRaw.match(/<([^>]+)>/)?.[1] : toRaw;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-xs font-black shadow-sm shrink-0">
              {toName[0] ? toName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{toName}</span>
              {toEmail && toEmail !== toName && (
                <span className="text-[10px] text-slate-400 truncate">{toEmail}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'subject',
      header: 'Subject / Snippet',
      render: (row) => (
        <div className="flex flex-col max-w-[360px] min-w-0">
          <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{row.subject || '(No Subject)'}</span>
          <span className="text-xs text-slate-400 truncate mt-0.5">{row.snippet}</span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Sent At',
      render: (row) => (
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
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
            onClick={() => setSelectedGmailEmail(row)}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Read email"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate({
                to: (row.to || '').match(/<([^>]+)>/)?.[1] || row.to,
                subject: row.subject,
                body: ''
              });
            }}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary cursor-pointer"
            title="Open in Compose"
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
            Sent Emails
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View your email campaign history from the database log or sync directly from Gmail.
          </p>
        </div>
      </div>

      {/* Modern sliding navigation Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[16px] w-fit border border-slate-200/60 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-[12px] text-xs font-black transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Database Logs
        </button>
        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-[12px] text-xs font-black transition-all cursor-pointer ${
            activeTab === 'gmail'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Gmail Live Sync
        </button>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'database' ? 'Search database logs...' : 'Search synced emails...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'database' ? (
            <button
              onClick={handleRefreshDatabase}
              disabled={dbLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin text-primary' : ''}`} />
              Refresh Database
            </button>
          ) : (
            <>
              {accounts.length > 0 && (
                <select
                  value={selectedAccountId}
                  onChange={(e) => {
                    setSelectedAccountId(e.target.value);
                    setGmailSentEmails([]);
                  }}
                  className="py-2 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 max-w-[220px]"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.email}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => { setGmailSentEmails([]); handleSyncGmailSent(selectedAccountId); }}
                disabled={isSyncing || !selectedAccountId}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Gmail'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <Card className="p-0 overflow-hidden relative">
        {activeTab === 'database' ? (
          dbLoading && sentEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm font-bold text-slate-500">Fetching database logs...</span>
            </div>
          ) : (
            <Table
              columns={databaseColumns}
              data={filteredDatabaseSent}
              onRowClick={(row) => setSelectedGmailEmail(row)}
              emptyMessage="No database email logs found. Send an email to log history."
            />
          )
        ) : (
          isSyncing && gmailSentEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm font-bold text-slate-500">Connecting to Gmail API...</span>
            </div>
          ) : (
            <Table
              columns={gmailColumns}
              data={filteredGmailSent}
              onRowClick={(row) => setSelectedGmailEmail(row)}
              emptyMessage="No Gmail sent emails found. Click 'Sync Gmail' to load your sent emails."
            />
          )
        )}
      </Card>

      {/* Sent Email Detail Modal */}
      <Modal
        isOpen={selectedGmailEmail !== null}
        onClose={() => setSelectedGmailEmail(null)}
        title={activeTab === 'database' ? 'Database Sent Email Details' : 'Gmail Sent Email'}
        size="lg"
      >
        {selectedGmailEmail && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">From:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedGmailEmail.fromAccount || selectedGmailEmail.from}
                  </span>
                </div>
                <Badge variant={selectedGmailEmail.status === 'failed' ? 'danger' : 'success'}>
                  {(selectedGmailEmail.status || 'SENT').toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">To:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedGmailEmail.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">Date:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {selectedGmailEmail.sentAt ? new Date(selectedGmailEmail.sentAt).toLocaleString() : selectedGmailEmail.date}
                </span>
              </div>
              {selectedGmailEmail.candidateName && (
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">Candidate:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedGmailEmail.candidateName}</span>
                </div>
              )}
              {selectedGmailEmail.companyName && (
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">Company:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedGmailEmail.companyName}</span>
                </div>
              )}
              <div className="flex gap-2 border-t border-slate-150 dark:border-slate-800 pt-2.5">
                <span className="font-bold w-12 text-right">Subject:</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedGmailEmail.subject || '(No Subject)'}</span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-[12px] min-h-[220px] max-h-[360px] overflow-y-auto">
              {selectedGmailEmail.body && selectedGmailEmail.body.includes('<') ? (
                <div
                  className="text-sm font-sans text-slate-700 dark:text-slate-300 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: selectedGmailEmail.body }}
                />
              ) : (
                <pre className="text-sm font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedGmailEmail.body || selectedGmailEmail.snippet}
                </pre>
              )}
            </div>

            {selectedGmailEmail.errorReason && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-950/50 rounded-[12px] text-xs font-semibold">
                <strong>Failure Reason:</strong> {selectedGmailEmail.errorReason}
              </div>
            )}

            <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-750 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedGmailEmail(null)}>Close</Button>
              <Button
                variant="primary"
                size="sm"
                icon={Mail}
                onClick={() => {
                  handleDuplicate({
                    to: selectedGmailEmail.to,
                    subject: selectedGmailEmail.subject,
                    body: selectedGmailEmail.body,
                    candidateName: selectedGmailEmail.candidateName,
                    companyName: selectedGmailEmail.companyName,
                    jobTitle: selectedGmailEmail.jobTitle
                  });
                  setSelectedGmailEmail(null);
                }}
              >
                Duplicate in Compose
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SentEmails;
