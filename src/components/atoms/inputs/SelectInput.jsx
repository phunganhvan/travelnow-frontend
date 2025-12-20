import React from 'react';
import { ChevronDown } from 'lucide-react';

const SelectInput = ({ label, children, error, ...rest }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-800">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className="w-full appearance-none rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown size={18} />
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500">
          {error.message || 'Trường này không hợp lệ'}
        </p>
      )}
    </div>
  );
};

export default SelectInput;