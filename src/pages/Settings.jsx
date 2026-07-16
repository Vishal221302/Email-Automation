import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Settings as SettingsIcon,
  Bell,
  Mail,
  FileText,
  Clock,
  Sparkles,
  Paperclip,
  Trash2,
  CheckCircle2,
  FileText as FileIcon
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import FileUpload from '../components/ui/FileUpload';
import { useToast } from '../components/ui/Toast';
import {
  updateSettings,
  toggleNotificationSetting,
  addResume,
  removeResume,
  setDefaultResume
} from '../redux/slices/settingsSlice';
import { updateProfile } from '../redux/slices/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const settings = useSelector((state) => state.settings);
  const { accounts } = useSelector((state) => state.accounts);
  const { templates } = useSelector((state) => state.templates);
  const { user } = useSelector((state) => state.auth);

  const [signature, setSignature] = useState(user?.signature || '');
  const [defaultAccount, setDefaultAccount] = useState(settings.defaultAccount);
  const [defaultTemplate, setDefaultTemplate] = useState(settings.defaultTemplate);
  const [autoAttach, setAutoAttach] = useState(user?.autoAttachResume ?? true);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with user profile changes
  useEffect(() => {
    if (user) {
      setSignature(user.signature || '');
      setAutoAttach(user.autoAttachResume ?? true);
    }
  }, [user]);

  const handleSaveOutboxSettings = async () => {
    setIsSaving(true);
    dispatch(
      updateSettings({
        defaultAccount,
        defaultTemplate
      })
    );
    try {
      await dispatch(updateProfile({
        signature,
        autoAttachResume: autoAttach
      })).unwrap();
      toast.success('Settings Saved', 'Default outbox credentials and signature configured.');
    } catch (err) {
      toast.error('Save Failed', err || 'Failed to sync settings with server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = (file) => {
    if (file) {
      const payload = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        isDefault: settings.attachedResumes.length === 0
      };
      dispatch(addResume(payload));
      toast.success('Resume Attached', `${file.name} uploaded to profile.`);
    }
  };

  const handleRemoveResume = (name) => {
    dispatch(removeResume(name));
    toast.info('Resume Removed', `${name} deleted from profile.`);
  };

  const handleSetDefaultResume = (name) => {
    dispatch(setDefaultResume(name));
    toast.success('Default Updated', `Set ${name} as default cover resume.`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
          Adjust SMTP defaults, notification behaviors, and standard document signatures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbox configuration */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Dispatch Defaults */}
          <Card className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
              <Mail className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delivery Defaults</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Gmail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Default Sender Account
                </label>
                <select
                  value={defaultAccount}
                  onChange={(e) => setDefaultAccount(e.target.value)}
                  className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-705 dark:text-slate-200 font-semibold"
                >
                  <option value="">No account selected</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.email}>
                      {acc.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Template */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Default Applied Template
                </label>
                <select
                  value={defaultTemplate}
                  onChange={(e) => setDefaultTemplate(e.target.value)}
                  className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-705 dark:text-slate-200 font-semibold"
                >
                  <option value="">No template by default</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Signature textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Digital Email Signature
              </label>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={4}
                placeholder="Best regards, Alex..."
                className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
              />
            </div>

            {/* Save Defaults button */}
            <div className="flex justify-end pt-1">
              <Button variant="primary" size="sm" onClick={handleSaveOutboxSettings} isLoading={isSaving}>
                Save Delivery Preferences
              </Button>
            </div>
          </Card>

          {/* Resume Vault */}
          <Card className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
              <FileText className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Resume Vault</h3>
            </div>

            <div className="flex items-center justify-between py-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-button border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Auto-Attach Resume</span>
                <p className="text-xs text-slate-450">Append default resume asset automatically on new composition</p>
              </div>
              <input
                type="checkbox"
                checked={autoAttach}
                onChange={() => setAutoAttach(!autoAttach)}
                className="w-4.5 h-4.5 accent-primary cursor-pointer"
              />
            </div>

            {/* Resumes List */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Documents</span>
              {settings.attachedResumes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No resumes uploaded yet.</p>
              ) : (
                settings.attachedResumes.map((resume) => (
                  <div
                    key={resume.name}
                    className="p-3 rounded-card border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileIcon className="w-4.5 h-4.5 text-slate-450 shrink-0" />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{resume.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{resume.size}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {resume.isDefault ? (
                        <Badge variant="success" className="rounded-md uppercase tracking-wider text-[8px] px-1.5 py-0.2">
                          Default
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-0.5 text-[9px] rounded-md font-semibold text-slate-500 border-slate-200 dark:border-slate-800"
                          onClick={() => handleSetDefaultResume(resume.name)}
                        >
                          Make Default
                        </Button>
                      )}
                      <button
                        onClick={() => handleRemoveResume(resume.name)}
                        className="p-1 rounded hover:bg-danger/10 text-slate-400 hover:text-danger cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <FileUpload
              accept=".pdf,.docx,.doc"
              maxSizeMB={5}
              label="Add resume file (.pdf/.docx)"
              sublabel="Drag and drop file here"
              onFileSelect={handleResumeUpload}
            />
          </Card>
        </div>

        {/* Sidebar Alerts config */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
              <Bell className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Alert Preferences</h3>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed">
              Configure system alerts. When checked, successful triggers display in the notification drawer center.
            </p>

            <div className="flex flex-col gap-3 mt-1.5">
              {[
                { key: 'emailFailed', label: 'Failed Deliveries', desc: 'Notify on message delivery bounces or rate failures.' },
                { key: 'emailSent', label: 'Sent Logs Confirmed', desc: 'Notify when SMTP successfully relays an outgoing message.' },
                { key: 'scheduleReminder', label: 'Cron Reminders', desc: 'Alerts ahead of upcoming scheduled outbox runs.' },
                { key: 'accountExpired', label: 'Credential Expired Alerts', desc: 'Notify if Google SMTP refresh tokens require renewal.' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-button border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                    <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={() => dispatch(toggleNotificationSetting(item.key))}
                    className="w-4 h-4 accent-primary cursor-pointer mt-0.5"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
