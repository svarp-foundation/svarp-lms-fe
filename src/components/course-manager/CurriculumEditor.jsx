import React, { useState } from "react";
import { Button, EmptyState } from "../common";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Layers,
  Sparkles,
} from "lucide-react";

const getLessonIcon = (type) => {
  switch (type) {
    case "video":
      return <Video size={14} className="text-blue-600" />;
    case "quiz":
      return <HelpCircle size={14} className="text-purple-600" />;
    case "assignment":
      return <ClipboardList size={14} className="text-amber-600" />;
    case "text":
    default:
      return <FileText size={14} className="text-emerald-600" />;
  }
};

const getLessonTypeLabel = (type) => {
  switch (type) {
    case "video":
      return "Video";
    case "quiz":
      return "Quiz";
    case "assignment":
      return "Assignment";
    case "text":
    default:
      return "Reading";
  }
};

export const CurriculumEditor = ({
  modules = [],
  onAddModule,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onOpenImporter,
}) => {
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: prev[modId] !== undefined ? !prev[modId] : false, // Default is open
    }));
  };

  const isModuleOpen = (modId) => {
    return expandedModules[modId] !== false; // Default true
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Course Curriculum</h3>
          <p className="text-xs text-slate-500">
            Structure modules, add video lessons, quizzes, and practical assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImporter && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onOpenImporter}
              icon={Sparkles}
            >
              Text Importer
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="xs"
            onClick={onAddModule}
            icon={Plus}
          >
            Add Module
          </Button>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Curriculum is empty"
          description="Start building this course by adding your first module or importing structured text."
          actionLabel="Add First Module"
          onAction={onAddModule}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-3">
          {modules.map((module, mIdx) => {
            const isOpen = isModuleOpen(module.id);
            const lessons = module.lessons || [];

            return (
              <div
                key={module.id || mIdx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Module Header Bar */}
                <div className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                    onClick={() => toggleModule(module.id)}
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#1f3b45] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {mIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {module.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 rounded bg-slate-200/70">
                          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onAddLesson(module.id)}
                      icon={Plus}
                      className="hidden sm:inline-flex"
                    >
                      Lesson
                    </Button>
                    <button
                      type="button"
                      onClick={() => onEditModule(module)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
                      title="Edit Module"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteModule(module.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
                    >
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Lessons Content Accordion */}
                {isOpen && (
                  <div className="p-3 sm:p-4 space-y-2 bg-white">
                    {lessons.length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                        <p className="text-[11px] text-slate-500">
                          No lessons inside this module yet.
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => onAddLesson(module.id)}
                          icon={Plus}
                          className="mt-1"
                        >
                          Add First Lesson
                        </Button>
                      </div>
                    ) : (
                      lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id || lIdx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {getLessonIcon(lesson.lesson_type)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {lesson.title}
                              </p>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {getLessonTypeLabel(lesson.lesson_type)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEditLesson(module.id, lesson)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Edit Lesson"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteLesson(module.id, lesson.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete Lesson"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="pt-2 sm:hidden">
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => onAddLesson(module.id)}
                        icon={Plus}
                        className="w-full"
                      >
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurriculumEditor;
