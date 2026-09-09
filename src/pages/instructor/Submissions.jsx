import React, { useState, useEffect } from "react";
import InstructorLayout from "../../components/InstructorLayout";
import api from "../../lib/api";
import { PageHeader } from "../../components/common";
import { SubmissionsTable, SubmissionReviewModal } from "../../components/submissions";

const InstructorSubmissions = () => {
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
      const res = await api.get("/instructor/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching instructor courses:", err);
    }
  }, []);

  const fetchSubmissions = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/instructor/submissions?";
      if (statusFilter !== "all") {
        url += `status_filter=${statusFilter}&`;
      }
      if (courseFilter) {
        url += `course_id=${courseFilter}&`;
      }
      const res = await api.get(url);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, courseFilter]);

  useEffect(() => {
    fetchSubmissions();
    fetchCourses();
  }, [fetchSubmissions, fetchCourses]);

  const handleOpenReview = async (sub) => {
    try {
      // Fetch full detail with user answers and attachments
      const res = await api.get(`/instructor/submissions/${sub.id}`);
      setSelectedSub(res.data);
      setReviewForm({
        status: res.data.status === "rejected" ? "rejected" : "approved",
        grade: res.data.grade ?? 100,
        feedback: res.data.feedback || "",
      });
    } catch {
      setSelectedSub(sub);
      setReviewForm({
        status: sub.status === "rejected" ? "rejected" : "approved",
        grade: sub.grade ?? 100,
        feedback: sub.feedback || "",
      });
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setReviewLoading(true);
    try {
      await api.post(`/instructor/submissions/${selectedSub.id}/review`, {
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
    <InstructorLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Assessment Submissions"
          subtitle="Review project assignments, grade subjective answers, and provide actionable feedback"
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
    </InstructorLayout>
  );
};

export default InstructorSubmissions;
