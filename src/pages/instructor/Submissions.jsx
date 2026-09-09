import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import InstructorLayout from "../../components/InstructorLayout";
import {
  ClipboardList,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Check,
  X,
  FileText,
  User,
  Filter,
  Award,
  Ban,
} from "lucide-react";
import { TableSkeleton } from "../../components/Skeletons";
import { getMediaUrl } from "../../config";

const InstructorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Review Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [subDetailLoading, setSubDetailLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "approved",
    grade: 100,
    feedback: "",
  });

  useEffect(() => {
    fetchSubmissions();
    fetchCourses();
  }, [statusFilter, courseFilter]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/instructor/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching instructor courses:", err);
    }
  };

  const fetchSubmissions = async () => {
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
  };

  const handleOpenReview = async (subId) => {
    setSubDetailLoading(true);
    try {
      const res = await api.get(`/instructor/submissions/${subId}`);
      setSelectedSub(res.data);
      setReviewForm({
        status: res.data.status === "rejected" ? "rejected" : "approved",
        grade:
          res.data.grade ??
          (res.data.mcq_score !== null && res.data.mcq_total
            ? Math.round((res.data.mcq_score / res.data.mcq_total) * 100)
            : 100),
        feedback: res.data.feedback || "",
      });
    } catch (err) {
      alert("Failed to load submission details");
    } finally {
      setSubDetailLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setReviewLoading(true);
    try {
      await api.put(`/instructor/submissions/${selectedSub.id}/review`, reviewForm);
      alert(`Submission marked as ${reviewForm.status.toUpperCase()}`);
      setSelectedSub(null);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.student_name && s.student_name.toLowerCase().includes(term)) ||
      (s.student_email && s.student_email.toLowerCase().includes(term)) ||
      (s.course_title && s.course_title.toLowerCase().includes(term)) ||
      (s.assignment_title && s.assignment_title.toLowerCase().includes(term))
    );
  });

  return (
    <InstructorLayout>
      <div className="space-y-4 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">Submissions & Grading</h1>
            <p className="text-xs text-slate-500">
              Evaluate student assessments, grade subjective answers, and provide feedback.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by student name, email, or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter Dropdown */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-accent"
            >
              <option value="">All My Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-semibold">
              {[
                { id: "all", label: "All" },
                { id: "submitted", label: "Needs Review" },
                { id: "approved", label: "Approved" },
                { id: "rejected", label: "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2 py-0.5 rounded capitalize transition ${
                    statusFilter === tab.id
                      ? "bg-accent text-white font-bold"
                      : "text-slate-500 hover:text-accent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions Content */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center text-xs text-slate-400 italic py-16 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <ClipboardList className="mx-auto text-slate-300" size={36} />
            <p className="font-bold text-slate-600 text-sm">No Submissions Found</p>
            <p className="text-xs text-slate-400">
              When students submit quizzes or assignments in your courses, they will appear here for grading.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course & Assignment</th>
                    <th className="py-3 px-4">Score / Status</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-accent">{sub.student_name}</div>
                        <div className="text-[10px] text-slate-400">{sub.student_email}</div>
                      </td>

                      {/* Course / Assignment */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{sub.course_title}</div>
                        <div className="text-[11px] text-primary font-medium">
                          {sub.assignment_title}
                        </div>
                      </td>

                      {/* Status / Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              sub.status === "approved"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : sub.status === "rejected"
                                ? "bg-red-50 text-red-600 border-red-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            {sub.status.replace("_", " ")}
                          </span>

                          {sub.mcq_total ? (
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                              MCQ: {sub.mcq_score}/{sub.mcq_total}
                            </span>
                          ) : sub.grade !== null ? (
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                              {sub.grade}%
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenReview(sub.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-accent text-xs font-bold transition shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MODAL: Grade & Review Submission ── */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div>
                  <h3 className="font-bold text-xs text-accent">
                    Grade Assessment: {selectedSub.assignment_title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Course: <strong className="text-slate-600">{selectedSub.course_title}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Student Info Card */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                      Learner
                    </span>
                    <span className="font-bold text-accent">{selectedSub.student_name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({selectedSub.student_email})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                      Submitted On
                    </span>
                    <span className="font-semibold text-slate-600">
                      {new Date(selectedSub.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedSub.mcq_total && (
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                        MCQ Score
                      </span>
                      <span className="font-bold text-emerald-600">
                        {selectedSub.mcq_score} / {selectedSub.mcq_total} Correct
                      </span>
                    </div>
                  )}
                </div>

                {/* Subjective Response */}
                {selectedSub.content && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Student Written Response
                    </label>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                      {selectedSub.content}
                    </div>
                  </div>
                )}

                {/* File Attachment */}
                {selectedSub.file_url && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Attached Work File
                    </label>
                    <a
                      href={getMediaUrl(selectedSub.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      <FileText size={14} /> Download Submitted Attachment <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Questions Breakdown */}
                {selectedSub.answers?.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Question Answers Breakdown
                    </label>
                    <div className="space-y-2">
                      {selectedSub.answers.map((ans, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1 text-xs"
                        >
                          <div className="font-bold text-slate-700">
                            Q{idx + 1}: {ans.question_text}
                          </div>
                          {ans.question_type === "mcq" ? (
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-slate-400 text-[11px]">Selected:</span>
                              <span className="font-semibold text-slate-800">
                                {ans.selected_option_text || "None"}
                              </span>
                              {ans.is_correct ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                  <Check size={10} /> Correct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                  <X size={10} /> Incorrect
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-100 mt-1 font-mono text-[11px]">
                              {ans.answer_text || "No response written."}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading Form */}
                <form onSubmit={handleSubmitReview} className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Review Decision
                      </label>
                      <select
                        value={reviewForm.status}
                        onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-accent outline-none focus:border-accent"
                      >
                        <option value="approved">Approve & Mark Completed</option>
                        <option value="rejected">Reject Submission</option>
                        <option value="resubmission_required">Require Resubmission</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Grade Percentage (0 - 100%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={reviewForm.grade}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, grade: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-accent outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Instructor Feedback / Remarks
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide constructive feedback for the student..."
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSub(null)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="px-4 py-1.5 rounded-lg bg-primary hover:bg-slate-900 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      {reviewLoading ? "Saving..." : "Submit Grading"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default InstructorSubmissions;
