import React from "react";
import { ChevronDown } from "lucide-react";

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [], // [{ value, label, disabled? }] or plain strings
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  children,
  className = "",
  selectClassName = "",
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

      <div className="relative flex items-center">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full bg-white border text-xs text-slate-900 rounded-lg py-2 pl-3 pr-8 appearance-none transition-all focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-slate-200 focus:border-[#1f3b45] focus:ring-[#1f3b45]"
          } ${selectClassName}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {children
            ? children
            : options.map((opt) => {
                const val = typeof opt === "object" ? opt.value : opt;
                const lab = typeof opt === "object" ? opt.label : opt;
                const dis = typeof opt === "object" ? opt.disabled : false;
                return (
                  <option key={val} value={val} disabled={dis}>
                    {lab}
                  </option>
                );
              })}
        </select>

        <ChevronDown
          size={14}
          className="absolute right-3 text-slate-400 pointer-events-none"
        />
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormSelect;
