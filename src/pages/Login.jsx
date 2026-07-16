import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { loginUser, registerUser, clearAuthError } from '../redux/slices/authSlice';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoginView, setIsLoginView] = useState(true);
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  // Clear errors when toggling view
  useEffect(() => {
    dispatch(clearAuthError());
    reset();
  }, [isLoginView, dispatch, reset]);

  // Navigate when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Access Granted', 'Welcome to your Performance Workspace.');
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/5 dark:bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondary/5 dark:bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        {/* Logo banner */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="p-3.5 bg-gradient-to-tr from-primary to-secondary text-white rounded-2xl shadow-lg shadow-primary/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-350 bg-clip-text text-transparent m-0 mt-1">
            Antigravity Mail Workspace
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-550 max-w-xs leading-normal font-semibold">
            Access secure, automated SMTP pipelines for personalized cover letter outreach campaigns.
          </p>
        </div>

        {/* Animated Auth Card */}
        <Card className="p-7 flex flex-col gap-5 text-left border bg-white/75 dark:bg-slate-900/50 backdrop-blur-md relative">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
            {isLoginView ? 'Welcome Back' : 'Create SaaS Account'}
          </h2>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLoginView ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLoginView ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLoginView ? 12 : -12 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Form Input fields */}
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

              {/* Error box */}
              {error && (
                <div className="flex gap-2 p-3 bg-danger/10 text-danger border border-danger/20 rounded-[12px] text-xs font-semibold">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              {/* Action Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full mt-2"
              >
                {isLoginView ? 'Login Workspace' : 'Sign Up Workspace'}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Toggle link */}
          <div className="text-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1 flex justify-center gap-1 text-xs">
            <span className="text-slate-450 dark:text-slate-500 font-semibold">
              {isLoginView ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-primary hover:text-indigo-400 font-bold border-none bg-transparent cursor-pointer focus:outline-none"
            >
              {isLoginView ? 'Register now' : 'Login instead'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
