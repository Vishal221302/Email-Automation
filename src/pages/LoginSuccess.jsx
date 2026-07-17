import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { RefreshCw } from 'lucide-react';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');

    if (token && userJson) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userJson);

        toast.success('OAuth Login Success', 'Successfully authenticated and logged in!');
        
        // Force full page redirect to load clean store states
        window.location.href = '/';
      } catch (err) {
        toast.error('OAuth Storage Error', 'Could not store credentials in local storage.');
        navigate('/login');
      }
    } else {
      toast.error('OAuth Callback Error', 'Missing authentication parameters.');
      navigate('/login');
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100">
      <RefreshCw className="w-10 h-10 animate-spin text-primary" />
      <h3 className="text-base font-bold">Configuring OAuth Profile...</h3>
      <p className="text-xs text-slate-400">Please wait while we authorize your workspace dashboard.</p>
    </div>
  );
};

export default LoginSuccess;
