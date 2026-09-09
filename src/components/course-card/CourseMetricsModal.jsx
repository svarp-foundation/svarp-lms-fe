import React from "react";
import { Modal } from "../common";
import { Layers, BookOpen, Clock, Users, Award } from "lucide-react";

export const CourseMetricsModal = ({ isOpen, onClose, course, metricsData, loading }) => {
  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course.title}
      subtitle="Course Syllabus & Learning Structure"
      size="lg"
    >
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Loading course syllabus metrics...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Modules
              </span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {metricsData?.modules_count ?? course.modules_count ?? 0}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lessons
              </span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {metricsData?.lessons_count ?? course.lessons_count ?? 0}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Passing Score
              </span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {course.passing_score ?? 70}%
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Certificate
              </span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">Included</p>
            </div>
          </div>

          {course.description && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-1">Course Summary:</h4>
              <p>{course.description}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CourseMetricsModal;
