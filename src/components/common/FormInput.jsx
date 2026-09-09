import React from "react";

export const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  inputClassName = "",
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
        {Icon && iconPosition === "left" && (
          <Icon
            size={16}
            className="absolute left-3 text-slate-400 pointer-events-none"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full bg-white border text-xs text-slate-900 rounded-lg py-2 px-3 placeholder-slate-400 transition-all focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon && iconPosition === "left" ? "pl-9" : ""
          } ${Icon && iconPosition === "right" ? "pr-9" : ""} ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-slate-200 focus:border-[#1f3b45] focus:ring-[#1f3b45]"
          } ${inputClassName}`}
          {...props}
        />

        {Icon && iconPosition === "right" && (
          <Icon
            size={16}
            className="absolute right-3 text-slate-400 pointer-events-none"
          />
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormInput;
