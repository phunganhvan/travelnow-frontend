import React from 'react';

/**
 * Input text có label + error, dùng với react-hook-form.
 */
const TextInput = ({ label, error, icon: Icon, ...rest }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-800">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </span>
        )}
        <input
          className={`w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            Icon ? 'pl-10' : ''
          }`}
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

export default TextInput;