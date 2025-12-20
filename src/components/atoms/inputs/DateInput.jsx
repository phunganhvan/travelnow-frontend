import React from 'react';
import { Calendar } from 'lucide-react';

const DateInput = ({ label, error, min, ...rest }) => {
  const today = new Date().toISOString().split('T')[0];
  const minValue = min || today;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-800">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Calendar size={18} />
        </span>
        <input
          type="date"
          min={minValue}
          className="w-full cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500">
          {error.message || 'Trường này không hợp lệ'}
        </p>
      )}
    </div>
  );
};

export default DateInput;