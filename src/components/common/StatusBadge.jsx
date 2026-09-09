import React from "react";

export const StatusBadge = ({ status, customLabel, showDot = true, className = "" }) => {
  if (!status) return null;

  const normalized = status.toString().toLowerCase().trim();

  let colorClasses = "text-slate-600 bg-slate-100/80 border-slate-200";
  let dotColor = "bg-slate-400";
  let defaultLabel = status;

  switch (normalized) {
    case "active":
    case "approved":
    case "published":
    case "success":
    case "completed":
    case "passed":
      colorClasses = "text-emerald-700 bg-emerald-50/80 border-emerald-200/60";
      dotColor = "bg-emerald-500";
      defaultLabel = normalized === "published" ? "Published" : normalized === "approved" ? "Approved" : "Active";
      break;

    case "pending":
    case "draft":
    case "in_progress":
    case "processing":
    case "under_review":
    case "instructor_pending":
      colorClasses = "text-amber-700 bg-amber-50/80 border-amber-200/60";
      dotColor = "bg-amber-500";
      defaultLabel = normalized === "draft" ? "Draft" : normalized === "instructor_pending" ? "Pending Review" : "Pending";
      break;

    case "rejected":
    case "suspended":
    case "failed":
    case "inactive":
    case "cancelled":
      colorClasses = "text-rose-700 bg-rose-50/80 border-rose-200/60";
      dotColor = "bg-rose-500";
      defaultLabel = normalized === "rejected" ? "Rejected" : normalized === "suspended" ? "Suspended" : "Inactive";
      break;

    case "admin":
      colorClasses = "text-indigo-700 bg-indigo-50/80 border-indigo-200/60";
      dotColor = "bg-indigo-500";
      defaultLabel = "Admin";
      break;

    case "instructor":
      colorClasses = "text-cyan-800 bg-cyan-50/80 border-cyan-200/60";
      dotColor = "bg-cyan-600";
      defaultLabel = "Instructor";
      break;

    case "learner":
      colorClasses = "text-slate-700 bg-slate-100 border-slate-200";
      dotColor = "bg-slate-400";
      defaultLabel = "Learner";
      break;

    default:
      defaultLabel = status;
      break;
  }

  const label = customLabel || defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${colorClasses} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      )}
      {label}
    </span>
  );
};

export default StatusBadge;
