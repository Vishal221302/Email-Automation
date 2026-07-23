import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Database,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  ArrowLeft,
  FileText,
  Users,
  Settings,
  Sparkles,
  Download,
  Clock,
  Send,
  Calendar,
  XCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import FileUpload from '../components/ui/FileUpload';
import { useToast } from '../components/ui/Toast';
import {
  setCSVData,
  startSending,
  updateSendProgress,
  completeSending,
  resetBulkState
} from '../redux/slices/bulkSlice';
import { sendEmailNow, scheduleEmail } from '../redux/slices/emailsSlice';
import { addNotification } from '../redux/slices/notificationsSlice';

const BulkEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { accounts } = useSelector((state) => state.accounts);
  const { templates } = useSelector((state) => state.templates);
  const { fileName, candidates, validCount, invalidCount, parseStatus, isSending, sendProgress } = useSelector(
    (state) => state.bulk
  );

  const [activeStep, setActiveStep] = useState(1); // 1: Upload, 2: Validate, 3: Configure & Run
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [senderAccount, setSenderAccount] = useState(accounts[0]?.email || '');

  // Scheduling states
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedTimezone, setSchedTimezone] = useState('Asia/Kolkata');

  // Real-Time Sending Progress Popup Modal States
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [currentSendingIndex, setCurrentSendingIndex] = useState(0);
  const [totalSendingCount, setTotalSendingCount] = useState(0);
  const [currentSendingEmail, setCurrentSendingEmail] = useState('');
  const [sentSuccessCount, setSentSuccessCount] = useState(0);
  const [sentFailedCount, setSentFailedCount] = useState(0);
  const [isSendingFinished, setIsSendingFinished] = useState(false);

  // Auto-sync sender account when accounts load from Redux store
  useEffect(() => {
    if (accounts.length > 0 && !senderAccount) {
      setSenderAccount(accounts.find(a => a.isPrimary)?.email || accounts[0]?.email || '');
    }
  }, [accounts, senderAccount]);

  const downloadSampleCSV = () => {
    const csvContent = "email,candidate_name,company_name,job_title\n" +
      "hiring@airbnb.com,Alex Harrison,Airbnb,Staff UI Engineer\n" +
      "careers@figma.com,Rahul Sharma,Figma,Product Engineer\n" +
      "recruiting@stripe.com,Amit Patel,Stripe,Frontend Lead\n" +
      "jobs@uber.com,Priya Verma,Uber,Senior React Developer\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_candidates.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download Success', 'Sample CSV template downloaded successfully.');
  };

  const handleCSVUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split(/\r?\n/);
        if (rows.length < 2) {
          toast.error('Parse Error', 'The CSV file seems to be empty or has no data rows.');
          return;
        }

        const headers = rows[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        
        const emailIdx = headers.indexOf('email');
        const nameIdx = headers.findIndex(h => h.includes('name') || h === 'candidate_name');
        const companyIdx = headers.findIndex(h => h.includes('company') || h === 'company_name');
        const titleIdx = headers.findIndex(h => h.includes('title') || h === 'job_title' || h.includes('role') || h.includes('custom'));

        if (emailIdx === -1) {
          toast.error('Validation Error', 'CSV must contain an "email" column.');
          return;
        }

        const parsedCandidates = [];

        for (let i = 1; i < rows.length; i++) {
          const rowText = rows[i].trim();
          if (!rowText) continue;

          const values = [];
          let currentVal = '';
          let insideQuotes = false;
          
          for (let charIdx = 0; charIdx < rowText.length; charIdx++) {
            const char = rowText[charIdx];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
              currentVal = '';
            } else {
              currentVal += char;
            }
          }
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

          const emailVal = values[emailIdx] || '';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValid = emailRegex.test(emailVal);

          parsedCandidates.push({
            id: i,
            email: emailVal,
            candidate_name: nameIdx !== -1 ? values[nameIdx] || 'Applicant' : 'Applicant',
            company_name: companyIdx !== -1 ? values[companyIdx] || 'Target Company' : 'Target Company',
            job_title: titleIdx !== -1 ? values[titleIdx] || 'Open Position' : 'Open Position',
            isValid,
            error: !isValid ? 'Invalid email format' : null
          });
        }

        dispatch(setCSVData({
          fileName: file.name,
          candidates: parsedCandidates
        }));
        
        toast.success('CSV Parsed', `Imported ${parsedCandidates.length} contacts from ${file.name}.`);
        setActiveStep(2);
      };
      reader.onerror = () => toast.error('File Error', 'Failed to read the selected CSV file.');
      reader.readAsText(file);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!selectedTemplateId) {
      toast.error('Validation Error', 'Please select an email template to proceed.');
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) return;

    const validCandidates = candidates.filter((c) => c.isValid);
    if (validCandidates.length === 0) {
      toast.error('Validation Error', 'No valid candidate email addresses to dispatch.');
      return;
    }

    if (isScheduleEnabled) {
      if (!schedDate || !schedTime) {
        toast.error('Schedule Error', 'Please select delivery date and time for bulk schedule.');
        return;
      }
      const scheduledDateTime = `${schedDate}T${schedTime}:00`;
      const scheduledAt = new Date(scheduledDateTime).toISOString();

      let count = 0;
      for (const candidate of validCandidates) {
        const compiledSubject = selectedTemplate.subject
          .replace(/{{candidate_name}}/g, candidate.candidate_name)
          .replace(/{{company_name}}/g, candidate.company_name)
          .replace(/{{job_title}}/g, candidate.job_title);

        const compiledBody = selectedTemplate.body
          .replace(/{{candidate_name}}/g, candidate.candidate_name)
          .replace(/{{company_name}}/g, candidate.company_name)
          .replace(/{{job_title}}/g, candidate.job_title);

        await dispatch(scheduleEmail({
          to: candidate.email,
          candidateName: candidate.candidate_name,
          companyName: candidate.company_name,
          jobTitle: candidate.job_title,
          subject: compiledSubject,
          body: compiledBody,
          fromAccount: senderAccount,
          attachments: selectedTemplate.attachments || [],
          scheduledAt,
          timezone: schedTimezone
        }));
        count++;
      }

      dispatch(addNotification({
        type: 'info',
        title: 'Bulk Campaign Scheduled',
        message: `${count} emails scheduled for ${schedDate} at ${schedTime} (${schedTimezone}).`
      }));

      toast.success('Campaign Scheduled', `${count} bulk emails queued for ${schedDate} at ${schedTime}.`);
      navigate('/scheduled');
      return;
    }

    // Immediate Bulk Send with Real-Time Progress Modal
    setIsProgressModalOpen(true);
    setTotalSendingCount(validCandidates.length);
    setCurrentSendingIndex(0);
    setSentSuccessCount(0);
    setSentFailedCount(0);
    setIsSendingFinished(false);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validCandidates.length; i++) {
      const candidate = validCandidates[i];
      setCurrentSendingIndex(i + 1);
      setCurrentSendingEmail(candidate.email);

      const compiledSubject = selectedTemplate.subject
        .replace(/{{candidate_name}}/g, candidate.candidate_name)
        .replace(/{{company_name}}/g, candidate.company_name)
        .replace(/{{job_title}}/g, candidate.job_title);

      const compiledBody = selectedTemplate.body
        .replace(/{{candidate_name}}/g, candidate.candidate_name)
        .replace(/{{company_name}}/g, candidate.company_name)
        .replace(/{{job_title}}/g, candidate.job_title);

      try {
        await dispatch(sendEmailNow({
          to: candidate.email,
          candidateName: candidate.candidate_name,
          companyName: candidate.company_name,
          jobTitle: candidate.job_title,
          subject: compiledSubject,
          body: compiledBody,
          fromAccount: senderAccount,
          attachments: selectedTemplate.attachments || []
        })).unwrap();

        successCount++;
        setSentSuccessCount(successCount);
      } catch (err) {
        console.error(`Failed sending to ${candidate.email}:`, err);
        failCount++;
        setSentFailedCount(failCount);
      }
    }

    setIsSendingFinished(true);
    dispatch(addNotification({
      type: 'success',
      title: 'Bulk Dispatch Completed',
      message: `Completed bulk run of ${validCandidates.length} emails: ${successCount} sent, ${failCount} failed.`
    }));
  };

  const handleReset = () => {
    dispatch(resetBulkState());
    setActiveStep(1);
    setSelectedTemplateId('');
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Bulk Email Campaign
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Upload CSV recipient sheets, map variable fields, validate data, and launch bulk personalized outreach.
          </p>
        </div>
        {fileName && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Campaign
          </Button>
        )}
      </div>

      {/* Steps indicator */}
      <div className="grid grid-cols-3 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-2.5 rounded-card">
        {[
          { step: 1, label: 'Upload Contacts', desc: 'Drop CSV sheet' },
          { step: 2, label: 'Validate Variables', desc: 'Verify recipient details' },
          { step: 3, label: 'Configure & Launch', desc: 'Select template & dispatch' }
        ].map((item) => (
          <div
            key={item.step}
            onClick={() => {
              if (item.step === 1 || (item.step === 2 && fileName) || (item.step === 3 && fileName)) {
                setActiveStep(item.step);
              }
            }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
              activeStep === item.step
                ? 'bg-slate-100 dark:bg-slate-800/80 ring-1 ring-slate-200 dark:ring-slate-700'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                activeStep === item.step
                  ? 'bg-primary text-white'
                  : item.step < activeStep
                  ? 'bg-success text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {item.step < activeStep ? '✓' : item.step}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
              <span className="text-[10px] text-slate-400">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {activeStep === 1 && (
        <Card className="flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Upload Recipient Sheet</h3>
            <p className="text-xs text-slate-400">
              CSV file must contain an "email" column. Optional fields: candidate_name, company_name, job_title.
            </p>
          </div>

          <FileUpload
            accept=".csv"
            onFileSelect={handleCSVUpload}
            maxSizeMB={5}
            hint="Upload CSV file with email addresses"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <Button variant="outline" size="sm" onClick={downloadSampleCSV} icon={Download}>
              Download Sample CSV Template
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Validate */}
      {activeStep === 2 && (
        <Card className="flex flex-col gap-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Recipient Data Validation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Loaded <strong className="text-slate-700 dark:text-slate-200">{fileName}</strong> — {candidates.length} total rows
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-xs">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                {validCount} Valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="danger" className="px-3 py-1 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  {invalidCount} Invalid
                </Badge>
              )}
            </div>
          </div>

          {/* Data Table Preview */}
          <div className="max-h-[350px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-[12px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Candidate Name</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Job Title</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {candidates.map((c) => (
                  <tr key={c.id} className={!c.isValid ? 'bg-danger/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/40'}>
                    <td className="py-2.5 px-3">
                      {c.isValid ? (
                        <span className="text-success font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="text-danger font-bold flex items-center gap-1" title={c.error}>
                          <AlertTriangle className="w-3.5 h-3.5" /> Invalid
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{c.email}</td>
                    <td className="py-2.5 px-3 text-slate-500">{c.candidate_name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{c.company_name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{c.job_title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button variant="outline" size="sm" onClick={() => setActiveStep(1)} icon={ArrowLeft}>
              Back to upload
            </Button>
            <Button variant="primary" size="sm" onClick={() => setActiveStep(3)} icon={ArrowRight}>
              Continue to Configure ({validCount} Valid)
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Configure & Launch */}
      {activeStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2 flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Configure Outreach Run</h3>
              <p className="text-xs text-slate-400">
                Select sender account, template pattern, and optional delivery schedule for {validCount} valid recipients.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Sender Account */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Outbound Sender Account
                </label>
                <select
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.email}>
                      {acc.email} {acc.isPrimary ? '(Primary Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Email Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a template...</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduling Controls */}
              <div className="flex flex-col gap-3 p-4 rounded-[14px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Schedule Campaign for Later
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScheduleEnabled(!isScheduleEnabled)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      isScheduleEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isScheduleEnabled ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isScheduleEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Date</label>
                      <input
                        type="date"
                        value={schedDate}
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="py-2 px-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Time</label>
                      <input
                        type="time"
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="py-2 px-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Action */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(2)} icon={ArrowLeft}>
                  Back to validation
                </Button>
                <Button
                  variant={isScheduleEnabled ? "primary" : "success"}
                  size="sm"
                  onClick={handleLaunchCampaign}
                  disabled={!selectedTemplateId || !senderAccount}
                  icon={isScheduleEnabled ? Calendar : Send}
                >
                  {isScheduleEnabled ? `Schedule Campaign (${validCount})` : `Start Bulk Campaign Now (${validCount})`}
                </Button>
              </div>
            </div>
          </Card>

          {/* Guidance Sidebar Card */}
          <Card className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">Campaign Details</h4>
            </div>
            <div className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Total Valid Recipients:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{validCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Invalid Records Skipped:</span>
                <span className="font-bold text-rose-500">{invalidCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Outbound Sender:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{senderAccount}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── REAL-TIME BULK PROGRESS POPUP MODAL ── */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => {
          if (isSendingFinished) {
            setIsProgressModalOpen(false);
            handleReset();
          }
        }}
        title={isSendingFinished ? "Bulk Campaign Completed" : "Dispatching Bulk Outreach..."}
        size="sm"
      >
        <div className="flex flex-col gap-5 text-center p-2">
          {/* Animated Spinner or Check Icon */}
          <div className="flex items-center justify-center">
            {isSendingFinished ? (
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full bg-primary/10 animate-ping" />
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Current Counter & Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>{isSendingFinished ? "All Processed" : `Sending ${currentSendingIndex} of ${totalSendingCount}`}</span>
              <span className="text-primary">{Math.round(((currentSendingIndex || 0) / (totalSendingCount || 1)) * 100)}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.round(((currentSendingIndex || 0) / (totalSendingCount || 1)) * 100)}%` }}
              />
            </div>

            {!isSendingFinished && currentSendingEmail && (
              <span className="text-xs text-slate-400 font-semibold truncate mt-1">
                Recipient: <strong className="text-slate-600 dark:text-slate-300">{currentSendingEmail}</strong>
              </span>
            )}
          </div>

          {/* Live Sent / Failed Counters */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex flex-col p-3 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{sentSuccessCount}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Sent (Success)</span>
            </div>
            <div className="flex flex-col p-3 rounded-[12px] bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{sentFailedCount}</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase">Failed</span>
            </div>
          </div>

          {/* Modal Close Button */}
          {isSendingFinished && (
            <Button
              variant="primary"
              size="md"
              className="w-full mt-2"
              onClick={() => {
                setIsProgressModalOpen(false);
                handleReset();
                navigate('/sent');
              }}
            >
              View Dispatched Campaign Logs
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BulkEmail;
