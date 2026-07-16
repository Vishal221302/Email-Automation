import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Send,
  Calendar,
  Eye,
  FileDown,
  Paperclip,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  FileText,
  Image,
  Film,
  Music,
  File
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import CalendarPicker from '../components/ui/CalendarPicker';
import FileUpload from '../components/ui/FileUpload';
import { useToast } from '../components/ui/Toast';
import { sendEmailNow, scheduleEmail, clearCurrentCompose } from '../redux/slices/emailsSlice';
import { addNotification } from '../redux/slices/notificationsSlice';

const ComposeEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { accounts } = useSelector((state) => state.accounts);
  const { templates } = useSelector((state) => state.templates);
  const { currentComposeEmail } = useSelector((state) => state.emails);
  const { signature, autoAttachResume, attachedResumes } = useSelector((state) => state.settings);

  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Custom scheduling states
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedTimezone, setSchedTimezone] = useState('Asia/Kolkata');
  
  // Attachments State
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const defaultValues = {
    fromAccount: accounts.find(a => a.isPrimary)?.email || accounts[0]?.email || '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    templateId: '',
    candidateName: '',
    companyName: '',
    jobTitle: ''
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues
  });

  const watchTemplateId = watch('templateId');
  const watchSubject = watch('subject');
  const watchBody = watch('body');
  const watchCandidateName = watch('candidateName');
  const watchCompanyName = watch('companyName');
  const watchJobTitle = watch('jobTitle');

  // Handle template selection auto-population
  useEffect(() => {
    if (watchTemplateId) {
      const selectedTpl = templates.find(t => t.id === watchTemplateId);
      if (selectedTpl) {
        setValue('subject', selectedTpl.subject);
        setValue('body', selectedTpl.body);
        if (selectedTpl.attachments && selectedTpl.attachments.length > 0) {
          setUploadedFiles(selectedTpl.attachments);
        } else {
          setUploadedFiles([]);
        }
        toast.info('Template Applied', `"${selectedTpl.name}" subject and body loaded.`);
      }
    }
  }, [watchTemplateId, templates, setValue]);

  // Handle duplicated emails populated on routing
  useEffect(() => {
    if (currentComposeEmail) {
      setValue('to', currentComposeEmail.to || '');
      setValue('subject', currentComposeEmail.subject || '');
      setValue('body', currentComposeEmail.body || '');
      setValue('companyName', currentComposeEmail.companyName || '');
      setValue('jobTitle', currentComposeEmail.jobTitle || '');
      setValue('candidateName', currentComposeEmail.candidateName || 'Alex Harrison');
      if (currentComposeEmail.attachments) {
        setUploadedFiles(currentComposeEmail.attachments);
      }
      
      toast.info('Draft Loaded', 'Duplicated message settings imported.');
      dispatch(clearCurrentCompose());
    }
  }, [currentComposeEmail, setValue, dispatch]);

  // Auto attach resume if enabled in settings
  useEffect(() => {
    if (autoAttachResume && attachedResumes.length > 0) {
      const defaultResume = attachedResumes.find(r => r.isDefault) || attachedResumes[0];
      setUploadedFiles(prev => {
        // Prevent duplication
        if (prev.some(f => f.name === defaultResume.name)) return prev;
        return [...prev, defaultResume];
      });
    }
  }, [autoAttachResume, attachedResumes]);

  const compileTemplate = (text) => {
    if (!text) return '';
    return text
      .replace(/{{candidate_name}}/g, watchCandidateName || '[Candidate Name]')
      .replace(/{{company_name}}/g, watchCompanyName || '[Company Name]')
      .replace(/{{job_title}}/g, watchJobTitle || '[Job Title]')
      .replace(/{{today_date}}/g, new Date().toLocaleDateString());
  };

  const getFileIcon = (file) => {
    const mime = file.mimeType || '';
    const name = file.name?.toLowerCase() || '';
    if (mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(name))
      return <Image className="w-3.5 h-3.5 text-emerald-500" />;
    if (mime.startsWith('video/') || /\.(mp4|mov|avi|mkv)$/.test(name))
      return <Film className="w-3.5 h-3.5 text-purple-500" />;
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg)$/.test(name))
      return <Music className="w-3.5 h-3.5 text-pink-500" />;
    if (/\.(pdf)$/.test(name))
      return <FileText className="w-3.5 h-3.5 text-red-500" />;
    if (/\.(doc|docx)$/.test(name))
      return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    return <File className="w-3.5 h-3.5 text-slate-400" />;
  };

  const handleFileAttach = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result.split(',')[1]; // Strip the data:...;base64, prefix
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data
        }]);
        toast.success('Attachment Added', `Attached ${file.name}`);
      };
      reader.onerror = () => toast.error('Read Error', `Failed to read ${file.name}`);
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index) => {
    const file = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('Attachment Removed', `Removed ${file.name}`);
  };

  const onSubmit = (data) => {
    const processedBody = compileTemplate(data.body);
    const processedSubject = compileTemplate(data.subject);

    if (isScheduleEnabled) {
      if (!schedDate || !schedTime) {
        toast.error('Schedule Error', 'Please select a delivery date and time.');
        return;
      }
      const scheduledDateTime = `${schedDate}T${schedTime}:00`;
      
      const payload = {
        ...data,
        body: processedBody,
        subject: processedSubject,
        scheduledAt: new Date(scheduledDateTime).toISOString(),
        timezone: schedTimezone,
        attachments: uploadedFiles
      };

      dispatch(scheduleEmail(payload));
      
      dispatch(addNotification({
        type: 'info',
        title: 'Email Scheduled',
        message: `Application to ${data.companyName || data.to} scheduled for ${schedDate} at ${schedTime} (${schedTimezone}).`
      }));

      toast.success('Successfully Scheduled', 'Your email has been added to the scheduled queue.');
      navigate('/scheduled');
    } else {
      const payload = {
        ...data,
        body: processedBody,
        subject: processedSubject,
        attachments: uploadedFiles
      };

      dispatch(sendEmailNow(payload));

      dispatch(addNotification({
        type: 'success',
        title: 'Application Dispatched',
        message: `Your job application to ${data.companyName || data.to} was sent successfully.`
      }));

      toast.success('Email Sent', `Delivered successfully to ${data.to}.`);
      navigate('/sent');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
          Compose Outreach
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
          Prepare personalized cover letters or job outreach notes, schedule delivery, and log outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Compose Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            {/* Template Chooser */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Apply Template (Optional)
              </label>
              <select
                {...register('templateId')}
                className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200"
              >
                <option value="">Select a template...</option>
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.category})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Connected Accounts Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  From Account
                </label>
                <select
                  {...register('fromAccount', { required: 'From Account is required' })}
                  className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.email} disabled={acc.status === 'expired'}>
                      {acc.email} {acc.status === 'expired' ? '(Token Expired)' : ''}
                    </option>
                  ))}
                </select>
                {errors.fromAccount && <span className="text-xs text-danger">{errors.fromAccount.message}</span>}
              </div>

              {/* To Address */}
              <Input
                label="To (Recipient Email)"
                placeholder="hiring@company.com"
                error={errors.to?.message}
                {...register('to', {
                  required: 'Recipient email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>

            {/* CC / BCC Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
              >
                CC / BCC {showCcBcc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showCcBcc && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CC"
                  placeholder="manager@company.com"
                  error={errors.cc?.message}
                  {...register('cc')}
                />
                <Input
                  label="BCC"
                  placeholder="outbox-tracker@service.com"
                  error={errors.bcc?.message}
                  {...register('bcc')}
                />
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            {/* Subject */}
            <Input
              label="Subject Line"
              placeholder="Application for role..."
              error={errors.subject?.message}
              {...register('subject', { required: 'Subject line is required' })}
            />

            {/* Cover Letter Body */}
            <div className="relative">
              <Textarea
                label="Email Body"
                placeholder="Write your email body here. You can use variables like {{company_name}} and {{candidate_name}}."
                rows={12}
                error={errors.body?.message}
                {...register('body', { required: 'Email body is required' })}
              />
              <div className="absolute right-4 bottom-2 text-[10px] font-semibold text-slate-400">
                Variables: click sidebar guide
              </div>
            </div>

            {/* List Attached files */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                  >
                    {getFileIcon(file)}
                    <span className="text-slate-600 dark:text-slate-300 max-w-[150px] truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">({file.size})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-slate-400 hover:text-danger cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attach File Field - All types supported */}
            <FileUpload
              accept="*"
              maxSizeMB={25}
              label="Attach files — documents, images, videos, audio"
              sublabel="PDF, DOCX, PNG, JPG, MP4, MP3 and more · Max 25MB"
              onFileSelect={handleFileAttach}
            />

            {/* Schedule Toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Schedule Delivery</span>
                <span className="text-xs text-slate-400">Deliver this message at a specific local hour later</span>
              </div>
              <input
                type="checkbox"
                checked={isScheduleEnabled}
                onChange={() => setIsScheduleEnabled(!isScheduleEnabled)}
                className="w-4.5 h-4.5 accent-primary cursor-pointer"
              />
            </div>

            {/* Schedule Fields */}
            {isScheduleEnabled && (
              <CalendarPicker
                selectedDate={schedDate}
                onDateChange={setSchedDate}
                selectedTime={schedTime}
                onTimeChange={setSchedTime}
                selectedTimezone={schedTimezone}
                onTimezoneChange={setSchedTimezone}
              />
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  toast.success('Draft Saved', 'Your email composition has been saved to drafts.');
                  navigate('/sent');
                }}
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsPreviewOpen(true)}
                icon={Eye}
              >
                Compile Preview
              </Button>
              <Button
                type="submit"
                variant={isScheduleEnabled ? 'secondary' : 'primary'}
                size="md"
                icon={isScheduleEnabled ? Calendar : Send}
              >
                {isScheduleEnabled ? 'Schedule Delivery' : 'Send Message Now'}
              </Button>
            </div>
          </Card>
        </form>

        {/* Dynamic Variable Helper Cards */}
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personalization Tokens</h4>
            </div>
            <p className="text-xs text-slate-400">
              Input variables to auto-fill placeholders. The preview panel evaluates these values dynamically.
            </p>
            <div className="flex flex-col gap-3">
              <Input
                label="Candidate Full Name ({{candidate_name}})"
                placeholder="Alex Harrison"
                {...register('candidateName')}
              />
              <Input
                label="Company Name ({{company_name}})"
                placeholder="Stripe"
                {...register('companyName')}
              />
              <Input
                label="Target Job Title ({{job_title}})"
                placeholder="Frontend Developer"
                {...register('jobTitle')}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-3.5 bg-indigo-50/20 dark:bg-indigo-950/10 text-left border-indigo-100 dark:border-indigo-900/50">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary">Dynamic Variable Guide</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Placeholder formulas such as <code className="text-[10px] px-1 py-0 bg-white dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700">{"{{company_name}}"}</code> are replaced with the input parameters during rendering.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Live Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Dynamic Live Preview"
        size="lg"
      >
        <div className="flex flex-col gap-5 text-left">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex gap-2.5 text-xs text-slate-500">
              <span className="font-bold w-12 text-right">From:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{watch('fromAccount')}</span>
            </div>
            <div className="flex gap-2.5 text-xs text-slate-500">
              <span className="font-bold w-12 text-right">To:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{watch('to') || '[Recipient Email]'}</span>
            </div>
            <div className="flex gap-2.5 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="font-bold w-12 text-right">Subject:</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {compileTemplate(watchSubject) || '[Subject Line]'}
              </span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[12px] min-h-[250px] overflow-y-auto max-h-[400px]">
            <pre className="text-sm font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {compileTemplate(watchBody) || '[Email Body is empty]'}
            </pre>
            {signature && (
              <pre className="text-sm font-sans text-slate-400 dark:text-slate-500 whitespace-pre-wrap leading-relaxed border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 mt-4">
                {signature}
              </pre>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider self-center mr-1">Attachments:</span>
              {uploadedFiles.map((file, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  <Paperclip className="w-3 h-3 text-slate-400" />
                  {file.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsPreviewOpen(false);
                onSubmit(watch());
              }}
            >
              {isScheduleEnabled ? 'Approve & Schedule' : 'Approve & Send Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComposeEmail;
