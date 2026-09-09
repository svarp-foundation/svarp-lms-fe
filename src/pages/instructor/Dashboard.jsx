import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import InstructorLayout from "../../components/InstructorLayout";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getMediaUrl } from "../../config";

const StatCard = ({ label, value, sub, color = "text-accent" }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    <h3 className={`text-xl font-extrabold ${color} mt-1`}>{value}</h3>
    <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
  </div>
);

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
      <div className="space-y-5 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">Instructor Dashboard</h1>
            <p className="text-xs text-slate-500">
              Welcome back, {user?.full_name || "Instructor"}. Manage courses and evaluate student progress.
            </p>
          </div>
          <Link
            to="/instructor/courses"
            className="bg-primary hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus size={14} /> New Course
          </Link>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 h-[84px] rounded-xl border border-slate-200 shadow-sm animate-pulse"
              />
            ))
          ) : (
            <>
              <StatCard
                label="My Courses"
                value={stats?.total_courses ?? 0}
                sub={`${stats?.published_courses ?? 0} published live`}
              />
              <StatCard
                label="Enrolled Students"
                value={stats?.total_students ?? 0}
                sub="Active learners"
              />
              <StatCard
                label="Pending Reviews"
                value={stats?.pending_reviews ?? 0}
                sub="Awaiting evaluation"
                color={stats?.pending_reviews > 0 ? "text-amber-600" : "text-accent"}
              />
              <StatCard
                label="Certificates"
                value={stats?.certificates_issued ?? 0}
                sub="Graduations awarded"
              />
              <StatCard
                label="Total Revenue"
                value={`₹${(stats?.total_revenue ?? 0).toLocaleString("en-IN")}`}
                sub="Course sales"
              />
              <StatCard
                label="Completion Rate"
                value={`${stats?.completion_rate ?? 0}%`}
                sub="Avg course completion"
              />
            </>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/instructor/courses"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <BookOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-accent group-hover:text-primary transition-colors">
                Course Studio
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Author modules, lessons & quizzes</p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/instructor/submissions"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <ClipboardList size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-accent group-hover:text-primary transition-colors">
                Grade Submissions
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {stats?.pending_reviews || 0} items pending review
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/courses-catalog"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <Eye size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-accent group-hover:text-primary transition-colors">
                Public Catalog View
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Preview courses as learners see them</p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>

        {/* ── Recent Submissions & Authored Courses ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
            <div className="bg-white p-4 h-64 rounded-xl border border-slate-200 shadow-sm" />
            <div className="bg-white p-4 h-64 rounded-xl border border-slate-200 shadow-sm" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Submissions */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-accent">Recent Student Submissions</h3>
                <Link
                  to="/instructor/submissions"
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="flex-1">
                {submissions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    No submissions received yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.slice(0, 5).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-accent truncate">
                            {sub.student_name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {sub.course_title} • <span className="text-slate-600 font-medium">{sub.assignment_title}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold border ${
                              sub.status === "approved"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : sub.status === "rejected"
                                ? "bg-red-50 text-red-600 border-red-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            {sub.status.replace("_", " ")}
                          </span>
                          <Link
                            to="/instructor/submissions"
                            className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-accent hover:border-slate-300 transition"
                            title="Review submission"
                          >
                            <Eye size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Authored Courses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-accent">My Authored Courses</h3>
                <Link
                  to="/instructor/courses"
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  Manage all
                </Link>
              </div>
              <div className="flex-1">
                {courses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    You haven't created any courses yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {courses.slice(0, 5).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
                          {course.thumbnail_url ? (
                            <img
                              src={getMediaUrl(course.thumbnail_url)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <GraduationCap size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 ml-3">
                          <p className="text-xs font-bold text-accent truncate">
                            {course.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {course.module_count || 0} modules • {course.student_count || 0} students • {course.is_paid ? `₹${course.price}` : "Free"}
                          </p>
                        </div>
                        <span
                          className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold border ${
                            course.status === "published"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;
