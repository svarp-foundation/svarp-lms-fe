import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import { PageHeader, FilterTabs, Button } from "../../components/common";
import {
  AnalyticsSummaryCards,
  AnalyticsTrendChart,
  StudentRegistrationChart,
  CoursePerformanceTable,
  InstructorPerformanceTable,
  EngagementBreakdown,
} from "../../components/analytics";
import { RefreshCw, BarChart3, BookOpen, Users, ClipboardCheck } from "lucide-react";

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load platform analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const navTabs = [
    {
      id: "overview",
      label: "Executive Overview",
      icon: BarChart3,
    },
    {
      id: "courses",
      label: "Course Performance",
      icon: BookOpen,
      count: data?.course_analytics?.length,
    },
    {
      id: "instructors",
      label: "Instructors & Reach",
      icon: Users,
      count: data?.instructor_analytics?.length,
    },
    {
      id: "engagement",
      label: "Learner & Assessment Funnels",
      icon: ClipboardCheck,
    },
  ];

  return (
    <AdminLayout
      headerActions={
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={fetchAnalytics}
          disabled={loading}
        >
          Refresh Data
        </Button>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Platform Analytics & Intelligence"
          subtitle="Comprehensive tracking of LMS revenue, student signups, course performance, instructor impact, and learner assessments"
        />

        {/* Global Summary Metric Cards */}
        <AnalyticsSummaryCards
          summary={data?.summary}
          loading={loading}
        />

        {/* Tabbed View Navigation */}
        <div className="border-b border-slate-200">
          <FilterTabs
            tabs={navTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Tab Views */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <AnalyticsTrendChart
              trends={data?.monthly_trends}
              loading={loading}
            />
            <StudentRegistrationChart
              trends={data?.monthly_trends}
              learnerGrowth={data?.learner_growth}
              loading={loading}
            />
            <EngagementBreakdown
              summary={data?.summary}
              engagement={data?.engagement}
              loading={loading}
            />
          </div>
        )}


        {activeTab === "courses" && (
          <CoursePerformanceTable
            courses={data?.course_analytics || []}
            loading={loading}
          />
        )}

        {activeTab === "instructors" && (
          <InstructorPerformanceTable
            instructors={data?.instructor_analytics || []}
            loading={loading}
          />
        )}

        {activeTab === "engagement" && (
          <div className="space-y-6">
            <StudentRegistrationChart
              trends={data?.monthly_trends}
              learnerGrowth={data?.learner_growth}
              loading={loading}
            />
            <EngagementBreakdown
              summary={data?.summary}
              engagement={data?.engagement}
              loading={loading}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Analytics;
