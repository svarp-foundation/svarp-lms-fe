import React, { useState } from "react";
import {
  CheckCircle,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const getLessonIcon = (type) => {
  switch (type) {
    case "video":
      return <PlayCircle size={15} className="flex-shrink-0" />;
    case "quiz":
      return <HelpCircle size={15} className="flex-shrink-0 text-purple-600" />;
    case "assignment":
      return <ClipboardList size={15} className="flex-shrink-0 text-amber-600" />;
    case "text":
    default:
      return <FileText size={15} className="flex-shrink-0 text-emerald-600" />;
  }
};

export const PlayerSidebar = ({
  modules = [],
  activeLessonId,
  completedLessonIds = [],
  onSelectLesson,
  open = false,
  setOpen,
  className = "",
}) => {
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: prev[modId] !== undefined ? !prev[modId] : false,
    }));
  };

  const isModuleExpanded = (modId) => {
    return expandedModules[modId] !== false;
  };

  const content = (
    <aside
      className={`bg-white border-l border-slate-200 w-80 h-full flex flex-col flex-shrink-0 overflow-hidden ${className}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Course Content
        </h3>
        {setOpen && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Module / Lesson Scrollable Tree */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {modules.map((module, mIdx) => {
          const isExpanded = isModuleExpanded(module.id);
          const lessons = module.lessons || [];

          return (
            <div key={module.id || mIdx} className="bg-white">
              {/* Module Accordion Header */}
              <div
                onClick={() => toggleModule(module.id)}
                className="p-3.5 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between gap-2 transition-colors select-none"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Module {mIdx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    {module.title}
                  </h4>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>

              {/* Lessons List */}
              {isExpanded && (
                <div className="py-1">
                  {lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    const isCompleted = completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          onSelectLesson(lesson);
                          if (setOpen && window.innerWidth < 768) {
                            setOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-900 font-bold border-l-3 border-emerald-600"
                            : "text-slate-700 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getLessonIcon(lesson.lesson_type)}
                          <span className="text-xs truncate">{lesson.title}</span>
                        </div>

                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle size={15} className="text-emerald-600" />
                          ) : (
                            <Circle size={14} className="text-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Inline Sidebar */}
      <div className="hidden md:block h-[calc(100vh-3.5rem)] sticky top-14">
        {content}
      </div>

      {/* Mobile Backdrop Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-80 h-full">{content}</div>
        </div>
      )}
    </>
  );
};

export default PlayerSidebar;
