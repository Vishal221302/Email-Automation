import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Bookmark, Sparkles, Eye, Save, CornerDownLeft, Paperclip, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import FileUpload from '../components/ui/FileUpload';
import { useToast } from '../components/ui/Toast';
import { addTemplate, editTemplate } from '../redux/slices/templatesSlice';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const bodyRef = useRef(null);
  const { templates } = useSelector((state) => state.templates);
  const isEditMode = !!id;

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview' (for responsive mobile)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      category: 'Job Application',
      subject: '',
      body: ''
    }
  });

  const watchSubject = watch('subject');
  const watchBody = watch('body');

  // Load existing template data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const template = templates.find((t) => t.id === id);
      if (template) {
        setValue('name', template.name);
        setValue('category', template.category);
        setValue('subject', template.subject);
        setValue('body', template.body);
        if (template.attachments) {
          setUploadedFiles(template.attachments);
        }
      } else {
        toast.error('Template Not Found', 'The requested template could not be loaded.');
        navigate('/templates');
      }
    }
  }, [id, isEditMode, templates, setValue, navigate]);

  // Insert variable pill at cursor location
  const insertVariable = (variable) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = watchBody || '';

    const newText = text.substring(0, startPos) + variable + text.substring(endPos, text.length);
    setValue('body', newText);
    
    // Reset focus and cursor position after state updates
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + variable.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);

    toast.info('Variable Injected', `Appended "${variable}" to editor cursor.`);
  };

  const compilePreview = (text) => {
    if (!text) return '';
    return text
      .replace(/{{candidate_name}}/g, 'Alex Harrison')
      .replace(/{{company_name}}/g, 'Stripe')
      .replace(/{{job_title}}/g, 'Frontend Engineer')
      .replace(/{{today_date}}/g, new Date().toLocaleDateString());
  };

  const handleFileAttach = (file) => {
    if (file) {
      setUploadedFiles((prev) => [...prev, { name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` }]);
    }
  };

  const removeAttachment = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      attachments: uploadedFiles
    };

    if (isEditMode) {
      dispatch(editTemplate({ id, ...payload }));
      toast.success('Template Updated', `"${data.name}" modifications saved successfully.`);
    } else {
      dispatch(addTemplate(payload));
      toast.success('Template Created', `"${data.name}" added to template library.`);
    }

    navigate('/templates');
  };

  const variablePills = [
    { label: 'Candidate Name', code: '{{candidate_name}}' },
    { label: 'Company Name', code: '{{company_name}}' },
    { label: 'Job Title', code: '{{job_title}}' },
    { label: 'Today\'s Date', code: '{{today_date}}' }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            {isEditMode ? 'Modify Template' : 'New Template Builder'}
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Build custom reusable message templates with active variable interpolation.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/templates')}>
          Cancel
        </Button>
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Editor Form Panel */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Name */}
              <Input
                label="Template Name"
                placeholder="e.g. Frontend Engineer - Cold Outreach"
                error={errors.name?.message}
                {...register('name', { required: 'Template name is required' })}
              />

              {/* Template Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200"
                >
                  <option value="Job Application">Job Application</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Networking">Networking</option>
                  <option value="Thank You">Thank You</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Subject Field */}
            <Input
              label="Subject Line"
              placeholder="Application for Frontend role at {{company_name}}"
              error={errors.subject?.message}
              {...register('subject', { required: 'Subject line is required' })}
            />

            {/* Injection Guide pills */}
            <div className="flex flex-col gap-2 bg-indigo-50/20 dark:bg-indigo-950/15 p-3 rounded-button border border-indigo-100/50 dark:border-indigo-900/35">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Tap variables to inject at cursor:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variablePills.map((pill) => (
                  <button
                    key={pill.code}
                    type="button"
                    onClick={() => insertVariable(pill.code)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded cursor-pointer transition-colors"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Editor */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Body Text
              </label>
              <textarea
                {...register('body', { required: 'Email body text is required' })}
                rows={11}
                placeholder="Hi {{company_name}} Team, my name is {{candidate_name}}..."
                className={`w-full py-2.5 px-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white
                  ${errors.body ? 'border-danger/80 focus:border-danger' : 'border-slate-200 dark:border-slate-800'}`}
                ref={(e) => {
                  register('body').ref(e);
                  bodyRef.current = e; // Assign to custom ref for selection hooks
                }}
              />
              {errors.body && <span className="text-xs text-danger font-medium">{errors.body.message}</span>}
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                  >
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-slate-400 hover:text-danger ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attachment Uploader */}
            <FileUpload
              accept=".pdf,.docx,.doc"
              maxSizeMB={5}
              label="Attach static templates assets"
              sublabel="These assets auto-attach when template is chosen"
              onFileSelect={handleFileAttach}
            />

            {/* Save Buttons */}
            <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button variant="outline" size="md" onClick={() => navigate('/templates')}>
                Discard
              </Button>
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Save Template
              </Button>
            </div>
          </Card>
        </form>

        {/* Live Side-by-side Preview (Desktop only) */}
        <div className="lg:col-span-2 hidden lg:flex flex-col gap-4">
          <Card className="flex-1 flex flex-col gap-4 text-left border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/10 dark:bg-slate-900/10">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Eye className="w-4.5 h-4.5 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Renderer Preview</h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluates variables using mock candidate <code className="px-1 text-[10px] bg-slate-100 dark:bg-slate-800">Alex Harrison</code> and target employer <code className="px-1 text-[10px] bg-slate-100 dark:bg-slate-800">Stripe</code>.
            </p>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500">
                Subject: <span className="text-slate-900 dark:text-white font-bold">{compilePreview(watchSubject) || '—'}</span>
              </span>
            </div>

            <div className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800/80 overflow-y-auto max-h-[350px]">
              <pre className="text-xs font-sans text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {compilePreview(watchBody) || 'Type your template body to compile preview...'}
              </pre>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="font-bold text-slate-400 uppercase">Files:</span>
                {uploadedFiles.map((file, idx) => (
                  <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> {file.name}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
