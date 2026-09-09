import React, { useState, useMemo } from "react";
import { DataTable, SearchBar, FilterTabs, StatusBadge, Button, EmptyState } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import { Download, BookOpen, IndianRupee, GraduationCap, Award } from "lucide-react";

export const CoursePerformanceTable = ({ courses = [], loading = false }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 200);

  const filterTabs = [
    { id: "all", label: "All Courses", count: courses.length },
    {
      id: "published",
      label: "Published",
      count: courses.filter((c) => c.status === "published").length,
    },
    {
      id: "draft",
      label: "Drafts",
      count: courses.filter((c) => c.status === "draft").length,
    },
    {
      id: "paid",
      label: "Paid",
      count: courses.filter((c) => c.is_paid).length,
    },
    {
      id: "free",
      label: "Free",
      count: courses.filter((c) => !c.is_paid).length,
    },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Filter status/price
      if (filter === "published" && c.status !== "published") return false;
      if (filter === "draft" && c.status !== "draft") return false;
      if (filter === "paid" && !c.is_paid) return false;
      if (filter === "free" && c.is_paid) return false;

      // Search match
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(query);
        const instMatch = c.instructor_name?.toLowerCase().includes(query);
        return titleMatch || instMatch;
      }
      return true;
    });
  }, [courses, filter, debouncedSearch]);

  const handleExportCSV = () => {
    if (!filteredCourses.length) return;
    const headers = [
      "Course ID",
      "Title",
      "Instructor",
      "Status",
      "Type",
      "Price (INR)",
      "Enrollments",
      "Revenue (INR)",
      "Certificates Issued",
      "Completion Rate (%)",
      "Submissions",
      "Average Grade",
    ];

    const rows = filteredCourses.map((c) => [
      c.id,
      `"${(c.title || "").replace(/"/g, '""')}"`,
      `"${(c.instructor_name || "").replace(/"/g, '""')}"`,
      c.status,
      c.is_paid ? "Paid" : "Free",
      c.price || 0,
      c.enrollments_count || 0,
      c.revenue || 0,
      c.certificates_count || 0,
      `${c.completion_rate_pct || 0}%`,
      c.submissions_count || 0,
      c.average_grade ? `${c.average_grade}%` : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `course_performance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "title",
      label: "Course Title",
      render: (c) => (
        <div className="min-w-0 py-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs truncate max-w-[220px] block">
              {c.title}
            </span>
            <StatusBadge status={c.status} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{c.is_paid ? `₹${(c.price || 0).toLocaleString("en-IN")}` : "Free Course"}</span>
            <span>•</span>
            <span>ID #{c.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "instructor_name",
      label: "Instructor",
      render: (c) => (
        <div>
          <span className="text-xs font-medium text-slate-900 block truncate max-w-[140px]">
            {c.instructor_name || "Platform Admin"}
          </span>
          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
            {c.instructor_email || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "enrollments_count",
      label: "Enrollments",
      render: (c) => (
        <div className="font-semibold text-slate-900 text-xs">
          {(c.enrollments_count || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (c) => (
        <div className="font-bold text-emerald-700 text-xs">
          ₹{(c.revenue || 0).toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      key: "completion_rate_pct",
      label: "Completion Rate",
      render: (c) => {
        const pct = c.completion_rate_pct || 0;
        return (
          <div className="w-28 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-900">{pct}%</span>
              <span className="text-slate-400 text-[10px]">
                {c.certificates_count || 0} certs
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  pct > 60
                    ? "bg-emerald-500"
                    : pct > 30
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "submissions_count",
      label: "Submissions & Avg Grade",
      render: (c) => (
        <div>
          <span className="text-xs font-medium text-slate-900 block">
            {c.submissions_count || 0} reviews
          </span>
          <span className="text-[10px] text-slate-500">
            {c.average_grade ? `Avg score: ${c.average_grade}%` : "No graded tests"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Course Performance & Financials
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Deep performance metrics per course including sales, student completion, and grading
          </p>
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

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <FilterTabs
          tabs={filterTabs}
          activeTab={filter}
          onChange={setFilter}
        />
        <div className="w-full md:w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by title or instructor..."
          />
        </div>
      </div>

      {/* Table Content */}
      <DataTable
        columns={columns}
        data={filteredCourses}
        loading={loading}
        emptyMessage="No courses matching your filter."
      />
    </div>
  );
};

export default CoursePerformanceTable;
