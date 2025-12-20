import React from 'react';
import clsx from 'clsx';

const IconButton = ({ children, className, ...props }) => {
  return (
    <button
      className={clsx(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;