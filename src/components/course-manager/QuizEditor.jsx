import React from "react";
import { FormInput, FormTextarea, Button } from "../common";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

export const QuizEditor = ({ questions = [], onChange }) => {
  const handleAddQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: 0,
        explanation: "",
        points: 10,
      },
    ];
    onChange(newQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, idx) => idx !== index);
    onChange(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    onChange(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: newOptions,
    };
    onChange(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: [...newQuestions[qIndex].options, ""],
    };
    onChange(newQuestions);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length <= 2) return; // Keep at least 2 options
    const newOptions = newQuestions[qIndex].options.filter(
      (_, idx) => idx !== optIndex
    );
    let correct = newQuestions[qIndex].correct_answer;
    if (correct >= newOptions.length) {
      correct = newOptions.length - 1;
    }
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: newOptions,
      correct_answer: correct,
    };
    onChange(newQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quiz Questions ({questions.length})
          </h4>
          <p className="text-[11px] text-slate-500">
            Define multiple-choice questions with correct answers
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleAddQuestion}
          icon={Plus}
        >
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs text-slate-500">No questions added yet.</p>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAddQuestion}
            icon={Plus}
            className="mt-2"
          >
            Create First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="w-6 h-6 rounded-md bg-[#1f3b45] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {qIndex + 1}
                </span>

                <div className="flex-1 space-y-2">
                  <FormInput
                    placeholder="Enter question text..."
                    value={q.question || ""}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "question", e.target.value)
                    }
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                  title="Delete Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Options */}
              <div className="pl-9 space-y-2">
                <p className="text-[11px] font-semibold text-slate-600">
                  Options (select the radio button next to the correct answer):
                </p>

                {q.options?.map((opt, optIndex) => {
                  const isCorrect = q.correct_answer === optIndex;
                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${
                        isCorrect
                          ? "bg-emerald-50/70 border-emerald-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleQuestionChange(qIndex, "correct_answer", optIndex)
                        }
                        className={`p-1 transition-colors ${
                          isCorrect ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                        title="Mark as correct answer"
                      >
                        {isCorrect ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qIndex, optIndex, e.target.value)
                        }
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-800"
                        required
                      />

                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIndex, optIndex)}
                          className="text-slate-300 hover:text-red-500 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleAddOption(qIndex)}
                  icon={Plus}
                >
                  Add Option
                </Button>
              </div>

              {/* Additional question settings */}
              <div className="pl-9 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <FormInput
                  label="Explanation (Optional)"
                  placeholder="Why this answer is correct..."
                  value={q.explanation || ""}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "explanation", e.target.value)
                  }
                />

                <FormInput
                  label="Points"
                  type="number"
                  min="1"
                  value={q.points ?? 10}
                  onChange={(e) =>
                    handleQuestionChange(
                      qIndex,
                      "points",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizEditor;
