import React from "react";
import { StatCard } from "../common";
import {
  IndianRupee,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Award,
} from "lucide-react";

export const AnalyticsSummaryCards = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 h-24 rounded-xl border border-slate-200 shadow-xs animate-pulse"
          />
        ))}
      </div>
    );
  }

  const {
    total_revenue = 0,
    total_paid_orders = 0,
    total_learners = 0,
    total_instructors = 0,
    total_courses = 0,
    published_courses = 0,
    total_enrollments = 0,
    completion_rate = 0,
    total_certificates = 0,
    total_submissions = 0,
    avg_mcq_score_pct = 0,
  } = summary;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <StatCard
        label="Total Revenue"
        value={`₹${total_revenue.toLocaleString("en-IN")}`}
        sub={`${total_paid_orders} paid orders`}
        icon={IndianRupee}
        to="/admin/payments"
        valueColor="text-emerald-700"
      />
      <StatCard
        label="Total Learners"
        value={total_learners.toLocaleString()}
        sub={`${total_instructors} active instructors`}
        icon={Users}
        to="/admin/users"
      />
      <StatCard
        label="Total Courses"
        value={total_courses}
        sub={`${published_courses} published`}
        icon={BookOpen}
        to="/admin/courses"
      />
      <StatCard
        label="Total Enrollments"
        value={total_enrollments.toLocaleString()}
        sub="Course subscriptions"
        icon={GraduationCap}
      />
      <StatCard
        label="Certificates Issued"
        value={total_certificates.toLocaleString()}
        sub={`${completion_rate}% completion rate`}
        icon={Award}
      />
      <StatCard
        label="Assignments & Quizzes"
        value={total_submissions.toLocaleString()}
        sub={`${avg_mcq_score_pct}% avg quiz score`}
        icon={ClipboardCheck}
        to="/admin/submissions"
      />
    </div>
  );
};

export default AnalyticsSummaryCards;
