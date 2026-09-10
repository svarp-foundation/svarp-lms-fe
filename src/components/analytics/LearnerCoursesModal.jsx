import React, { useState, useEffect, useMemo } from "react";
import api from "../../lib/api";
import { Modal, DataTable, SearchBar, FilterTabs, StatusBadge, Button, EmptyState } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import { Download, BookOpen, CheckCircle2, Clock, AlertCircle, ArrowRight, Award, User, RefreshCw } from "lucide-react";

export const LearnerCoursesModal = ({
  isOpen,
  onClose,
  userId,
  userName = "",
  onSelectCourse,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 200);

  const fetchLearnerCourses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics/learners/${userId}/courses`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load learner courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      setSearch("");
      setStatusFilter("all");
      fetchLearnerCourses();
    } else {
      setData(null);
    }
  }, [isOpen, userId]);

  const user = data?.user;
  const summary = data?.summary || {};
  const courses = data?.courses || [];

  const filterTabs = [
    { id: "all", label: "All Courses", count: courses.length },
    {
      id: "completed",
      label: "Completed",
      count: summary.completed_courses_count || courses.filter((c) => c.progress_status === "completed").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: summary.in_progress_courses_count || courses.filter((c) => c.progress_status === "in_progress").length,
    },
    {
      id: "not_started",
      label: "Not Started",
      count: summary.not_started_courses_count || courses.filter((c) => c.progress_status === "not_started").length,
    },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (statusFilter !== "all" && c.progress_status !== statusFilter) {
        return false;
      }
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const titleMatch = (c.title || "").toLowerCase().includes(q);
        const instMatch = (c.instructor_name || "").toLowerCase().includes(q);
        const idMatch = (c.course_id || "").toString().toLowerCase().includes(q);
        return titleMatch || instMatch || idMatch;
      }
      return true;
    });
  }, [courses, statusFilter, debouncedSearch]);

  const handleExportCSV = () => {
    if (!filteredCourses.length) return;
    const headers = [
      "Course ID",
      "Course Title",
      "Instructor",
      "Type",
      "Price (INR)",
      "Enrolled Date",
      "Lessons Done",
      "Total Lessons",
      "Progress (%)",
      "Status",
      "Certificate Code",
      "Certificate Issued Date",
      "Submissions Count",
      "Average Grade",
    ];

    const rows = filteredCourses.map((c) => [
      c.course_id,
      `"${(c.title || "").replace(/"/g, '""')}"`,
      `"${(c.instructor_name || "").replace(/"/g, '""')}"`,
      c.is_paid ? "Paid" : "Free",
      c.price || 0,
      c.enrolled_at ? new Date(c.enrolled_at).toLocaleDateString() : "-",
      c.completed_lessons_count || 0,
      c.total_lessons_count || 0,
      `${c.progress_pct || 0}%`,
      c.progress_status,
      c.certificate?.code || "-",
      c.certificate?.issued_at ? new Date(c.certificate.issued_at).toLocaleDateString() : "-",
      c.submissions_count || 0,
      c.average_grade ? `${c.average_grade}%` : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `learner_${userId}_transcript_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "title",
      label: "Course Details",
      render: (c) => (
        <div className="min-w-0 py-0.5">
          <button
            type="button"
            onClick={() => onSelectCourse && onSelectCourse(c.course_id)}
            className="text-left font-bold text-slate-900 hover:text-emerald-700 text-xs block truncate max-w-[220px] transition-colors"
            title="Inspect enrolled learners for this course"
          >
            {c.title}
          </button>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>By {c.instructor_name || "SVARP GLOBAL ACADEMY"}</span>
            <span>•</span>
            <span>ID #{c.course_id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "enrolled_at",
      label: "Enrolled Date",
      render: (c) => (
        <span className="text-xs text-slate-600 font-medium">
          {c.enrolled_at
            ? new Date(c.enrolled_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      key: "lessons",
      label: "Lessons Done",
      render: (c) => (
        <span className="text-xs font-semibold text-slate-700">
          {c.completed_lessons_count || 0} / {c.total_lessons_count || 0}
        </span>
      ),
    },
    {
      key: "progress",
      label: "Progress & Status",
      render: (c) => {
        const pct = c.progress_pct || 0;
        return (
          <div className="w-36 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{pct}%</span>
              <StatusBadge status={c.progress_status} showDot={false} />
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct === 100
                    ? "bg-emerald-500"
                    : pct > 40
                    ? "bg-teal-500"
                    : pct > 0
                    ? "bg-amber-500"
                    : "bg-slate-300"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "submissions",
      label: "Grading / Tests",
      render: (c) => (
        <div>
          <span className="text-xs font-semibold text-slate-900 block">
            {c.submissions_count || 0} submitted
          </span>
          <span className="text-[10px] text-slate-500">
            {c.average_grade ? `Avg score: ${c.average_grade}%` : "No grade"}
          </span>
        </div>
      ),
    },
    {
      key: "certificate",
      label: "Certificate",
      render: (c) => {
        if (c.certificate?.code) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {c.certificate.code}
              </span>
              {c.certificate.issued_at && (
                <span className="text-[10px] text-slate-400 block">
                  {new Date(c.certificate.issued_at).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="text-[11px] text-slate-400 italic">Not issued</span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (c) => (
        <Button
          variant="outline"
          size="xs"
          icon={ArrowRight}
          onClick={() => onSelectCourse && onSelectCourse(c.course_id)}
          title="View all learners in this course"
        >
          View Course
        </Button>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user?.full_name || userName || "Learner Course Enrollments"}
      subtitle={`${user?.email || ""} • Joined ${user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}`}
      size="5xl"
    >
      <div className="space-y-5">
        {/* Learner Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Enrolled Courses
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {(summary.total_enrolled_courses || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">
              {(summary.completed_courses_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-lg font-bold text-amber-700 block mt-0.5">
              {(summary.in_progress_courses_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Not Started
            </span>
            <span className="text-lg font-bold text-slate-700 block mt-0.5">
              {(summary.not_started_courses_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-cyan-50/60 p-3 rounded-xl border border-cyan-100">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
              Certificates
            </span>
            <span className="text-lg font-bold text-cyan-700 block mt-0.5">
              {(summary.total_certificates || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Avg Grade
            </span>
            <span className="text-lg font-bold text-indigo-700 block mt-0.5">
              {summary.average_grade ? `${summary.average_grade}%` : "N/A"}
            </span>
          </div>
        </div>

        {/* Filter Tabs, Search & CSV Export Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <FilterTabs
            tabs={filterTabs}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />

          <div className="flex items-center gap-2">
            <div className="w-full sm:w-60">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search course title..."
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              disabled={!filteredCourses.length}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Enrolled Courses Table */}
        <DataTable
          columns={columns}
          data={filteredCourses}
          loading={loading}
          emptyTitle="No courses found"
          emptyDescription="This learner has no enrolled courses matching your current filter."
        />
      </div>
    </Modal>
  );
};

export default LearnerCoursesModal;
