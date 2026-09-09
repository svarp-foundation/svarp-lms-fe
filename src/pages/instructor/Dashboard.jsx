import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import InstructorLayout from "../../components/InstructorLayout";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, StatCard, StatusBadge, Button } from "../../components/common";
import {
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes, subRes] = await Promise.all([
        api.get("/instructor/stats"),
        api.get("/instructor/courses"),
        api.get("/instructor/submissions?limit=6"),
      ]);
      setStats(statsRes.data);
      setCourses(coursesRes.data || []);
      setSubmissions(subRes.data || []);
    } catch (error) {
      console.error("Error fetching instructor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Instructor Studio Dashboard"
          subtitle={`Welcome back, ${user?.full_name || "Instructor"}. Manage courses and evaluate student progress.`}
          actions={
            <Link to="/instructor/courses">
              <Button variant="primary" size="sm" icon={Plus}>
                New Course
              </Button>
            </Link>
          }
        />

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 h-24 rounded-xl border border-slate-200 shadow-xs animate-pulse"
              />
            ))
          ) : (
            <>
              <StatCard
                label="My Courses"
                value={stats?.total_courses ?? 0}
                sub={`${stats?.published_courses ?? 0} published`}
                icon={BookOpen}
                to="/instructor/courses"
              />
              <StatCard
                label="Learners"
                value={stats?.total_students ?? 0}
                sub="Enrolled students"
                icon={Users}
              />
              <StatCard
                label="Pending Reviews"
                value={stats?.pending_reviews ?? 0}
                sub="Awaiting evaluation"
                icon={ClipboardList}
                to="/instructor/submissions"
                valueColor={stats?.pending_reviews > 0 ? "text-amber-600" : "text-slate-900"}
              />
              <StatCard
                label="Certificates"
                value={stats?.certificates_issued ?? 0}
                sub="Awarded to learners"
                icon={GraduationCap}
              />
              <StatCard
                label="Revenue"
                value={`₹${(stats?.total_revenue ?? 0).toLocaleString("en-IN")}`}
                sub="Course earnings"
                icon={IndianRupee}
                valueColor="text-emerald-700"
              />
              <StatCard
                label="Completion"
                value={`${stats?.completion_rate ?? 0}%`}
                sub="Avg course completion"
                icon={TrendingUp}
              />
            </>
          )}
        </div>

        {/* Quick Studio Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/instructor/courses"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#1f3b45] hover:shadow-sm transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-[#1f3b45] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Course Studio
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Design modules, author video lessons, and quizzes
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#1f3b45] group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/instructor/submissions"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#1f3b45] hover:shadow-sm transition-all flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-[#1f3b45] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <ClipboardList size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Grade Submissions
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review student assignments and award passing scores
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#1f3b45] group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>

        {/* Recent Content Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Authored Courses */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                My Authored Courses
              </h3>
              <Link
                to="/instructor/courses"
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2 flex-1">
              {courses.length > 0 ? (
                courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {course.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {course.enrolled_count ?? 0} students enrolled
                      </p>
                    </div>
                    <StatusBadge status={course.status || "draft"} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No courses authored yet.
                </p>
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Submissions
              </h3>
              <Link
                to="/instructor/submissions"
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2 flex-1">
              {submissions.length > 0 ? (
                submissions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {sub.user_name || sub.user?.full_name || "Student"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {sub.course_title} · {sub.module_title}
                      </p>
                    </div>
                    <StatusBadge status={sub.status || "pending"} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No assignment submissions received yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;
