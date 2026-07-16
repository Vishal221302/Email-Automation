import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar as CalendarIcon,
  List,
  Play,
  Pause,
  Trash2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarCheck
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import CalendarPicker from '../components/ui/CalendarPicker';
import { useToast } from '../components/ui/Toast';
import {
  pauseScheduledEmail,
  resumeScheduledEmail,
  cancelScheduledEmail,
  rescheduleEmail,
  deleteScheduledEmail,
  sendScheduledNow,
  fetchScheduledEmails
} from '../redux/slices/emailsSlice';
import { addNotification } from '../redux/slices/notificationsSlice';

const ScheduledEmails = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { scheduledEmails } = useSelector((state) => state.emails);

  // Poll scheduled list every 10 seconds to keep UI synced with backend automatic scheduler
  useEffect(() => {
    dispatch(fetchScheduledEmails()); // Fetch immediately on mount

    const interval = setInterval(() => {
      dispatch(fetchScheduledEmails());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'pending' | 'paused' | 'cancelled'
  
  // Rescheduling modal states
  const [editingEmail, setEditingEmail] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newTz, setNewTz] = useState('Asia/Kolkata');

  // Calendar states (simulated for July 2026, consistent with CURRENT_LOCAL_TIME)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  const handlePause = (id) => {
    dispatch(pauseScheduledEmail(id));
    toast.warning('Schedule Paused', 'Outbox delivery run has been suspended.');
  };

  const handleResume = (id) => {
    dispatch(resumeScheduledEmail(id));
    toast.success('Schedule Resumed', 'Outbox delivery queue is active.');
  };

  const handleCancel = (id) => {
    dispatch(cancelScheduledEmail(id));
    toast.info('Schedule Cancelled', 'Delivery has been marked as cancelled.');
  };

  const handleDelete = (id) => {
    dispatch(deleteScheduledEmail(id));
    toast.success('Schedule Deleted', 'The outreach event was deleted.');
  };

  const handleSendNow = (id, email) => {
    dispatch(sendScheduledNow(id));
    dispatch(addNotification({
      type: 'success',
      title: 'Email Sent Now',
      message: `Scheduled email to ${email.to} was successfully dispatched ahead of schedule.`
    }));
    toast.success('Dispatched Immediately', `Message delivered to ${email.to}.`);
  };

  const openRescheduleModal = (email) => {
    setEditingEmail(email);
    const dateObj = new Date(email.scheduledAt);
    setNewDate(dateObj.toISOString().split('T')[0]);
    setNewTime(dateObj.toTimeString().split(' ')[0].substring(0, 5));
    setNewTz(email.timezone || 'Asia/Kolkata');
  };

  const handleSaveReschedule = () => {
    if (!newDate || !newTime) return;
    const combinedDateTime = `${newDate}T${newTime}:00`;
    dispatch(rescheduleEmail({
      id: editingEmail.id,
      scheduledAt: new Date(combinedDateTime).toISOString(),
      timezone: newTz
    }));
    toast.success('Rescheduled Success', 'Email delivery target has been updated.');
    setEditingEmail(null);
  };

  // Filter items
  const filteredEmails = scheduledEmails.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  // Calendar parameters builder
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Maps calendar cell items
  const getEmailsForDay = (day) => {
    return scheduledEmails.filter((item) => {
      const date = new Date(item.scheduledAt);
      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth &&
        date.getDate() === day
      );
    });
  };

  // Table Columns Definition
  const columns = [
    {
      key: 'to',
      header: 'Recipient',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-slate-200">{row.to}</span>
          <span className="text-xs text-slate-400 font-semibold">{row.companyName} — {row.jobTitle}</span>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Subject Line',
      render: (row) => <span className="text-slate-500 max-w-[250px] truncate block">{row.subject}</span>
    },
    {
      key: 'scheduledAt',
      header: 'Delivery Target',
      render: (row) => {
        const date = new Date(row.scheduledAt);
        return (
          <div className="flex flex-col text-xs font-semibold text-slate-500">
            <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{row.timezone}</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variantMap = {
          pending: 'primary',
          paused: 'warning',
          cancelled: 'danger'
        };
        return (
          <Badge variant={variantMap[row.status] || 'neutral'} pulse={row.status === 'pending'}>
            {row.status.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status === 'pending' ? (
            <button
              onClick={() => handlePause(row.id)}
              className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-warning cursor-pointer"
              title="Pause Schedule"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : row.status === 'paused' ? (
            <button
              onClick={() => handleResume(row.id)}
              className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-success cursor-pointer"
              title="Resume Schedule"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={() => openRescheduleModal(row)}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-primary cursor-pointer"
            title="Edit Delivery Date"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSendNow(row.id, row)}
            className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-cyan-500 cursor-pointer"
            title="Send Immediately"
          >
            <Send className="w-4 h-4" />
          </button>

          {row.status !== 'cancelled' ? (
            <button
              onClick={() => handleCancel(row.id)}
              className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-danger cursor-pointer"
              title="Cancel Delivery"
            >
              <XCircle className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded hover:bg-danger/10 text-slate-400 hover:text-danger cursor-pointer"
            title="Delete Schedule Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Outbox Scheduler
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Monitor and modify pending personalized applications awaiting cron execution.
          </p>
        </div>
        
        {/* Toggle List/Calendar */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded cursor-pointer ${
              viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter tab indicators (Only for List view) */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-slate-100 dark:border-slate-800">
          {['All', 'pending', 'paused', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-button cursor-pointer transition-colors capitalize
                ${
                  filterStatus === status
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-primary border border-indigo-150'
                    : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Main Content displays */}
      {viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={filteredEmails}
            emptyMessage="No pending scheduled emails found."
          />
        </Card>
      ) : (
        /* Calendar view grid */
        <Card className="flex flex-col gap-5">
          {/* Calendar Header navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="p-1.5" onClick={prevMonth} icon={ChevronLeft} />
              <Button variant="outline" size="sm" className="p-1.5" onClick={nextMonth} icon={ChevronRight} />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {/* Days headings */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider py-1">
                {d}
              </span>
            ))}

            {/* Empty offset items */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[100px] border border-transparent" />
            ))}

            {/* Days grids */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEmails = getEmailsForDay(dayNum);
              return (
                <div
                  key={`day-${dayNum}`}
                  className="min-h-[110px] p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col gap-1.5 text-left"
                >
                  <span className="text-xs font-bold text-slate-400">{dayNum}</span>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                    {dayEmails.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openRescheduleModal(item)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate cursor-pointer transition-colors border
                          ${
                            item.status === 'paused'
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : item.status === 'cancelled'
                              ? 'bg-danger/10 text-danger border-danger/20'
                              : 'bg-indigo-50 dark:bg-indigo-950/30 text-primary border-indigo-100 dark:border-indigo-900'
                          }`}
                        title={`${item.to} (${item.companyName})`}
                      >
                        {item.companyName || item.to.split('@')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Reschedule Picker Modal */}
      <Modal
        isOpen={editingEmail !== null}
        onClose={() => setEditingEmail(null)}
        title="Reschedule Outbox Target"
        size="md"
      >
        {editingEmail && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex gap-2.5 items-center bg-slate-50 dark:bg-slate-900 p-3.5 rounded-card border border-slate-150 dark:border-slate-800">
              <User className="w-5 h-5 text-slate-400" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase">RECIPIENT</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{editingEmail.to}</span>
              </div>
            </div>

            <CalendarPicker
              selectedDate={newDate}
              onDateChange={setNewDate}
              selectedTime={newTime}
              onTimeChange={setNewTime}
              selectedTimezone={newTz}
              onTimezoneChange={setNewTz}
            />

            <div className="flex items-center justify-end gap-3.5 border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-2">
              <Button variant="outline" size="sm" onClick={() => setEditingEmail(null)}>
                Discard Changes
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveReschedule}>
                Save Calendar Schedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScheduledEmails;
