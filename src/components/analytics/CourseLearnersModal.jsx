import React, { useState, useEffect, useMemo } from "react";
import api from "../../lib/api";
import { Modal, DataTable, SearchBar, FilterTabs, StatusBadge, Button, EmptyState } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  BookOpen,
  IndianRupee,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  CheckSquare,
  HelpCircle,
  Layers,
  Award
} from "lucide-react";
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
  const [expandedLearnerIds, setExpandedLearnerIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("detailed"); // "detailed" (per-assignment cards) or "compact"
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
      setExpandedLearnerIds(new Set());
      fetchCourseLearners();
    } else {
      setData(null);
    }
  }, [isOpen, courseId]);

  const course = data?.course;
  const summary = data?.summary || {};
  const learners = data?.learners || [];

  // Identify all distinct course assignments
  const courseAssignments = useMemo(() => {
    if (course?.assignments && course.assignments.length > 0) {
      return course.assignments;
    }
    // Fallback: extract distinct assignments from learners' tests_breakdown
    const asgnMap = new Map();
    learners.forEach((l) => {
      (l.tests_breakdown || []).forEach((t) => {
        if (!asgnMap.has(t.assignment_id)) {
          asgnMap.set(t.assignment_id, {
            id: t.assignment_id,
            title: t.title,
            total_questions: t.total_questions || 0,
          });
        }
      });
    });
    return Array.from(asgnMap.values());
  }, [course, learners]);

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

  const toggleExpandLearner = (userId) => {
    setExpandedLearnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandedLearnerIds.size === filteredLearners.length) {
      setExpandedLearnerIds(new Set());
    } else {
      setExpandedLearnerIds(new Set(filteredLearners.map((l) => l.user_id)));
    }
  };

  // CSV Export 1: Comprehensive Roster with Dynamic Columns for EVERY Assignment
  const handleExportCSV = () => {
    if (!filteredLearners.length) return;

    // Base headers
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
      "Total Course Tests",
      "Average Grade (%)",
      "Overall Total Qs",
      "Overall Attempted",
      "Overall Correct",
      "Overall Incorrect",
      "Overall Accuracy (%)",
      "Payment Status",
      "Amount Paid (INR)",
    ];

    // Append separate columns for each assignment in the course
    courseAssignments.forEach((asgn, idx) => {
      const cleanTitle = (asgn.title || `Test ${idx + 1}`).replace(/"/g, '""');
      headers.push(
        `"[${cleanTitle}] Score (%)"`,
        `"[${cleanTitle}] Questions Attempted"`,
        `"[${cleanTitle}] Total Questions"`,
        `"[${cleanTitle}] Correct"`,
        `"[${cleanTitle}] Incorrect"`,
        `"[${cleanTitle}] Status"`,
        `"[${cleanTitle}] Submitted Date"`
      );
    });

    const rows = filteredLearners.map((l) => {
      const baseRow = [
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
        l.total_assignments_count || courseAssignments.length,
        l.average_grade ? `${l.average_grade}%` : "N/A",
        l.total_questions || 0,
        l.questions_attempted || 0,
        l.total_correct || 0,
        l.total_incorrect || 0,
        l.accuracy_pct ? `${l.accuracy_pct}%` : "N/A",
        l.payment_status || "N/A",
        l.amount_paid || 0,
      ];

      // Build map of tests_breakdown by assignment_id
      const testsMap = new Map();
      (l.tests_breakdown || []).forEach((t) => {
        testsMap.set(t.assignment_id, t);
      });

      // Append specific metrics for each assignment
      courseAssignments.forEach((asgn) => {
        const t = testsMap.get(asgn.id);
        if (t) {
          baseRow.push(
            t.grade !== null && t.grade !== undefined ? `${t.grade}%` : "N/A",
            t.attempted || 0,
            t.total_questions || asgn.total_questions || 0,
            t.correct || 0,
            t.incorrect || 0,
            t.status || "completed",
            t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : "-"
          );
        } else {
          baseRow.push("Not Attempted", 0, asgn.total_questions || 0, 0, 0, "not_attempted", "-");
        }
      });

      return baseRow;
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `course_${courseId}_learners_assessment_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export 2: Detailed Line-Item Assessment Report (One Row per Learner per Assessment)
  const handleExportItemizedAssessmentsCSV = () => {
    if (!filteredLearners.length) return;

    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Course ID",
      "Course Title",
      "Assessment ID",
      "Assessment Title",
      "Score (%)",
      "Status",
      "Questions Attempted",
      "Total Questions",
      "Correct Answers",
      "Incorrect Answers",
      "Unattempted",
      "Accuracy (%)",
      "Submitted At",
    ];

    const rows = [];
    filteredLearners.forEach((l) => {
      const testsMap = new Map();
      (l.tests_breakdown || []).forEach((t) => {
        testsMap.set(t.assignment_id, t);
      });

      courseAssignments.forEach((asgn) => {
        const t = testsMap.get(asgn.id);
        const att = t?.attempted || 0;
        const tot = t?.total_questions || asgn.total_questions || 0;
        const corr = t?.correct || 0;
        const incorr = t?.incorrect || 0;
        const unatt = t?.unattempted ?? Math.max(0, tot - att);
        const grade = t?.grade !== null && t?.grade !== undefined ? `${t.grade}%` : "N/A";
        const acc = att > 0 ? `${Math.round((corr / att) * 100)}%` : "0%";
        const status = t?.status || "not_attempted";
        const subAt = t?.submitted_at ? new Date(t.submitted_at).toLocaleString() : "-";

        rows.push([
          l.user_id,
          `"${(l.full_name || "").replace(/"/g, '""')}"`,
          `"${(l.email || "").replace(/"/g, '""')}"`,
          courseId,
          `"${(course?.title || courseTitle || "").replace(/"/g, '""')}"`,
          asgn.id,
          `"${(asgn.title || `Assessment #${asgn.id}`).replace(/"/g, '""')}"`,
          grade,
          status,
          att,
          tot,
          corr,
          incorr,
          unatt,
          acc,
          `"${subAt}"`,
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `course_${courseId}_itemized_assessments_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "expand",
      label: "",
      width: "36px",
      render: (l, _idx, isExpanded) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpandLearner(l.user_id);
          }}
          className="p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title={isExpanded ? "Collapse assessment details" : "Expand full assessment matrix"}
        >
          {isExpanded ? (
            <ChevronDown size={15} className="text-teal-700" />
          ) : (
            <ChevronRight size={15} />
          )}
        </button>
      ),
    },
    {
      key: "learner",
      label: "Learner Account",
      render: (l) => (
        <div className="min-w-0 py-0.5">
          <button
            type="button"
            onClick={() => onSelectLearner && onSelectLearner(l.user_id)}
            className="text-left font-bold text-slate-900 hover:text-emerald-700 text-xs block truncate max-w-[190px] transition-colors"
            title="Inspect enrolled courses for this learner"
          >
            {l.full_name || "Learner"}
          </button>
          <span className="text-[11px] text-slate-400 block truncate max-w-[190px]">
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
          <div className="w-32 space-y-1">
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
      label: "Assessment-by-Assessment Report",
      render: (l) => {
        const submitted = l.submissions_count || 0;
        const total = l.total_assignments_count || courseAssignments.length || 0;
        const hasScore = l.average_grade !== null && l.average_grade !== undefined;
        const isPassedOrDone = (submitted > 0 && submitted >= total) || l.progress_status === "completed";
        const hasTests = submitted > 0 || (l.tests_breakdown && l.tests_breakdown.length > 0);

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

        const breakdownTests = l.tests_breakdown || [];

        return (
          <div className="space-y-2 py-1 min-w-[280px] max-w-[350px]">
            {/* Top Row: Overall Average Score Badge & Breakdown Trigger */}
            <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${scoreColor}`}
                  title={hasScore ? `Average Grade: ${l.average_grade}%` : "Overall assessment result"}
                >
                  {hasScore ? `${l.average_grade}% Avg` : isPassedOrDone ? "Passed" : "No grade"}
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
                      tests: breakdownTests,
                    })
                  }
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-0.5 hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                  title="Click to view detailed modal analysis of questions and scores"
                >
                  <span>Breakdown ({breakdownTests.length})</span>
                  <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Separate Assignment-by-Assignment Cards (Detailed View) */}
            {viewMode === "detailed" ? (
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
                      {/* Assignment Title & Score Badge */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex-shrink-0 w-4 h-4 rounded bg-teal-100 text-teal-800 font-bold text-[9px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span
                            className="font-bold text-slate-800 truncate text-[11px] hover:text-teal-900"
                            title={t.title || `Assessment #${idx + 1}`}
                          >
                            {t.title || `Assessment #${idx + 1}`}
                          </span>
                        </div>

                        <span
                          className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] border flex-shrink-0 ${cardScoreColor}`}
                        >
                          {isNotAttempted
                            ? "Not Attempted"
                            : tScore !== null
                            ? `${tScore}%`
                            : "Submitted"}
                        </span>
                      </div>

                      {/* Individual Assignment Question Metrics Capsule */}
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
            ) : (
              /* Compact Summary Capsule with quick toggle */
              <div className="space-y-1">
                <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-md text-[10px] divide-x divide-slate-200 overflow-hidden font-medium shadow-2xs whitespace-nowrap w-full">
                  <span
                    title="Overall Questions Attempted / Total"
                    className="px-2 py-0.5 text-slate-700 font-semibold bg-slate-100/80 flex-1 text-center"
                  >
                    {l.questions_attempted || 0}/{l.total_questions || 0} Qs
                  </span>
                  <span
                    title="Overall Correct Answers"
                    className="px-2 py-0.5 text-emerald-700 font-bold bg-emerald-50/40 flex-1 text-center flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={10} className="text-emerald-600 inline" />
                    {l.total_correct || 0} Correct
                  </span>
                  <span
                    title="Overall Incorrect Answers"
                    className="px-2 py-0.5 text-rose-700 font-bold bg-rose-50/40 flex-1 text-center flex items-center justify-center gap-1"
                  >
                    <XCircle size={10} className="text-rose-500 inline" />
                    {l.total_incorrect || 0} Incorrect
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("detailed")}
                  className="text-[10px] font-semibold text-teal-700 hover:underline block"
                >
                  Switch to per-assignment breakdown
                </button>
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

  // Full Inline Assessment Matrix Drawer for an Expanded Learner Row
  const renderExpandedRow = (learner) => {
    const tests = learner.tests_breakdown || [];
    return (
      <div className="bg-slate-50/90 border-y border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText size={14} className="text-teal-700" />
              <span>Full Assessment Performance Matrix — {learner.full_name}</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Detailed assessment-by-assessment question metrics, score accuracy, and submission timestamps
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
              Overall Accuracy:{" "}
              <strong className="text-emerald-700">{learner.accuracy_pct || 0}%</strong>
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
              Tests Attempted:{" "}
              <strong className="text-slate-900">
                {learner.submissions_count || 0} / {learner.total_assignments_count || tests.length}
              </strong>
            </span>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white p-4 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 text-center">
            No assessment records found for this learner in this course.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Assessment Title</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Attempted / Total</th>
                  <th className="py-2.5 px-3 text-emerald-700">Correct</th>
                  <th className="py-2.5 px-3 text-rose-700">Incorrect</th>
                  <th className="py-2.5 px-3 text-slate-500">Unattempted</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {tests.map((t, idx) => {
                  const tScore = t.grade !== null && t.grade !== undefined ? t.grade : null;
                  const isNotAttempted = t.status === "not_attempted" || (t.attempted === 0 && tScore === null);
                  const isPassed = tScore !== null ? tScore >= 70 : t.status === "approved";
                  const att = t.attempted || 0;
                  const tot = t.total_questions || 0;
                  const corr = t.correct || 0;
                  const incorr = t.incorrect || 0;
                  const unatt = t.unattempted ?? Math.max(0, tot - att);
                  const acc = att > 0 ? Math.round((corr / att) * 100) : 0;

                  return (
                    <tr key={t.assignment_id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {t.title || `Assessment #${idx + 1}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isNotAttempted
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : t.status === "approved" || isPassed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isNotAttempted ? "Not Attempted" : t.status || "Completed"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {tScore !== null ? (
                          <span
                            className={`font-extrabold px-2 py-0.5 rounded text-[10px] border ${
                              isPassed
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {tScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">N/A</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {att} / {tot} Qs
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        ✓ {corr}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-700">
                        ✕ {incorr}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {unatt}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {att > 0 ? `${acc}%` : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                        {t.submitted_at
                          ? new Date(t.submitted_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course?.title || courseTitle || "Course Enrolled Learners"}
      subtitle={`Detailed roster, progress status, test grades, and assignment-by-assignment assessment reports (ID #${courseId})`}
      size="7xl"
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

          <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
              Course Tests
            </span>
            <span className="text-lg font-bold text-teal-700 block mt-0.5">
              {courseAssignments.length} Assessments
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

        {/* Filter Tabs, View Mode, Search & CSV Export Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-b border-slate-100 pb-3">
          <FilterTabs
            tabs={filterTabs}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  viewMode === "detailed"
                    ? "bg-white text-teal-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Display separate question and score cards for every assignment"
              >
                Assignment Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  viewMode === "compact"
                    ? "bg-white text-teal-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Display compact totals summary"
              >
                Compact Totals
              </button>
            </div>

            {/* Expand / Collapse All Rows Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleExpandAll}
              title="Expand or collapse assessment matrix drawers for all learners"
            >
              {expandedLearnerIds.size === filteredLearners.length && filteredLearners.length > 0
                ? "Collapse All"
                : "Expand All Matrix"}
            </Button>

            <div className="w-full sm:w-56">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search learner..."
              />
            </div>

            {/* CSV Export Dropdown / Action Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
                disabled={!filteredLearners.length}
                title="Export learners roster with separate columns for each assignment"
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FileSpreadsheet}
                onClick={handleExportItemizedAssessmentsCSV}
                disabled={!filteredLearners.length}
                title="Export itemized assessment log (1 row per test per learner)"
              >
                Itemized CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Enrolled Learners Table with Row Expansion */}
        <DataTable
          columns={columns}
          data={filteredLearners}
          loading={loading}
          keyExtractor={(l) => l.user_id}
          isRowExpanded={(l) => expandedLearnerIds.has(l.user_id)}
          renderExpandedRow={renderExpandedRow}
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
