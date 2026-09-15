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
  Layers,
} from "lucide-react";

const getLessonIcon = (type) => {
  switch (type) {
    case "video":
      return <PlayCircle size={15} className="flex-shrink-0 text-sky-600" />;
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
  isOpen = true,
  onClose,
  className = "",
}) => {
  const [expandedModules, setExpandedModules] = useState({});

  // Auto-expand the module containing the active lesson
  React.useEffect(() => {
    if (activeLessonId && modules.length > 0) {
      modules.forEach((mod) => {
        const hasActive = (mod.lessons || []).some((l) => l.id === activeLessonId);
        if (hasActive) {
          setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
        }
      });
    }
  }, [activeLessonId, modules]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: prev[modId] !== undefined ? !prev[modId] : false,
    }));
  };

  const isModuleExpanded = (modId) => {
    return expandedModules[modId] !== false;
  };

  const handleLessonClick = (lesson) => {
    onSelectLesson(lesson);
    // On mobile, close drawer after selection
    if (typeof window !== "undefined" && window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  // Calculate total and completed count
  let totalLessons = 0;
  let completedCount = 0;
  modules.forEach((m) => {
    (m.lessons || []).forEach((l) => {
      totalLessons += 1;
      if (completedLessonIds.includes(l.id) || l.completed) {
        completedCount += 1;
      }
    });
  });

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#1f3b45]" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Course Roadmap
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
              {completedCount} of {totalLessons} lessons completed
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close Roadmap"
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
          const modCompletedCount = lessons.filter(
            (l) => completedLessonIds.includes(l.id) || l.completed
          ).length;

          return (
            <div key={module.id || mIdx} className="bg-white">
              {/* Module Accordion Header */}
              <div
                onClick={() => toggleModule(module.id)}
                className="p-3.5 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between gap-2 transition-colors select-none"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Module {mIdx + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                      {modCompletedCount}/{lessons.length}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    {module.title}
                  </h4>
                </div>
                <div className="text-slate-400 flex-shrink-0">
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>

              {/* Lessons List */}
              {isExpanded && (
                <div className="py-1">
                  {lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    const isCompleted = completedLessonIds.includes(lesson.id) || !!lesson.completed;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleLessonClick(lesson)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-xs"
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
                          ) : lesson.locked ? (
                            <Lock size={14} className="text-slate-300" />
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
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Sidebar (visible on screens >= md when open) */}
      <aside
        className={`hidden md:flex w-80 h-full flex-col flex-shrink-0 bg-white border-l border-slate-200 overflow-hidden z-20 ${className}`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer (visible on screens < md when open) */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity"
        />

        {/* Slide-over Drawer */}
        <aside className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
          {renderSidebarContent()}
        </aside>
      </div>
    </>
  );
};

export default PlayerSidebar;

