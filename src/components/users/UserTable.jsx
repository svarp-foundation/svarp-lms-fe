import React from "react";
import { DataTable, StatusBadge, FormSelect, Button } from "../common";
import { Shield, User, Briefcase, GraduationCap } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "learner", label: "Learner" },
  { value: "instructor_pending", label: "Instructor (Pending)" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Administrator" },
];

export const UserTable = ({
  users = [],
  loading = false,
  onRoleChange,
  updatingRoleId,
}) => {
  const columns = [
    {
      key: "user",
      label: "User Profile",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {row.full_name ? row.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">
              {row.full_name || "Anonymous User"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      label: "User ID",
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">#{row.id}</span>
      ),
    },
    {
      key: "role",
      label: "Assigned Role",
      render: (row) => {
        const effectiveRole =
          row.role ||
          (row.roles?.includes("admin")
            ? "admin"
            : row.roles?.includes("instructor")
            ? "instructor"
            : row.roles?.includes("instructor_pending")
            ? "instructor_pending"
            : "learner");

        return <StatusBadge status={effectiveRole} />;
      },
    },
    {
      key: "change_role",
      label: "Change Role",
      align: "right",
      render: (row) => {
        const effectiveRole =
          row.role ||
          (row.roles?.includes("admin")
            ? "admin"
            : row.roles?.includes("instructor")
            ? "instructor"
            : row.roles?.includes("instructor_pending")
            ? "instructor_pending"
            : "learner");

        return (
          <div className="w-44 ml-auto">
            <FormSelect
              value={effectiveRole}
              onChange={(e) => onRoleChange(row.id, e.target.value)}
              disabled={updatingRoleId === row.id}
              options={ROLE_OPTIONS}
              selectClassName="py-1 text-xs"
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      emptyTitle="No users found"
      emptyDescription="No registered user accounts match your search."
    />
  );
};

export default UserTable;
