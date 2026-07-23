import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  Mail,
  RefreshCw,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { fetchSentEmails, setCurrentCompose } from '../redux/slices/emailsSlice';
import { fetchAccounts } from '../redux/slices/accountsSlice';

const SentEmails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { sentEmails, isLoading: dbLoading } = useSelector((state) => state.emails);
  const { accounts } = useSelector((state) => state.accounts);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'sent' | 'failed'
  const [accountFilter, setAccountFilter] = useState('all'); // 'all' | sender email

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchSentEmails());
  }, [dispatch]);

  const handleRefreshDatabase = () => {
    dispatch(fetchSentEmails());
    toast.success('Database Refreshed', 'Successfully fetched email logs from database.');
  };

  const handleDuplicate = (email) => {
    dispatch(setCurrentCompose(email));
    toast.success('Compose Populated', 'Email details copied to compose page.');
    navigate('/compose');
  };

  // Filter database logs
  const filteredDatabaseSent = sentEmails.filter((item) => {
    // 1. Status Filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    // 2. Account Filter
    if (accountFilter !== 'all' && item.fromAccount !== accountFilter) {
      return false;
    }
    // 3. Search Query Filter
    const query = searchQuery.toLowerCase();
    return (
      (item.to || '').toLowerCase().includes(query) ||
      (item.fromAccount || '').toLowerCase().includes(query) ||
      (item.subject || '').toLowerCase().includes(query) ||
      (item.body || '').toLowerCase().includes(query) ||
      (item.candidateName || '').toLowerCase().includes(query) ||
      (item.companyName || '').toLowerCase().includes(query)
    );
  });

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
            onClick={() => setSelectedEmail(row)}
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

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Sent Emails
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View and filter your email campaign delivery logs stored in the database.
          </p>
        </div>
      </div>

      {/* Modern Filter controls & Account Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[16px] w-fit border border-slate-200/60 dark:border-slate-800/80">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4.5 py-2.5 rounded-[12px] text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                : 'text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Logs ({sentEmails.length})
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-4.5 py-2.5 rounded-[12px] text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'sent'
                ? 'bg-white dark:bg-slate-800 text-emerald-650 dark:text-emerald-400 shadow-sm'
                : 'text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sent (Success)
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-4.5 py-2.5 rounded-[12px] text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'failed'
                ? 'bg-white dark:bg-slate-800 text-rose-650 dark:text-rose-400 shadow-sm'
                : 'text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Failed
          </button>
        </div>

        {/* Sender Account Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 px-3 rounded-[16px] border border-slate-200/60 dark:border-slate-800/80">
          <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Filter Account:</span>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-[10px] bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <option value="all">All Sender Accounts ({accounts.length})</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.email}>
                {acc.email} {acc.isPrimary ? '(Primary)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search email logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefreshDatabase}
            disabled={dbLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin text-primary' : ''}`} />
            Refresh Database
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <Card className="p-0 overflow-hidden relative">
        {dbLoading && sentEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm font-bold text-slate-500">Fetching database logs...</span>
          </div>
        ) : (
          <Table
            columns={databaseColumns}
            data={filteredDatabaseSent}
            onRowClick={(row) => setSelectedEmail(row)}
            emptyMessage={`No ${statusFilter !== 'all' ? statusFilter : ''} email logs found.`}
          />
        )}
      </Card>

      {/* Sent Email Detail Modal */}
      <Modal
        isOpen={selectedEmail !== null}
        onClose={() => setSelectedEmail(null)}
        title="Database Sent Email Details"
        size="lg"
      >
        {selectedEmail && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">From:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedEmail.fromAccount}
                  </span>
                </div>
                <Badge variant={selectedEmail.status === 'failed' ? 'danger' : 'success'}>
                  {(selectedEmail.status || 'SENT').toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">To:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedEmail.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">Date:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {new Date(selectedEmail.sentAt).toLocaleString()}
                </span>
              </div>
              {selectedEmail.candidateName && (
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">Candidate:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedEmail.candidateName}</span>
                </div>
              )}
              {selectedEmail.companyName && (
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">Company:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedEmail.companyName}</span>
                </div>
              )}
              <div className="flex gap-2 border-t border-slate-150 dark:border-slate-800 pt-2.5">
                <span className="font-bold w-12 text-right">Subject:</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedEmail.subject || '(No Subject)'}</span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-[12px] min-h-[220px] max-h-[360px] overflow-y-auto">
              {selectedEmail.body && selectedEmail.body.includes('<') ? (
                <div
                  className="text-sm font-sans text-slate-700 dark:text-slate-300 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />
              ) : (
                <pre className="text-sm font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.body}
                </pre>
              )}
            </div>

            {selectedEmail.errorReason && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-950/50 rounded-[12px] text-xs font-semibold">
                <strong>Failure Reason:</strong> {selectedEmail.errorReason}
              </div>
            )}

            <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-750 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedEmail(null)}>Close</Button>
              <Button
                variant="primary"
                size="sm"
                icon={Mail}
                onClick={() => {
                  handleDuplicate({
                    to: selectedEmail.to,
                    subject: selectedEmail.subject,
                    body: selectedEmail.body,
                    candidateName: selectedEmail.candidateName,
                    companyName: selectedEmail.companyName,
                    jobTitle: selectedEmail.jobTitle
                  });
                  setSelectedEmail(null);
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
