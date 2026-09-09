import React, { useState } from "react";
import { Button } from "../common";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award } from "lucide-react";

export const QuizRunner = ({
  questions = [],
  passingScore = 70,
  onCompleteQuiz,
}) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (qIndex, optIndex) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    if (onCompleteQuiz) {
      onCompleteQuiz({
        score: calculatedScore,
        passed: calculatedScore >= passingScore,
      });
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
        No assessment questions configured for this quiz.
      </div>
    );
  }

  const passed = score >= passingScore;

  return (
    <div className="space-y-6">
      {/* Result Card if submitted */}
      {submitted && (
        <div
          className={`p-5 sm:p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            passed
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
              : "bg-rose-50/80 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {passed ? <Award size={24} /> : <XCircle size={24} />}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {passed ? "Assessment Passed!" : "Assessment Needs Revision"}
              </h3>
              <p className="text-xs mt-0.5 opacity-90">
                You scored <strong>{score}%</strong> (Passing benchmark: {passingScore}%)
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetake}
            icon={RotateCcw}
            className="bg-white"
          >
            Retake Assessment
          </Button>
        </div>
      )}

      {/* Questions list */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, qIndex) => {
          const selected = userAnswers[qIndex];

          return (
            <div
              key={qIndex}
              className="p-5 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#1f3b45] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="pl-9 space-y-2">
                {q.options?.map((opt, optIndex) => {
                  const isSelected = selected === optIndex;
                  const isTargetCorrect = q.correct_answer === optIndex;

                  let optStyles = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                  if (isSelected && !submitted) {
                    optStyles = "bg-slate-900 text-white border-slate-900";
                  } else if (submitted) {
                    if (isTargetCorrect) {
                      optStyles = "bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold";
                    } else if (isSelected && !isTargetCorrect) {
                      optStyles = "bg-rose-100/80 border-rose-300 text-rose-950 font-bold line-through";
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 select-none ${optStyles}`}
                    >
                      <span>{opt}</span>
                      {submitted && isTargetCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}

                {/* Explanation if submitted */}
                {submitted && q.explanation && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mt-2">
                    <span className="font-bold text-slate-800">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!submitted && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={Object.keys(userAnswers).length < questions.length}
            >
              Submit Assessment
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuizRunner;
