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
  Clock,
  Star,
} from "lucide-react";

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    <h3 className="text-xl font-extrabold text-accent mt-1">{value}</h3>
    <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
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
      <div className="space-y-5 font-sans">
        
        {/* Simple Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">System overview and course management statistics</p>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 h-[84px] rounded-xl border border-slate-200 shadow-sm animate-pulse"
              />
            ))
          ) : (
            <>
              <StatCard
                label="Total Learners"
                value={stats?.total_users ?? 0}
                sub="Registered accounts"
              />
              <StatCard
                label="Total Courses"
                value={stats?.total_courses ?? 0}
                sub={`${stats?.published_courses ?? 0} published`}
              />
              <StatCard
                label="Total Enrollments"
                value={stats?.total_enrollments ?? 0}
                sub="Active course subscriptions"
              />
              <StatCard
                label="Total Revenue"
                value={`₹${(stats?.total_revenue ?? 0).toLocaleString("en-IN")}`}
                sub="Completed course sales"
              />
            </>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/courses"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <BookOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-accent group-hover:text-primary transition-colors">Manage Courses</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Create, edit, publish</p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            to="/admin/users"
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition">
              <Users size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-accent group-hover:text-primary transition-colors">Manage Users</p>
              <p className="text-[10px] text-slate-400 mt-0.5">View & bulk import</p>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex items-center gap-3.5 select-none opacity-60">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0">
              <Star size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500">Reports Panel</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Coming soon</p>
            </div>
            <Clock size={14} className="text-slate-300" />
          </div>
        </div>

        {/* ── Recent Activity Feed ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
            <div className="bg-white p-4 h-64 rounded-xl border border-slate-200 shadow-sm" />
            <div className="bg-white p-4 h-64 rounded-xl border border-slate-200 shadow-sm" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Courses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-accent">Recent Courses</h3>
                <Link
                  to="/admin/courses"
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="flex-1">
                {stats.recent_courses.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">No courses found</div>
                ) : (
                  <div className="space-y-2">
                    {stats.recent_courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50"
                      >
                        <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <GraduationCap size={14} />
                        </div>
                        <div className="flex-1 min-w-0 ml-3">
                          <p className="text-xs font-bold text-accent truncate">
                            {course.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                            {course.is_paid ? `₹${course.price}` : "Free"}
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

            {/* Recent Learners */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-accent">Recent Learners</h3>
                <Link
                  to="/admin/users"
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="flex-1">
                {stats.recent_users.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">No learners found</div>
                ) : (
                  <div className="space-y-2">
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
                        <div
                          key={u.id}
                          className="p-2 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50/50"
                        >
                          <div className="flex items-center min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0 ml-3">
                              <h4 className="text-xs font-bold text-accent truncate">
                                {u.full_name || "—"}
                              </h4>
                              <p className="text-[9px] text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
