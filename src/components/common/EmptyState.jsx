import React from "react";
import Button from "./Button";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon: CustomIcon,
  title = "No items found",
  description = "There are no records matching your criteria.",
  actionLabel,
  onAction,
  actionIcon,
  className = "",
}) => {
  const IconComponent = CustomIcon || Inbox;
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mb-3.5">
        <IconComponent size={24} />
      </div>

      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            icon={actionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
