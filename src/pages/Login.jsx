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

          {/* View Toggle link */}
          <div className="text-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex flex-col gap-2.5 items-center justify-center text-xs">
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
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
