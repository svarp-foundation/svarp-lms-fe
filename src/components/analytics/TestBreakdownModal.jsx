import React from "react";
import { Modal, Button, StatusBadge } from "../common";
import { CheckCircle2, XCircle, HelpCircle, Award, Calendar, FileText, ArrowRight } from "lucide-react";

export const TestBreakdownModal = ({
  isOpen,
  onClose,
  title = "Assessment Results Breakdown",
  subtitle = "Detailed analysis of questions attempted, correct answers, incorrect answers, and scores",
  summary = {},
  tests = [],
}) => {
  if (!isOpen) return null;

  const totalQuestions = summary.total_questions || tests.reduce((acc, t) => acc + (t.total_questions || 0), 0);
  const questionsAttempted = summary.questions_attempted || tests.reduce((acc, t) => acc + (t.attempted || 0), 0);
  const totalCorrect = summary.total_correct || tests.reduce((acc, t) => acc + (t.correct || 0), 0);
  const totalIncorrect = summary.total_incorrect || tests.reduce((acc, t) => acc + (t.incorrect || 0), 0);
  const totalUnattempted = summary.total_unattempted || Math.max(0, totalQuestions - questionsAttempted);
  const accuracyPct = summary.accuracy_pct ?? (
    questionsAttempted > 0 ? Math.round((totalCorrect / questionsAttempted) * 100) : 0
  );
  const avgGrade = summary.average_grade ?? null;

  const correctPct = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const incorrectPct = totalQuestions > 0 ? (totalIncorrect / totalQuestions) * 100 : 0;
  const unattemptedPct = totalQuestions > 0 ? (totalUnattempted / totalQuestions) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="3xl"
    >
      <div className="space-y-6 py-1">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Correct Answers
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-emerald-700">
                {totalCorrect.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                ({accuracyPct}% accuracy)
              </span>
            </div>
            <span className="text-[10px] text-emerald-600/80 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Verified correct
            </span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-100 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
              Incorrect Answers
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-rose-700">
                {totalIncorrect.toLocaleString()}
              </span>
              <span className="text-xs text-rose-600 font-semibold">
                wrong
              </span>
            </div>
            <span className="text-[10px] text-rose-600/80 mt-1 flex items-center gap-1 font-medium">
              <XCircle size={12} className="text-rose-500" />
              Errors & misses
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Attempted / Total
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {questionsAttempted}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {totalQuestions} Qs
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-medium">
              {totalUnattempted > 0 ? `${totalUnattempted} unattempted` : "All questions attempted"}
            </span>
          </div>

          <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Average Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-indigo-700">
                {avgGrade !== null ? `${avgGrade}%` : `${accuracyPct}%`}
              </span>
            </div>
            <span className="text-[10px] text-indigo-600/80 mt-1 block font-medium">
              {tests.length} test{tests.length === 1 ? "" : "s"} evaluated
            </span>
          </div>
        </div>

        {/* Visual Stacked Distribution Bar */}
        {totalQuestions > 0 && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Questions Answer Distribution</span>
              <span className="text-slate-400 text-[11px] font-medium">{totalQuestions} Total Questions</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${correctPct}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Correct: ${totalCorrect} (${Math.round(correctPct)}%)`}
              />
              <div
                style={{ width: `${incorrectPct}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Incorrect: ${totalIncorrect} (${Math.round(incorrectPct)}%)`}
              />
              <div
                style={{ width: `${unattemptedPct}%` }}
                className="bg-amber-300 h-full transition-all"
                title={`Unattempted: ${totalUnattempted} (${Math.round(unattemptedPct)}%)`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] pt-0.5 text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Correct: <strong className="text-emerald-700">{totalCorrect}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Incorrect: <strong className="text-rose-700">{totalIncorrect}</strong>
              </span>
              {totalUnattempted > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
                  Unattempted: <strong className="text-amber-700">{totalUnattempted}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* List of Individual Tests */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-teal-600" />
              Individual Tests & Assessments ({tests.length})
            </h4>
          </div>

          {tests.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
              No detailed test submissions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test, idx) => {
                const tScore = test.grade !== null && test.grade !== undefined ? test.grade : null;
                const isPassed = tScore !== null ? tScore >= 70 : test.status === "approved";
                const tAtt = test.attempted || 0;
                const tTot = test.total_questions || 0;
                const tCorr = test.correct || 0;
                const tIncorr = test.incorrect || 0;
                const tUnatt = test.unattempted || Math.max(0, tTot - tAtt);

                return (
                  <div
                    key={test.assignment_id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {test.title}
                          {test.status && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              test.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {test.status}
                            </span>
                          )}
                        </h5>
                        {test.submitted_at && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} />
                            Submitted: {new Date(test.submitted_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {tScore !== null ? (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            isPassed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            Score: {tScore}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                            Evaluated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Test Question Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                      <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                          Total Questions
                        </span>
                        <span className="text-sm font-bold text-slate-900 block mt-0.5">
                          {tTot} Questions
                        </span>
                      </div>

                      <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                          Attempted
                        </span>
                        <span className="text-sm font-bold text-slate-900 block mt-0.5">
                          {tAtt} / {tTot}
                        </span>
                      </div>

                      <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600" /> Correct
                        </span>
                        <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                          {tCorr} Correct
                        </span>
                      </div>

                      <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                        <span className="text-[10px] text-rose-700 font-semibold uppercase flex items-center gap-1">
                          <XCircle size={11} className="text-rose-500" /> Incorrect
                        </span>
                        <span className="text-sm font-bold text-rose-700 block mt-0.5">
                          {tIncorr} Incorrect
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TestBreakdownModal;
