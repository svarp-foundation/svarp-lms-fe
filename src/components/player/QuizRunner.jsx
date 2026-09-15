import React, { useState, useEffect } from "react";
import { Button } from "../common";
import { CheckCircle2, XCircle, RotateCcw, Award, ArrowRight } from "lucide-react";

const getStorageKey = (courseId, lessonId) => {
  if (!courseId || !lessonId) return null;
  return `lms_quiz_${courseId}_${lessonId}`;
};

export const QuizRunner = ({
  courseId,
  lessonId,
  questions = [],
  passingScore = 70,
  isCompleted = false,
  onCompleteQuiz,
  onNextLesson,
}) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Restore saved quiz state on mount or when switching lessons
  useEffect(() => {
    const storageKey = getStorageKey(courseId, lessonId);
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.score === "number" && parsed.userAnswers) {
            setUserAnswers(parsed.userAnswers);
            setScore(parsed.score);
            setSubmitted(true);
            return;
          }
        }
      } catch (e) {
        console.error("Error reading saved quiz state:", e);
      }
    }
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  }, [courseId, lessonId, questions]);

  const handleSelectOption = (qIndex, optIndex) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    const passed = calculatedScore >= passingScore;

    setScore(calculatedScore);
    setSubmitted(true);

    const storageKey = getStorageKey(courseId, lessonId);
    if (storageKey) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            userAnswers,
            score: calculatedScore,
            submitted: true,
            passed,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.error("Failed to save quiz state:", err);
      }
    }

    if (onCompleteQuiz) {
      onCompleteQuiz({
        score: calculatedScore,
        passed,
      });
    }
  };

  const handleRetake = () => {
    const storageKey = getStorageKey(courseId, lessonId);
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.error("Failed to clear quiz state:", err);
      }
    }
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

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;
  const allAnswered = answeredCount === totalQuestions;
  const passed = score >= passingScore;

  let correctCount = 0;
  if (submitted) {
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        correctCount += 1;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Result Card if submitted */}
      {submitted && (
        <div
          className={`p-5 sm:p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
            passed
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs"
              : "bg-rose-50/90 border-rose-200 text-rose-950 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                passed ? "bg-emerald-600 text-white shadow-xs" : "bg-rose-600 text-white shadow-xs"
              }`}
            >
              {passed ? <Award size={24} /> : <XCircle size={24} />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  {passed ? "Assessment Passed!" : "Assessment Needs Revision"}
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    passed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}
                >
                  {score}% Score
                </span>
              </div>
              <p className="text-xs opacity-90">
                You answered <strong>{correctCount}</strong> of <strong>{totalQuestions}</strong> questions correctly (Passing benchmark: {passingScore}%).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetake}
              icon={RotateCcw}
              className="bg-white hover:bg-slate-50 text-slate-700"
            >
              Retake Assessment
            </Button>

            {passed && onNextLesson && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onNextLesson}
                icon={ArrowRight}
                className="bg-emerald-700 hover:bg-emerald-800 border-emerald-700 text-white"
              >
                Continue to Next Lesson
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Questions list */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, qIndex) => {
          const selected = userAnswers[qIndex];
          const isCorrectQuestion = submitted && selected === q.correct_answer;

          return (
            <div
              key={qIndex}
              className={`p-5 sm:p-6 bg-white rounded-xl border transition-all shadow-xs space-y-4 ${
                submitted
                  ? isCorrectQuestion
                    ? "border-emerald-200 ring-1 ring-emerald-100"
                    : "border-rose-200 ring-1 ring-rose-100"
                  : "border-slate-200"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#1f3b45] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                </div>

                {submitted && (
                  <div className="flex-shrink-0">
                    {isCorrectQuestion ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={13} />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle size={13} />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="pl-0 sm:pl-9 space-y-2">
                {q.options?.map((opt, optIndex) => {
                  const isSelected = selected === optIndex;
                  const isCorrectAnswer = q.correct_answer === optIndex;

                  let optClass = "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
                  let badge = null;

                  if (!submitted) {
                    if (isSelected) {
                      optClass = "bg-[#1f3b45] text-white border-[#1f3b45] shadow-xs";
                    }
                  } else {
                    // Submitted mode
                    if (isCorrectAnswer && isSelected) {
                      optClass = "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-xs";
                      badge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded">
                          <CheckCircle2 size={13} /> Your Answer (Correct)
                        </span>
                      );
                    } else if (isCorrectAnswer && !isSelected) {
                      optClass = "bg-emerald-50/60 border-emerald-300 text-emerald-900 font-medium";
                      badge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          <CheckCircle2 size={13} /> Correct Answer
                        </span>
                      );
                    } else if (isSelected && !isCorrectAnswer) {
                      optClass = "bg-rose-50 border-rose-300 text-rose-950 font-medium";
                      badge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded">
                          <XCircle size={13} /> Your Choice (Incorrect)
                        </span>
                      );
                    } else {
                      optClass = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-70";
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={`p-3 sm:p-3.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-3 select-none ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      } ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 border ${
                            !submitted && isSelected
                              ? "bg-white text-[#1f3b45] border-white"
                              : submitted && isCorrectAnswer
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : submitted && isSelected && !isCorrectAnswer
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-white text-slate-500 border-slate-300"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {badge}
                    </div>
                  );
                })}

                {/* Explanation if submitted */}
                {submitted && q.explanation && (
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 mt-2 space-y-1">
                    <p className="font-bold text-slate-900">Explanation</p>
                    <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Action Bar */}
        {!submitted && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">
              {answeredCount} of {totalQuestions} questions answered
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!allAnswered}
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
