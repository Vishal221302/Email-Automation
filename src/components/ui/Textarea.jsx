import React from 'react';

const Textarea = React.forwardRef(({
  label,
  error,
  rows = 4,
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Date.now()}`;
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={`w-full py-2.5 px-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50
          ${error
            ? 'border-danger/80 focus:border-danger focus:ring-danger/20'
            : 'border-slate-200 dark:border-slate-800 focus:border-primary'
          }
          text-slate-900 dark:text-white`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
