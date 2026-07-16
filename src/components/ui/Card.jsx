import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  glass = false,
  ...props
}) => {
  const baseStyle = "p-6 rounded-card border shadow-sm transition-all duration-300";
  const lightStyle = glass
    ? "glass-card-light text-slate-900 border-white/40"
    : "bg-white text-slate-900 border-slate-100 dark:border-slate-800";
  const darkStyle = glass
    ? "glass-card-dark dark:text-slate-100 border-slate-800/50"
    : "dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80";
  
  const combinedClasses = `${baseStyle} ${lightStyle} ${darkStyle} ${className}`;

  if (onClick || hoverEffect) {
    return (
      <motion.div
        whileHover={{
          y: hoverEffect ? -4 : 0,
          boxShadow: hoverEffect
            ? '0 12px 20px -8px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
            : '0 1px 3px 0 rgba(0,0,0,0.1)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onClick}
        className={`${combinedClasses} ${onClick ? 'cursor-pointer' : ''}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
