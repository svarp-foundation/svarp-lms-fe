import React, { useState, useEffect, useMemo } from "react";
import api from "../../lib/api";
import { Modal, DataTable, SearchBar, FilterTabs, StatusBadge, Button, EmptyState } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import { Download, BookOpen, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight, Award, User, RefreshCw, FileText } from "lucide-react";
import { TestBreakdownModal } from "./TestBreakdownModal";

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
  const [selectedTestBreakdown, setSelectedTestBreakdown] = useState(null);
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
      "Total Tests",
      "Average Grade",
      "Total Questions",
      "Questions Attempted",
      "Total Correct",
      "Total Incorrect",
      "Total Unattempted",
      "Accuracy (%)",
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
      c.total_assignments_count || 0,
      c.average_grade ? `${c.average_grade}%` : "N/A",
      c.total_questions || 0,
      c.questions_attempted || 0,
      c.total_correct || 0,
      c.total_incorrect || 0,
      c.total_unattempted || 0,
      c.accuracy_pct ? `${c.accuracy_pct}%` : "N/A",
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
      render: (c) => {
        const submitted = c.submissions_count || 0;
        const total = c.total_assignments_count || 0;
        const hasScore = c.average_grade !== null && c.average_grade !== undefined;
        const isPassedOrDone = (submitted > 0 && submitted >= total) || c.progress_status === "completed";
        const hasTests = submitted > 0 || (c.tests_breakdown && c.tests_breakdown.length > 0);
        const hasQuestions = (c.total_questions || 0) > 0 || (c.questions_attempted || 0) > 0;

        if (!hasTests && total === 0) {
          return <span className="text-[11px] text-slate-400 italic">No tests</span>;
        }

        if (!hasTests && total > 0) {
          return (
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-700 block">
                0 / {total} submitted
              </span>
              <span className="text-[10px] text-slate-400">Not attempted</span>
            </div>
          );
        }

        const scoreColor = hasScore
          ? c.average_grade >= 70
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : c.average_grade >= 40
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-rose-50 text-rose-700 border-rose-200"
          : isPassedOrDone
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-600 border-slate-200";

        const breakdownTests = c.tests_breakdown || [];

        return (
          <div className="space-y-2 py-1 min-w-[280px] max-w-[350px]">
            {/* Top Row: Score Badge, Tests Count & Breakdown Trigger */}
            <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${scoreColor}`}>
                  {hasScore ? `${c.average_grade}% Avg` : isPassedOrDone ? "Passed" : "No grade"}
                </span>
                <span className="text-[11px] font-semibold text-slate-700">
                  {submitted} / {total} tests
                </span>
              </div>

              {breakdownTests.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTestBreakdown({
                      title: `${c.title || "Course"} — Assessment Breakdown`,
                      subtitle: `Learner: ${user?.full_name || userName || "Learner"} (${user?.email || ""}) • Course ID #${c.course_id}`,
                      summary: {
                        total_questions: c.total_questions || 0,
                        questions_attempted: c.questions_attempted || 0,
                        total_correct: c.total_correct || 0,
                        total_incorrect: c.total_incorrect || 0,
                        total_unattempted: c.total_unattempted || 0,
                        accuracy_pct: c.accuracy_pct || 0,
                        average_grade: c.average_grade,
                      },
                      tests: breakdownTests,
                    })
                  }
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-0.5 hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                  title="Click to view question attempts and scores for each assessment"
                >
                  <span>Breakdown ({breakdownTests.length})</span>
                  <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Separate Assignment-by-Assignment Cards */}
            {breakdownTests.length > 0 ? (
              <div className="space-y-1.5">
                {breakdownTests.map((t, idx) => {
                  const tScore = t.grade !== null && t.grade !== undefined ? t.grade : null;
                  const isNotAttempted = t.status === "not_attempted" || (t.attempted === 0 && tScore === null);
                  const isPassed = tScore !== null ? tScore >= 70 : t.status === "approved";

                  const cardScoreColor = isNotAttempted
                    ? "bg-slate-100 text-slate-500 border-slate-200"
                    : tScore !== null
                    ? isPassed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <div
                      key={t.assignment_id || idx}
                      className="bg-slate-50/90 hover:bg-slate-100/90 rounded-lg p-2 border border-slate-200 transition-all text-[11px] shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex-shrink-0 w-4 h-4 rounded bg-teal-100 text-teal-800 font-bold text-[9px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span
                            className="font-bold text-slate-800 truncate text-[11px]"
                            title={t.title || `Assessment #${idx + 1}`}
                          >
                            {t.title || `Assessment #${idx + 1}`}
                          </span>
                        </div>

                        <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] border flex-shrink-0 ${cardScoreColor}`}>
                          {isNotAttempted
                            ? "Not Attempted"
                            : tScore !== null
                            ? `${tScore}%`
                            : "Submitted"}
                        </span>
                      </div>

                      <div className="inline-flex items-center bg-white border border-slate-200 rounded text-[9.5px] divide-x divide-slate-200 overflow-hidden font-medium shadow-2xs w-full">
                        <span
                          className="px-1.5 py-0.5 text-slate-700 font-semibold bg-slate-50 flex-1 text-center truncate"
                          title="Questions Attempted / Total"
                        >
                          {t.attempted || 0}/{t.total_questions || 0} Qs
                        </span>
                        <span
                          className="px-1.5 py-0.5 text-emerald-700 font-bold bg-emerald-50/40 flex-1 text-center truncate flex items-center justify-center gap-0.5"
                          title="Correct Answers"
                        >
                          <CheckCircle2 size={9} className="text-emerald-600 inline flex-shrink-0" />
                          <span>{t.correct || 0} Correct</span>
                        </span>
                        <span
                          className="px-1.5 py-0.5 text-rose-700 font-bold bg-rose-50/40 flex-1 text-center truncate flex items-center justify-center gap-0.5"
                          title="Incorrect Answers"
                        >
                          <XCircle size={9} className="text-rose-500 inline flex-shrink-0" />
                          <span>{t.incorrect || 0} Incorrect</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : hasQuestions ? (
              <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-md text-[10px] divide-x divide-slate-200 overflow-hidden font-medium shadow-2xs whitespace-nowrap w-full">
                <span
                  title="Questions Attempted / Total"
                  className="px-2 py-0.5 text-slate-700 font-semibold bg-slate-100/80 flex-1 text-center"
                >
                  {c.questions_attempted || 0}/{c.total_questions || 0} Qs
                </span>
                <span
                  title="Correct Answers"
                  className="px-2 py-0.5 text-emerald-700 font-bold bg-emerald-50/40 flex-1 text-center flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={10} className="text-emerald-600 inline" />
                  {c.total_correct || 0} Correct
                </span>
                <span
                  title="Incorrect Answers"
                  className="px-2 py-0.5 text-rose-700 font-bold bg-rose-50/40 flex-1 text-center flex items-center justify-center gap-1"
                >
                  <XCircle size={10} className="text-rose-500 inline" />
                  {c.total_incorrect || 0} Incorrect
                </span>
              </div>
            ) : null}
          </div>
        );
      },
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

      {/* Interactive Assessment Breakdown Modal */}
      {selectedTestBreakdown && (
        <TestBreakdownModal
          isOpen={Boolean(selectedTestBreakdown)}
          onClose={() => setSelectedTestBreakdown(null)}
          title={selectedTestBreakdown.title}
          subtitle={selectedTestBreakdown.subtitle}
          summary={selectedTestBreakdown.summary}
          tests={selectedTestBreakdown.tests}
        />
      )}
    </Modal>
  );
};

export default LearnerCoursesModal;
