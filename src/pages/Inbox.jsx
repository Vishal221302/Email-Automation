import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  RefreshCw,
  Calendar,
  AlertCircle,
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

const Inbox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { accounts } = useSelector((state) => state.accounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [inboxEmails, setInboxEmails] = useState([]);
  const [isSyncingInbox, setIsSyncingInbox] = useState(false);
  const [selectedInboxEmail, setSelectedInboxEmail] = useState(null);

  // Load accounts list on mount
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

  // Auto-fetch inbox when selected account changes
  useEffect(() => {
    if (selectedAccountId) {
      handleSyncInbox(selectedAccountId);
    }
  }, [selectedAccountId]);

  const handleSyncInbox = async (accountId) => {
    if (!accountId) return;
    setIsSyncingInbox(true);
    try {
      const response = await api.get(`/accounts/inbox/${accountId}`);
      setInboxEmails(response.data);
      toast.success('Sync Completed', 'Successfully synchronized Gmail inbox replies.');
    } catch (err) {
      toast.error('Sync Error', err.response?.data?.error || 'Failed to fetch messages from Google APIs.');
    } finally {
      setIsSyncingInbox(false);
    }
  };

  const handleDuplicate = (email) => {
    dispatch(setCurrentCompose(email));
    toast.success('Compose Populated', 'Email replies details copied to compose page.');
    navigate('/compose');
  };

  // Filter inbox replies based on search query
  const filteredInbox = inboxEmails.filter((item) => {
    return (
      item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.snippet && item.snippet.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Inbox Received Columns
  const inboxColumns = [
    {
      key: 'from',
      header: 'Sender Details',
      render: (row) => {
        const fromName = row.from.split('<')[0].trim() || 'Unknown';
        const fromEmail = row.from.includes('<') ? row.from.match(/<([^>]+)>/)?.[1] : row.from;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-xs font-black shadow-sm shrink-0">
              {fromName[0] ? fromName[0].toUpperCase() : 'M'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{fromName}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{fromEmail}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'subject',
      header: 'Email / Message Snippet',
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
        <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
            onClick={() => setSelectedInboxEmail(row)}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Read email reply"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => {
              const replyEmail = {
                to: row.from.match(/<([^>]+)>/)?.[1] || row.from,
                subject: row.subject.startsWith('Re:') ? row.subject : `Re: ${row.subject}`,
                body: `\n\n\nOn ${row.date}, ${row.from} wrote:\n> ${row.snippet}`
              };
              handleDuplicate(replyEmail);
            }}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary cursor-pointer"
            title="Compose quick reply"
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
            Inbox Messages
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Real-time Gmail inbox sync and quick follow-up outreach actions.
          </p>
        </div>
      </div>

      {/* Search, Filter or Sync bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search synced inbox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          {accounts.length > 0 ? (
            <>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="py-2 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 max-w-[220px]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.email}</option>
                ))}
              </select>

              <button
                onClick={() => handleSyncInbox(selectedAccountId)}
                disabled={isSyncingInbox}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInbox ? 'animate-spin text-primary' : ''}`} />
                {isSyncingInbox ? 'Syncing...' : 'Sync Inbox'}
              </button>
            </>
          ) : (
            <span className="text-xs text-danger font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> No accounts linked
            </span>
          )}
        </div>
      </div>

      {/* Inbox table */}
      {accounts.length > 0 ? (
        <Card className="p-0 overflow-hidden relative">
          {isSyncingInbox && inboxEmails.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm font-bold text-slate-500">Establishing secure API connection to Google...</span>
            </div>
          )}
          
          {(!isSyncingInbox || inboxEmails.length > 0) && (
            <Table
              columns={inboxColumns}
              data={filteredInbox}
              onRowClick={(row) => setSelectedInboxEmail(row)}
              emptyMessage="No synced messages found. Connect your Google credentials and click 'Sync Inbox'."
            />
          )}
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border rounded-[18px] bg-slate-50/50 dark:bg-slate-900/5 text-center gap-4.5">
          <AlertCircle className="w-10 h-10 text-slate-350 dark:text-slate-700" />
          <div className="flex flex-col gap-1 sm:max-w-md">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">No Connected Gmail Accounts</span>
            <p className="text-xs text-slate-400 leading-normal">
              To sync and view incoming replies, you must link your Gmail accounts using Google OAuth.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/accounts')}
          >
            Go to Connected Accounts
          </Button>
        </div>
      )}

      {/* Inbox Detail Modal */}
      <Modal
        isOpen={selectedInboxEmail !== null}
        onClose={() => setSelectedInboxEmail(null)}
        title="Gmail Message Details"
        size="lg"
      >
        {selectedInboxEmail && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <span className="font-bold w-12 text-right">From:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedInboxEmail.from}</span>
                </div>
                <Badge variant="neutral">INBOX</Badge>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">To:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedInboxEmail.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-12 text-right">Date:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedInboxEmail.date}</span>
              </div>
              <div className="flex gap-2 border-t border-slate-150 dark:border-slate-800 pt-2.5">
                <span className="font-bold w-12 text-right">Subject:</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedInboxEmail.subject || '(No Subject)'}</span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-[12px] min-h-[220px] max-h-[350px] overflow-y-auto">
              {selectedInboxEmail.body.includes('<') && selectedInboxEmail.body.includes('>') ? (
                <div 
                  className="text-sm font-sans text-slate-750 dark:text-slate-250 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: selectedInboxEmail.body }}
                />
              ) : (
                <pre className="text-sm font-sans text-slate-700 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                  {selectedInboxEmail.body}
                </pre>
              )}
            </div>

            <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-700/50 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedInboxEmail(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const replyEmail = {
                    to: selectedInboxEmail.from.match(/<([^>]+)>/)?.[1] || selectedInboxEmail.from,
                    subject: selectedInboxEmail.subject.startsWith('Re:') 
                      ? selectedInboxEmail.subject 
                      : `Re: ${selectedInboxEmail.subject}`,
                    body: `\n\n\nOn ${selectedInboxEmail.date}, ${selectedInboxEmail.from} wrote:\n> ${selectedInboxEmail.snippet}`
                  };
                  handleDuplicate(replyEmail);
                  setSelectedInboxEmail(null);
                }}
                icon={Mail}
              >
                Reply in Compose
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inbox;
