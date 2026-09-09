import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../lib/api";
import { PageHeader } from "../../components/common";
import { SubmissionsTable, SubmissionReviewModal } from "../../components/submissions";

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("");

  // Review Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "approved",
    grade: 100,
    feedback: "",
  });

  const fetchCourses = React.useCallback(async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching admin courses:", err);
    }
  }, []);

  const fetchSubmissions = React.useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter !== "all"
          ? `/admin/submissions?status=${statusFilter}`
          : `/admin/submissions`;
      const res = await api.get(url);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubmissions();
    fetchCourses();
  }, [fetchSubmissions, fetchCourses]);

  const handleOpenReview = (sub) => {
    setSelectedSub(sub);
    setReviewForm({
      status: sub.status === "rejected" ? "rejected" : "approved",
      grade: sub.grade ?? 100,
      feedback: sub.feedback || "",
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setReviewLoading(true);
    try {
      await api.post(`/admin/submissions/${selectedSub.id}/review`, {
        status: reviewForm.status,
        grade: parseInt(reviewForm.grade) || 0,
        feedback: reviewForm.feedback,
      });
      setShowReviewModal(false);
      fetchSubmissions();
    } catch (err) {
      console.error("Error evaluating submission:", err);
      alert(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Submissions & Grading"
          subtitle="Evaluate assignments, verify project submissions, and award module grades"
        />

        <SubmissionsTable
          submissions={submissions}
          courses={courses}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          courseFilter={courseFilter}
          onCourseFilterChange={setCourseFilter}
          onReviewSubmission={handleOpenReview}
        />

        <SubmissionReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          submission={selectedSub}
          reviewForm={reviewForm}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, [e.target.name]: e.target.value })
          }
          onSubmit={handleSubmitReview}
          loading={reviewLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions;
