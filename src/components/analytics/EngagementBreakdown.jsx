import React from "react";
import {
  Video,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  Users,
} from "lucide-react";

export const EngagementBreakdown = ({
  summary = {},
  engagement = {},
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 h-64"
          />
        ))}
      </div>
    );
  }

  const {
    total_lessons = 0,
    lesson_types_distribution = { video: 0, text: 0, assignment: 0 },
    total_submissions = 0,
    submissions_by_status = {
      approved: 0,
      under_review: 0,
      submitted: 0,
      resubmission_required: 0,
      rejected: 0,
    },
    avg_mcq_score_pct = 0,
    avg_subjective_grade = 0,
  } = summary;

  const {
    top_enrolled_courses = [],
    top_revenue_courses = [],
    top_active_learners = [],
  } = engagement;

  const videoCnt = lesson_types_distribution.video || 0;
  const textCnt = lesson_types_distribution.text || 0;
  const assignCnt = lesson_types_distribution.assignment || 0;
  const totalLessonItems = videoCnt + textCnt + assignCnt || 1;

  const approvedSub = submissions_by_status.approved || 0;
  const underReviewSub = submissions_by_status.under_review || 0;
  const submittedSub = submissions_by_status.submitted || 0;
  const resubRequiredSub = submissions_by_status.resubmission_required || 0;
  const rejectedSub = submissions_by_status.rejected || 0;
  const totalSubItems = total_submissions || 1;

  return (
    <div className="space-y-5">
      {/* Upper Grid: Curriculum & Assessment Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lesson Type Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Curriculum Composition
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {total_lessons} Total Lessons
              </span>
            </div>

            {/* Segmented Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-4">
              <div
                className="bg-[#0284c7] h-full"
                style={{ width: `${(videoCnt / totalLessonItems) * 100}%` }}
                title={`Video: ${videoCnt}`}
              />
              <div
                className="bg-[#059669] h-full"
                style={{ width: `${(textCnt / totalLessonItems) * 100}%` }}
                title={`Text: ${textCnt}`}
              />
              <div
                className="bg-[#4f46e5] h-full"
                style={{ width: `${(assignCnt / totalLessonItems) * 100}%` }}
                title={`Assignments: ${assignCnt}`}
              />
            </div>

            {/* Legends & Counts */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-sky-600 mb-1">
                  <Video size={14} />
                  <span className="font-bold text-[11px]">Video Lessons</span>
                </div>
                <span className="text-sm font-bold text-slate-900 block">{videoCnt}</span>
                <span className="text-[10px] text-slate-400">
                  {Math.round((videoCnt / totalLessonItems) * 100)}% of total
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                  <FileText size={14} />
                  <span className="font-bold text-[11px]">Text Lessons</span>
                </div>
                <span className="text-sm font-bold text-slate-900 block">{textCnt}</span>
                <span className="text-[10px] text-slate-400">
                  {Math.round((textCnt / totalLessonItems) * 100)}% of total
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                  <ClipboardList size={14} />
                  <span className="font-bold text-[11px]">Assessments</span>
                </div>
                <span className="text-sm font-bold text-slate-900 block">{assignCnt}</span>
                <span className="text-[10px] text-slate-400">
                  {Math.round((assignCnt / totalLessonItems) * 100)}% of total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment & Grading Funnel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assessment & Grading Funnel
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {total_submissions} Total Submissions
              </span>
            </div>

            {/* Segmented Status Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-4">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(approvedSub / totalSubItems) * 100}%` }}
                title={`Approved: ${approvedSub}`}
              />
              <div
                className="bg-sky-500 h-full"
                style={{ width: `${(underReviewSub / totalSubItems) * 100}%` }}
                title={`Under Review: ${underReviewSub}`}
              />
              <div
                className="bg-slate-400 h-full"
                style={{ width: `${(submittedSub / totalSubItems) * 100}%` }}
                title={`Submitted: ${submittedSub}`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(resubRequiredSub / totalSubItems) * 100}%` }}
                title={`Resubmission: ${resubRequiredSub}`}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(rejectedSub / totalSubItems) * 100}%` }}
                title={`Rejected: ${rejectedSub}`}
              />
            </div>

            {/* Stats matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg border border-slate-100 bg-emerald-50/40">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Approved</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{approvedSub}</span>
                <span className="text-[10px] text-slate-400">
                  {Math.round((approvedSub / totalSubItems) * 100)}% pass rate
                </span>
              </div>
              <div className="p-2 rounded-lg border border-slate-100 bg-sky-50/40">
                <span className="text-[10px] font-bold text-sky-800 uppercase block">In Review</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{underReviewSub + submittedSub}</span>
                <span className="text-[10px] text-slate-400">Awaiting grade</span>
              </div>
              <div className="p-2 rounded-lg border border-slate-100 bg-amber-50/40">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Resubmit</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{resubRequiredSub}</span>
                <span className="text-[10px] text-slate-400">Needs revision</span>
              </div>
              <div className="p-2 rounded-lg border border-slate-100 bg-rose-50/40">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Rejected</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{rejectedSub}</span>
                <span className="text-[10px] text-slate-400">Failed threshold</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <div className="text-slate-600">
              Avg Quiz Accuracy: <span className="font-bold text-slate-900">{avg_mcq_score_pct}%</span>
            </div>
            <div className="text-slate-600">
              Avg Assignment Grade: <span className="font-bold text-slate-900">{avg_subjective_grade}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Grid: Top Performers & Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Top Enrolled Courses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-sky-600" />
              Top Enrolled Courses
            </h3>
          </div>

          <div className="space-y-2.5 flex-1">
            {top_enrolled_courses.length > 0 ? (
              top_enrolled_courses.map((c, i) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {c.instructor_name ? `By ${c.instructor_name}` : "By SVARP GLOBAL ACADEMY"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">
                      {(c.enrollments_count || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      learners
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No course enrollment data.
              </p>
            )}
          </div>
        </div>

        {/* Top Revenue Courses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-600" />
              Top Revenue Courses
            </h3>
          </div>

          <div className="space-y-2.5 flex-1">
            {top_revenue_courses.length > 0 ? (
              top_revenue_courses.map((c, i) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {c.is_paid ? `₹${c.price}` : "Free"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">
                      ₹{(c.revenue || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.enrollments_count || 0} sales
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No course revenue recorded.
              </p>
            )}
          </div>
        </div>

        {/* Top Active Learners */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-indigo-600" />
              Most Active Learners
            </h3>
          </div>

          <div className="space-y-2.5 flex-1">
            {top_active_learners.length > 0 ? (
              top_active_learners.map((learner, i) => (
                <div
                  key={learner.user_id}
                  className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {learner.full_name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {learner.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-700 block">
                      {learner.completed_lessons_count || 0} lessons
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {learner.certificates_count || 0} certs
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No active student records.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementBreakdown;
