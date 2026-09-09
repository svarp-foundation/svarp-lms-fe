import React from "react";

export const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  rows = 3,
  required = false,
  disabled = false,
  className = "",
  textareaClassName = "",
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full bg-white border text-xs text-slate-900 rounded-lg py-2 px-3 placeholder-slate-400 transition-all focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-200 focus:border-[#1f3b45] focus:ring-[#1f3b45]"
        } ${textareaClassName}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormTextarea;
