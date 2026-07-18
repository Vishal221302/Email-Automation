import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldAlert, Plus, Globe } from 'lucide-react';
import { loginUser, registerUser, socialLogin, clearAuthError } from '../redux/slices/authSlice';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [isLoginView, setIsLoginView] = useState(true);
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  // Social Login Selectors
  const [socialModalType, setSocialModalType] = useState(null); // 'google' | 'facebook' | null
  const [customSocialMode, setCustomSocialMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  // Handle URL errors (like OAuth callback errors)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error('Authentication Error', decodeURIComponent(errorParam));
      // Clean query params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    dispatch(clearAuthError());
    reset();
  }, [isLoginView, dispatch, reset]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Access Granted', 'Welcome to your performance workspace.');
      navigate('/');
    }
  }, [isAuthenticated, navigate, toast]);

  const onSubmit = (data) => {
    if (isLoginView) {
      dispatch(loginUser({ email: data.email, password: data.password }));
    } else {
      if (!data.name) {
        toast.error('Validation Error', 'Please enter your full name to sign up.');
        return;
      }
      dispatch(registerUser({ name: data.name, email: data.email, password: data.password }));
    }
  };

  const handleSocialSelect = (name, email, avatar) => {
    dispatch(socialLogin({
      email,
      name,
      provider: socialModalType,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
    }));
    setSocialModalType(null);
    setCustomSocialMode(false);
  };

  const handleCustomSocialSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customName) {
      toast.error('Error', 'Please fill in all details.');
      return;
    }
    handleSocialSelect(customName, customEmail, null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background glowing shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 dark:bg-primary/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/8 dark:bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="p-3.5 bg-gradient-to-tr from-primary to-cyan-500 text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white m-0 mt-1">
            MailFlow Pro
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 max-w-xs leading-relaxed font-semibold">
            Smart email automation, Gmail OAuth & outreach campaigns.
          </p>
        </div>

        {/* Credentials Authentication Card */}
        <Card className="p-7 flex flex-col gap-5 text-left border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl relative rounded-[20px]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
            {isLoginView ? 'Welcome Back' : 'Create SaaS Account'}
          </h2>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLoginView ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {!isLoginView && (
                <Input
                  label="Full Name"
                  placeholder="Alex Harrison"
                  error={errors.name?.message}
                  icon={User}
                  {...register('name', { required: 'Full name is required for registration' })}
                />
              )}

              <Input
                label="Email Address"
                placeholder="developer@gmail.com"
                error={errors.email?.message}
                icon={Mail}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email formatting'
                  }
                })}
              />

              <Input
                type="password"
                label="Account Password"
                placeholder="••••••••"
                error={errors.password?.message}
                icon={Lock}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />

              {error && (
                <div className="flex gap-2 p-3 bg-danger/10 text-danger border border-danger/20 rounded-[12px] text-xs font-semibold">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full mt-2 py-2.5 font-bold"
              >
                {isLoginView ? 'Login Workspace' : 'Sign Up Workspace'}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Social Sign-In Section */}
          <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
            <div className="relative flex items-center justify-center">
              <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or Continue With
              </span>
              <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              {/* Google login Button */}
              <button
                type="button"
                onClick={() => { window.location.href = 'https://email-automation-backend-dl1c.onrender.com/api/auth/google'; }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 text-xs font-bold text-slate-700 dark:text-slate-250 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8.05 12.57a5.94 5.94 0 0 1 5.94-5.94c1.614 0 3.08.622 4.18 1.636l3.228-3.227C19.345 3.1 16.827 2 13.99 2 8.472 2 4 6.472 4 11.99s4.472 10 9.99 10c6.046 0 10.04-4.256 10.04-10.215 0-.693-.062-1.36-.182-2H12.24Z"
                  />
                </svg>
                Google
              </button>

              {/* Facebook Login Button */}
              <button
                type="button"
                onClick={() => { window.location.href = 'https://email-automation-backend-dl1c.onrender.com/api/auth/facebook'; }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 text-xs font-bold text-slate-700 dark:text-slate-250 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"
                  />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* View Toggle link */}
          <div className="text-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1 flex flex-col gap-2.5 items-center justify-center text-xs">
            <div className="flex gap-1">
              <span className="text-slate-450 dark:text-slate-550 font-semibold">
                {isLoginView ? "Don't have an account?" : 'Already registered?'}
              </span>
              <button
                onClick={() => setIsLoginView(!isLoginView)}
                className="text-primary hover:text-indigo-400 font-bold border-none bg-transparent cursor-pointer focus:outline-none"
              >
                {isLoginView ? 'Register now' : 'Login instead'}
              </button>
            </div>

            {/* Sandbox Option */}
            <button
              type="button"
              onClick={() => { setCustomSocialMode(false); setSocialModalType('google'); }}
              className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-primary underline bg-transparent border-none cursor-pointer focus:outline-none font-semibold"
            >
              Demo: Launch Simulated Dev Sandbox Chooser
            </button>
          </div>
        </Card>
      </div>

      {/* ── SOCIAL AUTHENTICATOR ACCOUNT CHOOSER DIALOG ──────────────── */}
      <Modal
        isOpen={socialModalType !== null}
        onClose={() => { setSocialModalType(null); setCustomSocialMode(false); }}
        title={socialModalType === 'google' ? 'Sign in with Google' : 'Log in with Facebook'}
        size="sm"
      >
        <div className="flex flex-col gap-4 text-left">
          {!customSocialMode ? (
            <div className="flex flex-col gap-3.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Real OAuth Authorization
              </span>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `https://email-automation-backend-dl1c.onrender.com/api/auth/${socialModalType}`;
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] bg-primary text-white text-xs font-black shadow-md shadow-primary/20 hover:bg-indigo-400 transition-colors cursor-pointer"
              >
                Launch Real {socialModalType === 'google' ? 'Google' : 'Facebook'} OAuth Login
              </button>

              <div className="relative flex items-center justify-center my-1.5">
                <span className="absolute bg-white dark:bg-slate-900 px-3 text-[9px] font-bold text-slate-450 uppercase tracking-widest">
                  Or Dev Sandbox (Simulated)
                </span>
                <div className="w-full border-t border-slate-100 dark:border-slate-805" />
              </div>
              
              {/* Account 1: Vishal Patel */}
              <div
                onClick={() => handleSocialSelect('Patel Vishal', 'vishal@gmail.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vishal')}
                className="flex items-center gap-3 p-3 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950/20 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center shadow-sm">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vishal" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Patel Vishal</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">vishal@gmail.com</span>
                </div>
                <Badge variant="success" className="text-[9px] uppercase">Premium</Badge>
              </div>

              {/* Account 2: Test Account */}
              <div
                onClick={() => handleSocialSelect('Test User', 'test@gmail.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test')}
                className="flex items-center gap-3 p-3 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950/20 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center shadow-sm">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Test" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Test User</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">test@gmail.com</span>
                </div>
                <Badge variant="neutral" className="text-[9px] uppercase">Standard</Badge>
              </div>

              {/* Use custom account button */}
              <div
                onClick={() => setCustomSocialMode(true)}
                className="flex items-center gap-3 p-3 rounded-[12px] border border-dashed border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-350 group-hover:text-primary transition-colors">Use another account</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Sign in using any custom social email</span>
                </div>
              </div>
            </div>
          ) : (
            // Custom Input form
            <form onSubmit={handleCustomSocialSubmit} className="flex flex-col gap-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">
                Enter your {socialModalType} profile information:
              </span>
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. developer@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setCustomSocialMode(false)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" type="submit" icon={Globe}>
                  Link & Login
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Login;
