import React, { useState, useEffect, useMemo } from "react";
import api from "../../lib/api";
import { Modal, DataTable, SearchBar, FilterTabs, StatusBadge, Button, EmptyState } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import { Download, Users, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight, BookOpen, IndianRupee, RefreshCw, FileText } from "lucide-react";
import { TestBreakdownModal } from "./TestBreakdownModal";

export const CourseLearnersModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle = "",
  onSelectLearner,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTestBreakdown, setSelectedTestBreakdown] = useState(null);
  const debouncedSearch = useDebounce(search, 200);

  const fetchCourseLearners = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics/courses/${courseId}/learners`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load course learners:", err);
      // Fallback: try instructor endpoint if admin fails
      try {
        const res = await api.get(`/instructor/courses/${courseId}/learners`);
        setData(res.data);
      } catch (e) {
        console.error("Instructor endpoint also failed:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && courseId) {
      setSearch("");
      setStatusFilter("all");
      fetchCourseLearners();
    } else {
      setData(null);
    }
  }, [isOpen, courseId]);

  const course = data?.course;
  const summary = data?.summary || {};
  const learners = data?.learners || [];

  const filterTabs = [
    { id: "all", label: "All Learners", count: learners.length },
    {
      id: "completed",
      label: "Completed",
      count: summary.completed_count || learners.filter((l) => l.progress_status === "completed").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: summary.in_progress_count || learners.filter((l) => l.progress_status === "in_progress").length,
    },
    {
      id: "not_started",
      label: "Not Started",
      count: summary.not_started_count || learners.filter((l) => l.progress_status === "not_started").length,
    },
  ];

  const filteredLearners = useMemo(() => {
    return learners.filter((l) => {
      if (statusFilter !== "all" && l.progress_status !== statusFilter) {
        return false;
      }
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const nameMatch = (l.full_name || "").toLowerCase().includes(q);
        const emailMatch = (l.email || "").toLowerCase().includes(q);
        const idMatch = (l.user_id || "").toString().toLowerCase().includes(q);
        return nameMatch || emailMatch || idMatch;
      }
      return true;
    });
  }, [learners, statusFilter, debouncedSearch]);

  const handleExportCSV = () => {
    if (!filteredLearners.length) return;
    const headers = [
      "User ID",
      "Full Name",
      "Email",
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
      "Payment Status",
      "Amount Paid (INR)",
    ];

    const rows = filteredLearners.map((l) => [
      l.user_id,
      `"${(l.full_name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      l.enrolled_at ? new Date(l.enrolled_at).toLocaleDateString() : "-",
      l.completed_lessons_count || 0,
      l.total_lessons_count || 0,
      `${l.progress_pct || 0}%`,
      l.progress_status,
      l.certificate?.code || "-",
      l.certificate?.issued_at ? new Date(l.certificate.issued_at).toLocaleDateString() : "-",
      l.submissions_count || 0,
      l.total_assignments_count || 0,
      l.average_grade ? `${l.average_grade}%` : "N/A",
      l.total_questions || 0,
      l.questions_attempted || 0,
      l.total_correct || 0,
      l.total_incorrect || 0,
      l.total_unattempted || 0,
      l.accuracy_pct ? `${l.accuracy_pct}%` : "N/A",
      l.payment_status || "N/A",
      l.amount_paid || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `course_${courseId}_learners_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "learner",
      label: "Learner",
      render: (l) => (
        <div className="min-w-0 py-0.5">
          <button
            type="button"
            onClick={() => onSelectLearner && onSelectLearner(l.user_id)}
            className="text-left font-bold text-slate-900 hover:text-emerald-700 text-xs block truncate max-w-[200px] transition-colors"
            title="Inspect enrolled courses for this learner"
          >
            {l.full_name || "Learner"}
          </button>
          <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
            {l.email}
          </span>
        </div>
      ),
    },
    {
      key: "enrolled_at",
      label: "Enrolled Date",
      render: (l) => (
        <span className="text-xs text-slate-600 font-medium">
          {l.enrolled_at
            ? new Date(l.enrolled_at).toLocaleDateString("en-IN", {
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
      render: (l) => (
        <span className="text-xs font-semibold text-slate-700">
          {l.completed_lessons_count || 0} / {l.total_lessons_count || 0}
        </span>
      ),
    },
    {
      key: "progress",
      label: "Progress & Status",
      render: (l) => {
        const pct = l.progress_pct || 0;
        return (
          <div className="w-36 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{pct}%</span>
              <StatusBadge status={l.progress_status} showDot={false} />
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
      render: (l) => {
        const submitted = l.submissions_count || 0;
        const total = l.total_assignments_count || 0;
        const hasScore = l.average_grade !== null && l.average_grade !== undefined;
        const isPassedOrDone = (submitted > 0 && submitted >= total) || l.progress_status === "completed";
        const hasTests = submitted > 0 || (l.tests_breakdown && l.tests_breakdown.length > 0);
        const hasQuestions = (l.total_questions || 0) > 0 || (l.questions_attempted || 0) > 0;

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
          ? l.average_grade >= 70
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : l.average_grade >= 40
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-rose-50 text-rose-700 border-rose-200"
          : isPassedOrDone
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-600 border-slate-200";

        return (
          <div className="space-y-1.5 py-0.5 min-w-[215px] max-w-[260px]">
            {/* Top Row: Score Badge, Tests Count & Breakdown Trigger */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${scoreColor}`}>
                  {hasScore ? `${l.average_grade}% Avg` : isPassedOrDone ? "Passed" : "No grade"}
                </span>
                <span className="text-[11px] font-semibold text-slate-700">
                  {submitted} / {total} tests
                </span>
              </div>

              {l.tests_breakdown && l.tests_breakdown.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTestBreakdown({
                      title: `${l.full_name || "Learner"} — Assessment Breakdown`,
                      subtitle: `${l.email || ""} • Course ID #${courseId}`,
                      summary: {
                        total_questions: l.total_questions || 0,
                        questions_attempted: l.questions_attempted || 0,
                        total_correct: l.total_correct || 0,
                        total_incorrect: l.total_incorrect || 0,
                        total_unattempted: l.total_unattempted || 0,
                        accuracy_pct: l.accuracy_pct || 0,
                        average_grade: l.average_grade,
                      },
                      tests: l.tests_breakdown,
                    })
                  }
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-0.5 hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                  title="Click to view question attempts and scores for each assessment"
                >
                  <span>Breakdown ({l.tests_breakdown.length})</span>
                  <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Bottom Row: Unified Segmented Question Metrics Capsule */}
            {hasQuestions && (
              <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-md text-[10px] divide-x divide-slate-200 overflow-hidden font-medium shadow-2xs whitespace-nowrap">
                <span
                  title="Questions Attempted / Total"
                  className="px-2 py-0.5 text-slate-700 font-semibold bg-slate-100/80"
                >
                  {l.questions_attempted || 0}/{l.total_questions || 0} Qs
                </span>
                <span
                  title="Correct Answers"
                  className="px-2 py-0.5 text-emerald-700 font-bold bg-emerald-50/40 flex items-center gap-1"
                >
                  <CheckCircle2 size={10} className="text-emerald-600 inline" />
                  {l.total_correct || 0} Correct
                </span>
                <span
                  title="Incorrect Answers"
                  className="px-2 py-0.5 text-rose-700 font-bold bg-rose-50/40 flex items-center gap-1"
                >
                  <XCircle size={10} className="text-rose-500 inline" />
                  {l.total_incorrect || 0} Incorrect
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "certificate",
      label: "Certificate",
      render: (l) => {
        if (l.certificate?.code) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {l.certificate.code}
              </span>
              {l.certificate.issued_at && (
                <span className="text-[10px] text-slate-400 block">
                  {new Date(l.certificate.issued_at).toLocaleDateString()}
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
      render: (l) => (
        <Button
          variant="outline"
          size="xs"
          icon={ArrowRight}
          onClick={() => onSelectLearner && onSelectLearner(l.user_id)}
          title="View all enrolled courses for this learner"
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course?.title || courseTitle || "Course Enrolled Learners"}
      subtitle={`Detailed roster, progress status, test grades, and completion metrics (ID #${courseId})`}
      size="5xl"
    >
      <div className="space-y-5">
        {/* Course Info & Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Enrolled
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {(summary.total_enrolled || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">
              {(summary.completed_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-lg font-bold text-amber-700 block mt-0.5">
              {(summary.in_progress_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Not Started
            </span>
            <span className="text-lg font-bold text-slate-700 block mt-0.5">
              {(summary.not_started_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Avg Progress
            </span>
            <span className="text-lg font-bold text-indigo-700 block mt-0.5">
              {summary.avg_progress_pct || 0}%
            </span>
          </div>

          <div className="bg-cyan-50/60 p-3 rounded-xl border border-cyan-100">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
              Certificates
            </span>
            <span className="text-lg font-bold text-cyan-700 block mt-0.5">
              {(summary.certificates_issued || 0).toLocaleString()}
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
                placeholder="Search learner..."
              />
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
        </div>

        {/* Enrolled Learners Table */}
        <DataTable
          columns={columns}
          data={filteredLearners}
          loading={loading}
          emptyTitle="No learners found"
          emptyDescription="There are no enrolled learners matching your current filter."
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

export default CourseLearnersModal;
