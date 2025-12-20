import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600'
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        map[color]
      )}
    >
      {children}
    </span>
  );
};

export default Badge;