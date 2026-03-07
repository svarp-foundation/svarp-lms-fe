import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import {
  Users,
  BookOpen,
  TrendingUp,
  IndianRupee,
  ArrowRight,
  GraduationCap,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";

const StatCard = ({ icon, label, value, sub, color, gradient }) => (
  <div
    className={`rounded-2xl p-6 text-white shadow-lg flex flex-col gap-3 ${gradient}`}
  >
    <div className="flex items-center justify-between">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white/20`}
      >
        {icon}
      </div>
      <span className="text-xs font-medium bg-white/15 px-2.5 py-1 rounded-full">
        {sub}
      </span>
    </div>
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-white/75 mt-0.5">{label}</p>
    </div>
  </div>
);

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
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back — here's what's happening on your platform today.
          </p>
        </div>

        {/* ── Stats Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-36 bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={<Users size={22} />}
              label="Total Learners"
              value={stats?.total_users ?? 0}
              sub="All time"
              gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <StatCard
              icon={<BookOpen size={22} />}
              label="Total Courses"
              value={stats?.total_courses ?? 0}
              sub={`${stats?.published_courses ?? 0} published`}
              gradient="bg-gradient-to-br from-violet-500 to-violet-700"
            />
            <StatCard
              icon={<TrendingUp size={22} />}
              label="Enrollments"
              value={stats?.total_enrollments ?? 0}
              sub="All time"
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
            <StatCard
              icon={<IndianRupee size={22} />}
              label="Revenue"
              value={`₹${(stats?.total_revenue ?? 0).toLocaleString("en-IN")}`}
              sub="Completed payments"
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/admin/courses"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition">
              <BookOpen size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Manage Courses</p>
              <p className="text-sm text-gray-500">Create, edit, publish</p>
            </div>
            <ArrowRight
              size={18}
              className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
            />
          </Link>

          <Link
            to="/admin/users"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition">
              <Users size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Manage Users</p>
              <p className="text-sm text-gray-500">View & bulk import</p>
            </div>
            <ArrowRight
              size={18}
              className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
            />
          </Link>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 opacity-50 cursor-not-allowed select-none">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
              <Star size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-600">Reports</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
            <Clock size={18} className="text-gray-300" />
          </div>
        </div>

        {/* ── Recent Activity ── */}
        {!loading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Courses */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80 bg-gray-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100/50 rounded-xl text-violet-600 border border-violet-100">
                    <BookOpen size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      Recent Courses
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      Latest additions
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/courses"
                  className="flex items-center gap-1 text-sm text-violet-600 font-bold hover:text-violet-700 hover:bg-violet-50 px-3 py-1.5 rounded-xl transition-all"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-4 flex-1">
                {stats.recent_courses.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-8 space-y-2">
                    <BookOpen size={32} className="opacity-20" />
                    <p>No courses yet</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {stats.recent_courses.map((course) => (
                      <li
                        key={course.id}
                        className="group flex items-center p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all duration-300"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-violet-100/50">
                          <GraduationCap
                            size={22}
                            className="text-violet-600"
                          />
                        </div>
                        <div className="flex-1 min-w-0 ml-4">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                              {course.is_paid ? (
                                <>
                                  <IndianRupee
                                    size={12}
                                    className="text-gray-400"
                                  />{" "}
                                  {course.price}
                                </>
                              ) : (
                                "Free"
                              )}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs text-gray-400 font-medium">
                              Course
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-bold shadow-sm border ${
                            course.status === "published"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {course.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80 bg-gray-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 rounded-xl text-blue-600 border border-blue-100">
                    <Users size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      Recent Learners
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      New signups
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-4 flex-1">
                {stats.recent_users.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-8 space-y-2">
                    <Users size={32} className="opacity-20" />
                    <p>No learners yet</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {stats.recent_users.map((u) => {
                      const initials = u.full_name
                        ? u.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : u.email[0].toUpperCase();
                      return (
                        <li
                          key={u.id}
                          className="group flex items-center p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all duration-300"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0 ml-4">
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {u.full_name || "—"}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                              {u.email}
                            </p>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 border border-green-100 group-hover:border-green-500">
                            <CheckCircle
                              size={16}
                              className={
                                "bg-white rounded-full group-hover:bg-transparent"
                              }
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
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
