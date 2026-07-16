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
  Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FileUpload from '../components/ui/FileUpload';
import { useToast } from '../components/ui/Toast';
import {
  setCSVData,
  startSending,
  updateSendProgress,
  completeSending,
  resetBulkState
} from '../redux/slices/bulkSlice';
import { sendEmailNow } from '../redux/slices/emailsSlice';
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

  // Mock candidates to load if the user uploads a CSV
  const dummyCSVRows = [
    { email: 'hiring@airbnb.com', candidate_name: 'Alex Harrison', company_name: 'Airbnb', job_title: 'Staff UI Engineer' },
    { email: 'careers@figma.com', candidate_name: 'Alex Harrison', company_name: 'Figma', job_title: 'Product Engineer' },
    { email: 'recruiting@stripe.com', candidate_name: 'Alex Harrison', company_name: 'Stripe', job_title: 'Frontend Lead' },
    { email: 'jobs@uber.com', candidate_name: 'Alex Harrison', company_name: 'Uber', job_title: 'Senior React Developer' },
    { email: 'invalid-email-address', candidate_name: 'Alex Harrison', company_name: 'Unknown LLC', job_title: 'Developer' }, // Invalid email
    { email: 'hr@vercel.com', candidate_name: '', company_name: 'Vercel', job_title: 'Vite Maintainer' } // Missing name
  ];

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

        // Parse headers (first line)
        const headers = rows[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        
        // Find header indexes (flexible names support)
        const emailIdx = headers.indexOf('email');
        const nameIdx = headers.findIndex(h => h.includes('name') || h === 'candidate_name');
        const companyIdx = headers.findIndex(h => h.includes('company') || h === 'company_name');
        const titleIdx = headers.findIndex(h => h.includes('title') || h === 'job_title' || h.includes('role') || h.includes('custom'));

        if (emailIdx === -1) {
          toast.error('Validation Error', 'CSV must contain an "email" column.');
          return;
        }

        const parsedCandidates = [];

        // Parse remaining data lines
        for (let i = 1; i < rows.length; i++) {
          const rowText = rows[i].trim();
          if (!rowText) continue;

          // Split columns while taking quotes into account
          const values = [];
          let currentVal = '';
          let insideQuotes = false;
          
          for (let charIdx = 0; charIdx < rowText.length; charIdx++) {
            const char = rowText[charIdx];
            if (char === '"' || char === "'") {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
              currentVal = '';
            } else {
              currentVal += char;
            }
          }
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

          if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

          parsedCandidates.push({
            email: values[emailIdx] || '',
            candidate_name: nameIdx !== -1 ? values[nameIdx] || '' : '',
            company_name: companyIdx !== -1 ? values[companyIdx] || '' : '',
            job_title: titleIdx !== -1 ? values[titleIdx] || '' : ''
          });
        }

        if (parsedCandidates.length === 0) {
          toast.error('Validation Error', 'No valid recipient records found in the CSV.');
          return;
        }

        dispatch(setCSVData({ fileName: file.name, candidates: parsedCandidates }));
        toast.success('CSV Parsed', `Loaded ${parsedCandidates.length} contacts from ${file.name}.`);
        setActiveStep(2);
      };
      reader.onerror = () => {
        toast.error('Read Error', 'Failed to read the selected CSV file.');
      };
      reader.readAsText(file);
    }
  };

  const executeBulkDispatch = () => {
    if (!selectedTemplateId) {
      toast.error('Dispatch Configuration', 'Please select an outreach template before running.');
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) return;

    dispatch(startSending());
    setActiveStep(3);

    // Simulate progress sending
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      dispatch(updateSendProgress(progress));

      if (progress >= 100) {
        clearInterval(interval);
        dispatch(completeSending());
        
        // Dispatch only valid candidates
        const validCandidates = candidates.filter((c) => c.isValid);
        
        validCandidates.forEach((candidate) => {
          // Replace placeholders
          const compiledSubject = selectedTemplate.subject
            .replace(/{{candidate_name}}/g, candidate.candidate_name)
            .replace(/{{company_name}}/g, candidate.company_name)
            .replace(/{{job_title}}/g, candidate.job_title);

          const compiledBody = selectedTemplate.body
            .replace(/{{candidate_name}}/g, candidate.candidate_name)
            .replace(/{{company_name}}/g, candidate.company_name)
            .replace(/{{job_title}}/g, candidate.job_title);

          dispatch(
            sendEmailNow({
              to: candidate.email,
              candidateName: candidate.candidate_name,
              companyName: candidate.company_name,
              jobTitle: candidate.job_title,
              subject: compiledSubject,
              body: compiledBody,
              fromAccount: senderAccount,
              attachments: selectedTemplate.attachments
            })
          );
        });

        // Add Notification
        dispatch(
          addNotification({
            type: 'success',
            title: 'Bulk Dispatch Completed',
            message: `Sent outbox run of ${validCandidates.length} personalized messages from ${senderAccount}.`
          })
        );

        toast.success(
          'Bulk Run Completed',
          `Dispatched ${validCandidates.length} personalized emails successfully.`
        );
      }
    }, 600);
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
            className={`flex flex-col md:flex-row items-center gap-2.5 p-3 rounded-button transition-colors text-center md:text-left
              ${activeStep === item.step ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-primary' : 'text-slate-400'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                ${
                  activeStep === item.step
                    ? 'bg-primary text-white'
                    : activeStep > item.step
                    ? 'bg-success text-white'
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-400'
                }`}
            >
              {activeStep > item.step ? '✓' : item.step}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">{item.label}</span>
              <span className="text-[10px] text-slate-400 hidden md:block">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <div className="flex flex-col gap-6">
        {/* Step 1: Upload CSV */}
        {activeStep === 1 && (
          <Card className="p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              <Database className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Import Contacts & Recipients</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Import your CSV contact list. Use column headers: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px]">email</code>, <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px]">candidate_name</code> (as name), <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px]">company_name</code> (as company), and <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px]">job_title</code> (as custom field/role).
              </p>
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:text-indigo-400 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 rounded-button cursor-pointer border border-primary/20 hover:border-primary/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample CSV
              </button>
            </div>
            <FileUpload
              accept=".csv"
              maxSizeMB={2}
              label="Select campaign recipient spreadsheet (.csv)"
              sublabel="Drop sheet or click to upload demo data"
              onFileSelect={handleCSVUpload}
              className="max-w-xl mt-2"
            />
          </Card>
        )}

        {/* Step 2: Validate Contacts Grid */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contacts validation table */}
            <Card className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Recipient Variable Validation</h3>
                  <p className="text-xs text-slate-400">Total: {candidates.length} records parsed</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="success">{validCount} Valid</Badge>
                  <Badge variant="danger">{invalidCount} Invalid</Badge>
                </div>
              </div>

              <div className="overflow-x-auto rounded-[12px] border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900/10 font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Recipient Name</th>
                      <th className="px-4 py-3">Company / Org</th>
                      <th className="px-4 py-3">Role / Custom Field</th>
                      <th className="px-4 py-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-transparent text-slate-600 dark:text-slate-300">
                    {candidates.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-semibold truncate max-w-[150px]">{c.email}</td>
                        <td className="px-4 py-3 font-medium truncate max-w-[120px]">{c.candidate_name || <span className="text-danger">Missing</span>}</td>
                        <td className="px-4 py-3 font-medium truncate max-w-[100px]">{c.company_name}</td>
                        <td className="px-4 py-3 font-medium truncate max-w-[120px]">{c.job_title}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={c.isValid ? 'success' : 'danger'}>
                            {c.isValid ? 'Valid' : 'Field Error'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(1)} icon={ArrowLeft}>
                  Back to Upload
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveStep(3)} disabled={validCount === 0}>
                  Next: Configure Campaign <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Field validations descriptions card */}
            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-warning" />
                  <h4 className="text-sm font-bold text-slate-950 dark:text-white">Validation Warnings</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only rows labeled <span className="text-success font-bold">Valid</span> will be generated. Empty columns or syntactically incorrect emails are ignored automatically to prevent bouncing errors.
                </p>
                <div className="flex flex-col gap-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-danger uppercase tracking-wider block">Line 5 - email format</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">"invalid-email-address" must contain a valid domain extension.</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-danger uppercase tracking-wider block">Line 6 - name check</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">"candidate_name" is required for email personalization.</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Run Campaign & Progress bar */}
        {activeStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configure and dispatch */}
            <Card className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Campaign Configuration</h3>
                  <p className="text-xs text-slate-400">Total valid dispatches: {validCount} items</p>
                </div>
              </div>

              {!isSending && sendProgress === 0 ? (
                /* Pre-dispatch configure fields */
                <div className="flex flex-col gap-4">
                  {/* Select Sender Credentials */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Select Sender Account
                    </label>
                    <select
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.email} disabled={a.status === 'expired'}>
                          {a.email} {a.status === 'expired' ? '(OAuth Token Expired)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Outreach Template */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Apply Email Template
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="">Select a template...</option>
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} ({tpl.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveStep(2)} icon={ArrowLeft}>
                      Back to validation
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={executeBulkDispatch}
                      disabled={!selectedTemplateId || !senderAccount}
                      icon={Play}
                    >
                      Start Bulk Campaign Now
                    </Button>
                  </div>
                </div>
              ) : (
                /* Dispatch progress view */
                <div className="py-8 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white animate-pulse">
                      {sendProgress < 100 ? 'Personalizing & Dispatching...' : 'Dispatch Run Completed'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Evaluating tokens and dispatching emails via Gmail API relay
                    </p>
                  </div>

                  {/* Circular/Line progress */}
                  <div className="w-full max-w-md flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{sendProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                        style={{ width: `${sendProgress}%` }}
                      />
                    </div>
                  </div>

                  {sendProgress === 100 && (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-center text-success">
                        <CheckCircle className="w-12 h-12" />
                      </div>
                      <div className="flex flex-wrap gap-2.5 justify-center max-w-md">
                        <Button variant="outline" size="sm" onClick={handleReset}>
                          Run Another Campaign
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate('/sent')}>
                          View Dispatched Mail
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Campaign info guidance card */}
            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-950 dark:text-white">Campaign Automation</h4>
                </div>
                <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <p>
                    Each recipient's custom details (name, company, and role/field) are dynamically merged into your email template placeholders.
                  </p>
                  <p>
                    We apply standard rate limits with built-in dispatch delays to protect your sender domain reputation.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEmail;
