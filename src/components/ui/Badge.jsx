import React from 'react';

const Badge = ({
  children,
  variant = 'neutral', // 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
  pulse = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide';
  
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    success: 'bg-success/15 text-success border border-success/20',
    warning: 'bg-warning/15 text-warning border border-warning/20',
    danger: 'bg-danger/15 text-danger border border-danger/20',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
  };

  const pulses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-slate-400'
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulses[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulses[variant]}`}></span>
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
