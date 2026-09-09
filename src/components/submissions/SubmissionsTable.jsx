import React from "react";
import { DataTable, StatusBadge, SearchBar, FilterTabs, FormSelect, Button } from "../common";
import { Eye } from "lucide-react";

export const SubmissionsTable = ({
  submissions = [],
  courses = [],
  loading = false,
  searchTerm = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  courseFilter = "",
  onCourseFilterChange,
  onReviewSubmission,
}) => {
  const filtered = submissions.filter((sub) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (sub.user_name || sub.user?.full_name || "")?.toLowerCase().includes(s) ||
      (sub.user_email || sub.user?.email || "")?.toLowerCase().includes(s) ||
      (sub.course_title || sub.course?.title || "")?.toLowerCase().includes(s) ||
      (sub.module_title || sub.module?.title || "")?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (sub.status === "pending" || sub.status === "under_review" || !sub.status)) ||
      (statusFilter === "approved" && sub.status === "approved") ||
      (statusFilter === "rejected" && sub.status === "rejected");

    const matchesCourse =
      !courseFilter ||
      sub.course_id?.toString() === courseFilter ||
      sub.course?.id?.toString() === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const filterTabsList = [
    { id: "all", label: "All Submissions", count: submissions.length },
    {
      id: "pending",
      label: "Pending Review",
      count: submissions.filter(
        (s) => s.status === "pending" || s.status === "under_review" || !s.status
      ).length,
    },
    {
      id: "approved",
      label: "Approved",
      count: submissions.filter((s) => s.status === "approved").length,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: submissions.filter((s) => s.status === "rejected").length,
    },
  ];

  const columns = [
    {
      key: "student",
      label: "Learner",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">
            {row.user_name || row.user?.full_name || "Student"}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {row.user_email || row.user?.email || "No email"}
          </p>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course & Module",
      render: (row) => (
        <div className="min-w-0 max-w-xs">
          <p className="font-semibold text-slate-800 truncate">
            {row.course_title || row.course?.title || "Course"}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {row.module_title || row.module?.title || "Module Assignment"}
          </p>
        </div>
      ),
    },
    {
      key: "submitted_at",
      label: "Submitted On",
      render: (row) => (
        <span className="text-slate-600 whitespace-nowrap">
          {row.created_at || row.submitted_at
            ? new Date(row.created_at || row.submitted_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent"}
        </span>
      ),
    },
    {
      key: "grade",
      label: "Score",
      render: (row) => (
        <span className="font-bold text-slate-800">
          {row.grade !== null && typeof row.grade !== "undefined"
            ? `${row.grade}%`
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status || "pending"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant={row.status === "approved" ? "outline" : "primary"}
            size="xs"
            onClick={() => onReviewSubmission(row)}
            icon={Eye}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
          <SearchBar
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student, email, or course..."
            className="flex-1"
          />

          {courses.length > 0 && (
            <div className="w-full sm:w-48">
              <FormSelect
                value={courseFilter}
                onChange={(e) => onCourseFilterChange(e.target.value)}
                options={[
                  { value: "", label: "All Courses" },
                  ...courses.map((c) => ({ value: c.id.toString(), label: c.title })),
                ]}
              />
            </div>
          )}
        </div>

        <FilterTabs
          tabs={filterTabsList}
          activeTab={statusFilter}
          onChange={onStatusFilterChange}
        />
      </div>

      {/* Submissions Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No submissions found"
        emptyDescription={
          searchTerm || statusFilter !== "all" || courseFilter
            ? "No student submissions match your filter criteria."
            : "No assignment submissions received yet."
        }
      />
    </div>
  );
};

export default SubmissionsTable;
