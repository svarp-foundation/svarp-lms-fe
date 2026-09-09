import React from "react";

export const ToggleSwitch = ({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      htmlFor={id || name}
      className={`flex items-start gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="relative inline-flex items-center mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          id={id || name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1f3b45]" />
      </div>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="text-xs font-semibold text-slate-800 block">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default ToggleSwitch;
