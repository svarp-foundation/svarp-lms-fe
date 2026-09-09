import React from "react";
import { DataTable, StatusBadge, Button } from "../common";
import { Briefcase, Eye, ExternalLink, Check, X } from "lucide-react";

export const InstructorApplicationTable = ({
  applications = [],
  loading = false,
  onReview,
}) => {
  const columns = [
    {
      key: "applicant",
      label: "Applicant",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">
            {row.full_name || row.user?.full_name || "Applicant"}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {row.email || row.user?.email || "No email"}
          </p>
        </div>
      ),
    },
    {
      key: "domain_specialty",
      label: "Domain & Specialty",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {row.domain || row.specialty || "Specialist"}
          </p>
          {row.sub_specialty && (
            <p className="text-[11px] text-slate-500 truncate">
              {row.sub_specialty}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "submitted_at",
      label: "Applied Date",
      render: (row) => (
        <span className="text-slate-600 whitespace-nowrap">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status || "pending"} />
      ),
    },
    {
      key: "actions",
      label: "Review Application",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onReview(row)}
            icon={Eye}
          >
            Review Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      loading={loading}
      emptyTitle="No instructor applications"
      emptyDescription="There are no pending instructor applications to review."
    />
  );
};

export default InstructorApplicationTable;
