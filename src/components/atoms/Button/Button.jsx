import React from 'react';
import clsx from 'clsx';

/**
 * Button nguyên tử, tái sử dụng cho toàn app.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primaryDark focus:ring-primary',
    success:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline:
      'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:ring-primary',
    ghost:
      'text-slate-700 hover:bg-slate-100 focus:ring-slate-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;