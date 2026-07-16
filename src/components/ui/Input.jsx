import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const inputId = id || `input-${Date.now()}`;
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={`w-full py-2 px-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-danger/80 focus:border-danger focus:ring-danger/20'
              : 'border-slate-200 dark:border-slate-800 focus:border-primary'
            }
            text-slate-900 dark:text-white`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
