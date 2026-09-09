import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import { PageHeader, StatCard, StatusBadge, Button } from "../../components/common";
import {
  Users,
  BookOpen,
  IndianRupee,
  GraduationCap,
  ArrowRight,
  ClipboardList,
  BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/admin/stats`)
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      headerActions={
        <Link to="/admin/analytics">
          <Button variant="primary" size="sm" icon={BarChart3}>
            View Full Analytics
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Admin Control Center"
          subtitle="System overview, performance metrics, and course management analytics"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 h-24 rounded-xl border border-slate-200 shadow-xs animate-pulse"
              />
            ))
          ) : (
            <>
              <StatCard
                label="Total Learners"
                value={stats?.total_users ?? 0}
                sub="Registered accounts"
                icon={Users}
                to="/admin/users"
              />
              <StatCard
                label="Total Courses"
                value={stats?.total_courses ?? 0}
                sub={`${stats?.published_courses ?? 0} published`}
                icon={BookOpen}
                to="/admin/courses"
              />
              <StatCard
                label="Total Enrollments"
                value={stats?.total_enrollments ?? 0}
                sub="Active course subscriptions"
                icon={GraduationCap}
                to="/admin/analytics"
              />
              <StatCard
                label="Total Revenue"
                value={`₹${(stats?.total_revenue ?? 0).toLocaleString("en-IN")}`}
                sub="Completed course sales"
                icon={IndianRupee}
                to="/admin/payments"
                valueColor="text-emerald-700"
              />
            </>
          )}
        </div>

        {/* Quick Management Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/analytics"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#1f3b45] hover:shadow-sm transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition">
              <BarChart3 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Platform Analytics
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Financials, trends & funnels
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#1f3b45] group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/admin/courses"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#1f3b45] hover:shadow-sm transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-[#1f3b45] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Manage Courses
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Curriculum, assessments, pricing
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#1f3b45] group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/admin/users"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#1f3b45] hover:shadow-sm transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-[#1f3b45] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <Users size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Users & Instructors
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review applications & bulk CSV
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#1f3b45] group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/admin/submissions"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#1f3b45] hover:shadow-sm transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-[#1f3b45] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <ClipboardList size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Submissions & Grading
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review student assignments
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#1f3b45] group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>

        {/* Recent Activity Sections */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Courses */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent Courses
                </h3>
                <Link
                  to="/admin/courses"
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-2 flex-1">
                {stats.recent_courses?.length > 0 ? (
                  stats.recent_courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {course.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
                          <span className="text-slate-400">By</span>
                          <span className="text-slate-700 font-semibold truncate">
                            {course.instructor_name || "SVARP GLOBAL ACADEMY"}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {course.enrolled_count ?? 0} learners enrolled
                        </p>
                      </div>
                      <StatusBadge status={course.status || "draft"} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No recent courses created.
                  </p>
                )}
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent Enrollments
                </h3>
                <Link
                  to="/admin/users"
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  View users
                </Link>
              </div>

              <div className="space-y-2 flex-1">
                {stats.recent_enrollments?.length > 0 ? (
                  stats.recent_enrollments.map((enr, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {enr.user_name || "Student"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {enr.course_title || "Enrolled Course"}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {enr.created_at ? new Date(enr.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No recent course enrollments.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
