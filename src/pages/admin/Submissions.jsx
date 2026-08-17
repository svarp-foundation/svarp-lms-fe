import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../lib/api";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Check,
  Ban,
  User,
  Calendar,
} from "lucide-react";
import { TableSkeleton } from "../../components/Skeletons";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "individual"

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url = filterStatus !== "all" ? `/admin/submissions?status=${filterStatus}` : `/admin/submissions`;
      const res = await api.get(url);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (cardKey) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const handleReviewAll = async (courseId, userId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} all modules for this student's course?`)) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/courses/${courseId}/users/${userId}/review-all`, {
        status: status,
        grade: status === "approved" ? 100 : 0,
        feedback: status === "approved" ? "Approved all course modules" : "Course assignments rejected by instructor",
      });
      fetchSubmissions();
    } catch (err) {
      console.error("Error bulk reviewing submissions:", err);
      alert(err.response?.data?.detail || "Failed to update course status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIndividualReview = async (submissionId, status) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/submissions/${submissionId}/review`, {
        status: status,
        grade: status === "approved" ? 100 : 0,
        feedback: status === "approved" ? "Passed assessment" : "Needs revision",
      });
      fetchSubmissions();
    } catch (err) {
      console.error("Error reviewing individual submission:", err);
      alert("Failed to review submission");
    } finally {
      setActionLoading(false);
    }
  };

  // Search filter
  const filteredSubmissions = React.useMemo(() => {
    if (!searchTerm) return submissions;
    const term = searchTerm.toLowerCase();
    return submissions.filter(
      (sub) =>
        sub.user_name?.toLowerCase().includes(term) ||
        sub.user_email?.toLowerCase().includes(term) ||
        sub.assignment_title?.toLowerCase().includes(term)
    );
  }, [submissions, searchTerm]);

  // Group submissions by User + Course
  const groupedData = React.useMemo(() => {
    const groups = {};
    filteredSubmissions.forEach((sub) => {
      const groupKey = `${sub.user_name}_${sub.user_email}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          user_id: sub.user_id,
          user_name: sub.user_name,
          user_email: sub.user_email,
          courses: {},
        };
      }
      const courseKey = sub.assignment_title || "Course Submissions";
      if (!groups[groupKey].courses[courseKey]) {
        groups[groupKey].courses[courseKey] = {
          title: courseKey,
          user_id: sub.user_id,
          course_id: sub.course_id || 1,
          submissions: [],
          hasPending: false,
          hasRejected: false,
          allApproved: true,
        };
      }
      groups[groupKey].courses[courseKey].submissions.push(sub);
      if (sub.status === "submitted" || sub.status === "under_review") {
        groups[groupKey].courses[courseKey].hasPending = true;
      }
      if (sub.status === "rejected") {
        groups[groupKey].courses[courseKey].hasRejected = true;
      }
      if (sub.status !== "approved") {
        groups[groupKey].courses[courseKey].allApproved = false;
      }
    });
    return groups;
  }, [filteredSubmissions]);

  return (
    <AdminLayout>
      <div className="space-y-4 font-sans">
        {/* Admin Standard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent flex items-center gap-2">
              <Award className="text-accent" size={22} />
              Submissions & Course Reviews
            </h1>
            <p className="text-xs text-slate-500">
              Evaluate student assessments, manage course completions, and issue or revoke certificates.
            </p>
          </div>
        </div>

        {/* Admin Standard Search & Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-bold">
              <button
                onClick={() => setViewMode("grouped")}
                className={`px-2.5 py-1 rounded transition ${
                  viewMode === "grouped" ? "bg-white text-accent shadow-xs" : "text-slate-500"
                }`}
              >
                Grouped View
              </button>
              <button
                onClick={() => setViewMode("individual")}
                className={`px-2.5 py-1 rounded transition ${
                  viewMode === "individual" ? "bg-white text-accent shadow-xs" : "text-slate-500"
                }`}
              >
                Single List
              </button>
            </div>

            {/* Filter Status Buttons */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-semibold">
              {["all", "submitted", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded capitalize transition ${
                    filterStatus === st ? "bg-accent text-white font-bold" : "text-slate-500 hover:text-accent"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="text-center text-xs text-slate-400 italic py-12 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <FileText className="mx-auto text-slate-300" size={36} />
            <p className="font-bold text-slate-600 text-sm">No Submissions Found</p>
            <p className="text-xs text-slate-400">All submissions have been evaluated or none match the filter criteria.</p>
          </div>
        ) : viewMode === "grouped" ? (
          /* GROUPED VIEW */
          <div className="space-y-3">
            {Object.entries(groupedData).map(([userKey, userData]) =>
              Object.entries(userData.courses).map(([cTitle, courseGroup]) => {
                const cardKey = `${userData.user_id}_${cTitle}`;
                const isExpanded = expandedCards[cardKey];

                return (
                  <div
                    key={cardKey}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors overflow-hidden"
                  >
                    {/* Header Row */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-accent font-extrabold flex items-center justify-center text-xs">
                            {userData.user_name.charAt(0)}
                          </span>
                          <div>
                            <h3 className="text-xs font-bold text-accent">{userData.user_name}</h3>
                            <p className="text-[10px] text-slate-400">{userData.user_email}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <Layers size={12} /> {courseGroup.submissions.length} Submissions
                          </span>

                          {courseGroup.allApproved ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                              <CheckCircle size={12} /> All Approved
                            </span>
                          ) : courseGroup.hasRejected ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                              <Ban size={12} /> Rejected / Revoked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                              <Clock size={12} /> Pending Audit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Admin Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReviewAll(courseGroup.course_id, courseGroup.user_id, "approved")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1"
                        >
                          <Check size={14} /> Approve Course
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReviewAll(courseGroup.course_id, courseGroup.user_id, "rejected")}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1"
                        >
                          <Ban size={14} /> Reject Course
                        </button>

                        <button
                          onClick={() => toggleExpand(cardKey)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Answers Panel */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-white">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Course Exam Answers: {cTitle}
                        </h4>

                        {courseGroup.submissions.map((sub, sIdx) => (
                          <div key={sub.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-accent">
                              <span>{sub.assignment_title}</span>
                              <span className="text-[9px] text-slate-400 font-normal">
                                {new Date(sub.submitted_at).toLocaleDateString()}
                              </span>
                            </div>

                            {sub.answers?.map((ans, aIdx) => (
                              <div key={aIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <p className="font-bold text-slate-700 text-[11px]">Q{aIdx + 1}: {ans.question_text}</p>
                                {ans.answer_text && (
                                  <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px] whitespace-pre-wrap">
                                    {ans.answer_text}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* INDIVIDUAL LIST VIEW */
          <div className="grid grid-cols-1 gap-2">
            {filteredSubmissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-accent">{sub.assignment_title}</h3>
                    {sub.status === "approved" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                        <CheckCircle size={10} /> Approved
                      </span>
                    ) : sub.status === "rejected" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                        <Ban size={10} /> Rejected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">{sub.user_name} ({sub.user_email})</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleIndividualReview(sub.id, "approved")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleIndividualReview(sub.id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1 rounded-lg"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Submissions;
