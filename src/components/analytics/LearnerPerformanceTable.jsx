import React, { useState, useMemo } from "react";
import { DataTable, SearchBar, FilterTabs, StatusBadge, Button, EmptyState } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import { Download, Users, GraduationCap, Award, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export const LearnerPerformanceTable = ({
  learners = [],
  loading = false,
  onSelectLearner,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 200);

  const filterTabs = [
    { id: "all", label: "All Learners", count: learners.length },
    {
      id: "enrolled",
      label: "Enrolled in Courses",
      count: learners.filter((l) => (l.enrolled_courses_count || 0) > 0).length,
    },
    {
      id: "certified",
      label: "Certified",
      count: learners.filter((l) => (l.certificates_count || 0) > 0).length,
    },
    {
      id: "active",
      label: "Active Learners",
      count: learners.filter((l) => !l.is_suspended).length,
    },
  ];

  const filteredLearners = useMemo(() => {
    return learners.filter((l) => {
      // Filter tab
      if (filter === "enrolled" && (l.enrolled_courses_count || 0) === 0) return false;
      if (filter === "certified" && (l.certificates_count || 0) === 0) return false;
      if (filter === "active" && l.is_suspended) return false;

      // Search match
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const nameMatch = (l.full_name || "").toLowerCase().includes(query);
        const emailMatch = (l.email || "").toLowerCase().includes(query);
        const idMatch = (l.user_id || "").toString().toLowerCase().includes(query);
        return nameMatch || emailMatch || idMatch;
      }
      return true;
    });
  }, [learners, filter, debouncedSearch]);

  const handleExportCSV = () => {
    if (!filteredLearners.length) return;
    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Account Status",
      "Joined Date",
      "Enrolled Courses",
      "Certificates Earned",
      "Completed Lessons",
      "Total Submissions",
      "Average Grade",
      "Total Questions",
      "Questions Attempted",
      "Total Correct",
      "Total Incorrect",
      "Accuracy (%)",
    ];

    const rows = filteredLearners.map((l) => [
      l.user_id,
      `"${(l.full_name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      l.is_suspended ? "Suspended" : "Active",
      l.created_at ? new Date(l.created_at).toLocaleDateString() : "-",
      l.enrolled_courses_count || 0,
      l.certificates_count || 0,
      l.completed_lessons_count || 0,
      l.submissions_count || 0,
      l.average_grade ? `${l.average_grade}%` : "N/A",
      l.total_questions || 0,
      l.questions_attempted || 0,
      l.total_correct || 0,
      l.total_incorrect || 0,
      l.accuracy_pct ? `${l.accuracy_pct}%` : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `learner_performance_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "full_name",
      label: "Learner Account",
      render: (l) => (
        <div className="min-w-0 py-1">
          <button
            type="button"
            onClick={() => onSelectLearner && onSelectLearner(l.user_id)}
            className="text-left font-bold text-slate-900 hover:text-emerald-700 text-xs block truncate max-w-[220px] transition-colors"
            title="Click to view enrolled courses"
          >
            {l.full_name || "Learner"}
          </button>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{l.email}</span>
            <span>•</span>
            <span className={l.is_suspended ? "text-rose-600 font-medium" : "text-emerald-600 font-medium"}>
              {l.is_suspended ? "Suspended" : "Active"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "enrolled_courses_count",
      label: "Enrolled Courses",
      render: (l) => (
        <div className="font-semibold text-slate-900 text-xs">
          {(l.enrolled_courses_count || 0).toLocaleString()} courses
        </div>
      ),
    },
    {
      key: "certificates_count",
      label: "Certificates",
      render: (l) => (
        <div>
          <span className="text-xs font-bold text-slate-900 block">
            {l.certificates_count || 0} earned
          </span>
          <span className="text-[10px] text-slate-400">
            {l.completed_lessons_count || 0} lessons done
          </span>
        </div>
      ),
    },
    {
      key: "submissions_count",
      label: "Submissions & Test Results",
      render: (l) => {
        const hasScore = l.average_grade !== null && l.average_grade !== undefined;
        const hasQuestions = (l.total_questions || 0) > 0 || (l.questions_attempted || 0) > 0;

        const scoreColor = hasScore
          ? l.average_grade >= 70
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : l.average_grade >= 40
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-slate-100 text-slate-600 border-slate-200";

        return (
          <div className="space-y-1 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800">
                {l.submissions_count || 0} tests
              </span>
              {hasScore && (
                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${scoreColor}`}>
                  {l.average_grade}% Avg
                </span>
              )}
            </div>

            {hasQuestions ? (
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-slate-500 font-medium">
                  {l.questions_attempted}/{l.total_questions} Qs:
                </span>
                <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-100">
                  <CheckCircle2 size={9} className="text-emerald-600 inline" />
                  {l.total_correct || 0}
                </span>
                <span className="inline-flex items-center gap-0.5 font-bold text-rose-700 bg-rose-50 px-1 rounded border border-rose-100">
                  <XCircle size={9} className="text-rose-500 inline" />
                  {l.total_incorrect || 0}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 block">
                {hasScore ? `Avg score: ${l.average_grade}%` : "No graded tests"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined Date",
      render: (l) => (
        <span className="text-xs text-slate-500">
          {l.created_at
            ? new Date(l.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (l) => (
        <Button
          variant="secondary"
          size="xs"
          icon={ArrowRight}
          onClick={() => onSelectLearner && onSelectLearner(l.user_id)}
          title="Inspect learner's enrolled courses and progress"
        >
          View Courses
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Learner Progress & Course Enrollments
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Overview of student accounts, active course enrollments, completion rates, and test grading
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
          disabled={!filteredLearners.length}
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
            placeholder="Search learner name, email, or ID..."
          />
        </div>
      </div>

      {/* Table Content */}
      <DataTable
        columns={columns}
        data={filteredLearners}
        loading={loading}
        emptyTitle="No learners found"
        emptyDescription="No learner accounts matched your current filter."
      />
    </div>
  );
};

export default LearnerPerformanceTable;
