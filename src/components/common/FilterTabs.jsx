import React from "react";

export const FilterTabs = ({
  tabs = [], // [{ id: 'all', label: 'All', count?: 5 }]
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 overflow-x-auto max-w-full ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              isActive
                ? "bg-white text-[#1f3b45] shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {tab.icon && <tab.icon size={13} className="flex-shrink-0" />}
            <span>{tab.label}</span>
            {typeof tab.count !== "undefined" && tab.count !== null && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isActive
                    ? "bg-slate-100 text-[#1f3b45]"
                    : "bg-slate-200/80 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
