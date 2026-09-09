import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import API_URL from "../../config";
import { sanitizeHtml } from "../../lib/sanitize";
import { useAuth } from "../../context/AuthContext";
import Certificate from "../../components/Certificate";
import CertificateModalPreview from "../../components/CertificateModalPreview";
import LearnerLayout from "../../components/LearnerLayout";
import { CoursePlayerSkeleton } from "../../components/Skeletons";
import {
  CheckCircle,
  Lock,
  PlayCircle,
  FileText,
  X,
  Download,
  ClipboardList,
  ArrowLeft,
  Award,
  Menu,
  MessageSquare,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseContent, setCourseContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  useEffect(() => {
    if (activeLesson) {
      fetchComments();
    }
  }, [activeLesson?.id]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const res = await api.get(`/learner/lessons/${activeLesson.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentsError("Could not load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/learner/lessons/${activeLesson.id}/comments`, {
        content: newComment,
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/learner/lessons/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment.");
    }
  };

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    try {
      const response = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(response.data);

      if (!activeLesson && response.data.modules.length > 0) {
        for (const module of response.data.modules) {
          if (module.lessons.length > 0) {
            const firstLesson = module.lessons.find((l) => !l.locked);
            if (firstLesson) {
              setActiveLesson(firstLesson);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course content:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    if (lesson.locked) return;
    setActiveLesson(lesson);
    setMobileSidebarOpen(false); // Close on mobile after selection
  };

  const handleLessonNavigation = (modules, currentLessonId) => {
    let foundActive = false;
    let nextLesson = null;

    for (const m of modules) {
      for (const l of m.lessons) {
        if (foundActive && !l.locked) {
          nextLesson = l;
          break;
        }
        if (l.id === currentLessonId) {
          foundActive = true;
        }
      }
      if (nextLesson) break;
    }

    if (nextLesson) {
      setActiveLesson(nextLesson);
    } else {
      // Fallback: Just sync current lesson status if no next found
      for (const module of modules) {
        const updated = module.lessons.find((l) => l.id === currentLessonId);
        if (updated) {
          setActiveLesson(updated);
          break;
        }
      }
    }
  };

  const getNextLesson = (currentLesson) => {
    if (!currentLesson || !courseContent) return null;
    let foundActive = false;
    for (const m of courseContent.modules) {
      for (const l of m.lessons) {
        if (foundActive && !l.locked) {
          return l;
        }
        if (l.id === currentLesson.id) {
          foundActive = true;
        }
      }
    }
    return null;
  };

  const handleAssignmentComplete = async () => {
    try {
      const response = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(response.data);
      if (activeLesson) {
        handleLessonNavigation(response.data.modules, activeLesson.id);
      }
    } catch (error) {
      console.error("Error refreshing after assignment completion:", error);
    }
  };

  const handleLessonComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);

    setActiveLesson((prev) => ({ ...prev, completed: true }));

    try {
      await api.post(
        `/learner/courses/${courseId}/lessons/${activeLesson.id}/complete`,
        {},
      );

      const response = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(response.data);

      handleLessonNavigation(response.data.modules, activeLesson.id);
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      setActiveLesson((prev) => ({ ...prev, completed: false }));
    } finally {
      setCompleting(false);
    }
  };

  const getSecureVideoUrl = (url) => {
    if (!url) return "";
    const token = localStorage.getItem("token") || "";
    let secureUrl = url.replace("/static/uploads/", "/media/");

    if (secureUrl.startsWith("/")) {
      secureUrl = `${API_URL}${secureUrl}`;
    } else if (!secureUrl.startsWith("http")) {
      secureUrl = `${API_URL}/${secureUrl}`;
    }

    return `${secureUrl}${secureUrl.includes("?") ? "&" : "?"}token=${token}`;
  };

  if (loading)
    return (
      <LearnerLayout isPlayerPage={true}>
        <CoursePlayerSkeleton />
      </LearnerLayout>
    );

  if (!courseContent)
    return (
      <LearnerLayout isPlayerPage={true}>
        <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-white items-center justify-center text-center p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Course not found or access denied.</h2>
            <button onClick={() => navigate("/dashboard")} className="text-primary mt-4 inline-block font-bold">
              Back to Dashboard
            </button>
          </div>
        </div>
      </LearnerLayout>
    );

  return (
    <LearnerLayout isPlayerPage={true}>
      <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* ── Player Top Header Bar ── */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-40">
          {/* Left: Back & Course Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="hidden sm:inline text-slate-700 font-normal">|</span>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {courseContent.title}
            </h2>
          </div>

          {/* Right: Progress Pill, Certificate CTA, and Curriculum Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Progress Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${courseContent.progress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-300">
                {courseContent.progress}%
              </span>
            </div>

            {/* Certificate Button (if eligible) */}
            {(courseContent.certificate_pdf_url || Number(courseContent.progress) >= 100) && (
              <button
                onClick={() => {
                  if (courseContent.certificate_pdf_url) {
                    setShowCertificate(true);
                  } else {
                    setShowVerificationWarning(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all"
              >
                <Award size={14} />
                <span className="hidden sm:inline">Certificate</span>
              </button>
            )}

            {/* Curriculum Drawer Toggle (Mobile & Desktop) */}
            <button
              onClick={() => {
                setMobileSidebarOpen(!mobileSidebarOpen);
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Toggle Curriculum Sidebar"
            >
              <Menu size={16} />
              <span className="hidden lg:inline text-[11px]">Curriculum</span>
            </button>
          </div>
        </header>

        {/* ── Main Body Split: Learning Stage + Curriculum Sidebar ── */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Content Area */}
          <div className="flex-1 bg-white text-slate-900 overflow-y-auto h-full">
            {activeLesson ? (
              <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8 space-y-6">
                {/* Course Accomplished Celebration Banner */}
                {(Number(courseContent?.progress) >= 100 || !!courseContent?.certificate_pdf_url) && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#172e38] to-[#15803d] text-white rounded-2xl p-5 sm:p-7 shadow-md border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                        <Award className="w-8 h-8 text-emerald-300" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">
                          Course Completed!
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                          Congratulations, {user?.full_name || user?.username || "Learner"}!
                        </h2>
                        <p className="text-white/80 text-xs sm:text-sm mt-0.5 max-w-xl">
                          You have completed all modules for <strong>"{courseContent.title}"</strong>.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center flex-shrink-0">
                        <button
                          onClick={() => {
                            if (courseContent.certificate_pdf_url) {
                              setShowCertificate(true);
                            } else {
                              setShowVerificationWarning(true);
                            }
                          }}
                          className="bg-white text-slate-900 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Award size={14} /> View Certificate
                        </button>
                        {courseContent.certificate_pdf_url ? (
                          <a
                            href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                            download="Certificate.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                          >
                            <Download size={14} /> Download PDF
                          </a>
                        ) : (
                          <button
                            onClick={() => setShowVerificationWarning(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                          >
                            <Download size={14} /> Download PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Title & Stage */}
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                    {activeLesson.title}
                  </h1>

                  {/* Video Player */}
                  {activeLesson.lesson_type === "video" && activeLesson.video_url && (
                    <div className="aspect-video bg-black rounded-2xl mb-6 overflow-hidden shadow-lg border border-slate-900 ring-1 ring-slate-800">
                      <video
                        src={getSecureVideoUrl(activeLesson.video_url)}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* Assignment Player */}
                  {activeLesson.lesson_type === "assignment" ? (
                    <AssignmentPlayer
                      lesson={activeLesson.isFinal ? null : activeLesson}
                      initialAssignment={activeLesson.isFinal ? activeLesson : null}
                      courseId={courseId}
                      onComplete={handleAssignmentComplete}
                      nextLesson={getNextLesson(activeLesson)}
                      onNextLesson={() => handleLessonSelect(getNextLesson(activeLesson))}
                    />
                  ) : (
                    <article className="prose prose-slate max-w-none mb-6 prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed">
                      {activeLesson.content ? (
                        <div
                          className="whitespace-pre-wrap text-slate-800 font-normal leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(activeLesson.content),
                          }}
                        />
                      ) : (
                        <p className="text-slate-400 text-xs italic">
                          This lesson doesn't have any text content.
                        </p>
                      )}
                    </article>
                  )}

                  {/* Lesson Complete / Next Actions */}
                  {activeLesson.lesson_type !== "assignment" && (
                    <div className="border-t border-slate-200/80 pt-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        {activeLesson.completed && (
                          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                            <CheckCircle size={16} className="text-emerald-600" />
                            <span>Lesson Completed</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {!activeLesson.completed && (
                          <button
                            onClick={handleLessonComplete}
                            disabled={completing}
                            className="bg-accent hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {completing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <span>Mark as Complete</span>
                                <CheckCircle size={16} />
                              </>
                            )}
                          </button>
                        )}

                        {getNextLesson(activeLesson) && (
                          <button
                            onClick={() => handleLessonSelect(getNextLesson(activeLesson))}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
                          >
                            Next Lesson &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Discussion Forum ── */}
                <div className="mt-10 pt-8 border-t border-slate-200/80">
                  <div className="flex items-center gap-2.5 mb-5">
                    <MessageSquare size={20} className="text-slate-700" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Discussion & Questions
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                      {comments.length}
                    </span>
                  </div>

                  {/* Comment Post Form */}
                  <form onSubmit={handlePostComment} className="mb-6 space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or share thoughts about this lesson..."
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50/50 transition-all resize-y"
                      rows={3}
                    />
                    {newComment.trim() && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />
                        <span>Please follow community guidelines. Inappropriate comments will lead to account action.</span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="bg-accent hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                      >
                        Post Comment
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="py-4 text-center text-xs text-slate-400">Loading discussion...</div>
                  ) : commentsError ? (
                    <div className="py-4 text-center text-xs text-red-500">{commentsError}</div>
                  ) : comments.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No comments yet. Be the first to start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((c) => {
                        const initials = c.user.full_name
                          ? c.user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                          : c.user.email.slice(0, 2).toUpperCase();

                        const isAuthorOrAdmin = c.user_id === user?.id || user?.role === "admin";
                        const isInstructor = c.user.role === "admin";

                        return (
                          <div
                            key={c.id}
                            className="flex gap-3.5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors"
                          >
                            <CommentAvatar
                              src={c.user.profile_picture_url ? getSecureVideoUrl(c.user.profile_picture_url) : null}
                              alt={c.user.full_name || "Profile"}
                              initials={initials}
                              isInstructor={isInstructor}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                                    {c.user.full_name || c.user.email}
                                  </span>
                                  {isInstructor && (
                                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded uppercase">
                                      Instructor
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(c.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {c.content}
                              </p>
                              {isAuthorOrAdmin && (
                                <div className="flex justify-end mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <PlayCircle size={48} className="mb-3 opacity-20" />
                <h3 className="text-sm font-bold text-slate-500">Select a lesson to begin learning</h3>
              </div>
            )}
          </div>

          {/* ── Curriculum Sidebar (Desktop & Mobile Drawer) ── */}
          {/* Backdrop for Mobile */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          <div
            className={`
              w-80 lg:w-96 bg-slate-50 border-l border-slate-200 flex flex-col flex-shrink-0 z-50
              fixed md:relative inset-y-0 right-0 transform transition-transform duration-300 md:translate-x-0
              ${mobileSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
              ${sidebarOpen ? "md:flex" : "md:hidden"}
            `}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Course Content
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {courseContent.progress}% Completed
                </p>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modules / Lessons List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {courseContent.modules.map((module, mIdx) => (
                <div key={module.id} className="space-y-1">
                  <div className="px-2 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {mIdx + 1}. {module.title}
                  </div>
                  <ul className="space-y-0.5">
                    {module.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <li
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson)}
                          className={`
                            p-2.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all text-xs
                            ${isActive ? "bg-slate-900 text-white font-bold shadow-sm" : "text-slate-700 hover:bg-slate-200/60 font-medium"}
                            ${lesson.locked ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}
                          `}
                        >
                          {lesson.completed ? (
                            <CheckCircle
                              size={15}
                              className={isActive ? "text-emerald-400" : "text-emerald-600 flex-shrink-0"}
                            />
                          ) : lesson.locked ? (
                            <Lock size={14} className="text-slate-400 flex-shrink-0" />
                          ) : (
                            <PlayCircle
                              size={15}
                              className={isActive ? "text-primary" : "text-slate-400 flex-shrink-0"}
                            />
                          )}
                          <span className="truncate flex-1">{lesson.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Warning Modal */}
        {showVerificationWarning &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={(e) => {
                e.stopPropagation();
                setShowVerificationWarning(false);
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center border border-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 mx-auto mb-3">
                  <Award className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Profile Incomplete</h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Please complete your profile on svarp.org with the same registered email to generate your official certificate.
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://svarp.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-accent hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Go to svarp.org
                  </a>
                  <button
                    onClick={() => setShowVerificationWarning(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* Certificate Modal */}
        {showCertificate && courseContent?.certificate_pdf_url && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Your Course Certificate</h2>
              <div className="flex items-center gap-3">
                <a
                  href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                  download="Certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-accent text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800 transition"
                >
                  <Download size={14} /> Download PDF
                </a>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <CertificateModalPreview>
              <Certificate
                learnerName={user?.full_name || user?.username || "SVARP Learner"}
                courseName={courseContent.title}
                certificateId={
                  courseContent.certificate_code ||
                  courseContent.certificate_id ||
                  `SV-${courseContent.id}-${user?.id || "PRO"}`
                }
                date={new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                isHonour={courseContent.progress >= 75}
                qrImageUrl={getSecureVideoUrl(courseContent.certificate_pdf_url.replace(".pdf", ".png"))}
                profilePictureUrl={getSecureVideoUrl(courseContent.profile_picture_url)}
              />
            </CertificateModalPreview>
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

// ─── Comment Avatar Component ────────────────────────────────────────────────
const CommentAvatar = ({ src, alt, initials, isInstructor }) => {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100 shadow-sm"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
      isInstructor ? "bg-accent" : "bg-primary text-accent"
    }`}>
      {initials}
    </div>
  );
};

export default CoursePlayer;

// ─── Assignment Player Component ────────────────────────────────────────────

const AssignmentPlayer = ({
  lesson,
  initialAssignment,
  courseId,
  onComplete,
  nextLesson,
  onNextLesson,
}) => {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [answers, setAnswers] = useState({}); // { question_id: { answer_text, selected_option_id } }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchAssignment();
  }, [lesson?.id, initialAssignment?.id]);

  const fetchAssignment = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setAttempts([]);
    try {
      let currentAsgn = initialAssignment;
      if (lesson) {
        // Find assignment linked to this lesson
        const res = await api.get(
          `/learner/assignments/by-lesson/${lesson.id}`,
        );
        currentAsgn = res.data;
        setAssignment(res.data);
      } else if (initialAssignment) {
        setAssignment(initialAssignment);
      }
      
      if (!currentAsgn) return;

      // Check for prior submission
      try {
        const priorRes = await api.get(
          `/learner/assignments/${currentAsgn.id}/submission`,
        );
        setResult(priorRes.data);
      } catch (_) {
        /* No prior submission */
      }

      // Fetch all attempts history
      try {
        const attemptsRes = await api.get(
          `/learner/assignments/${currentAsgn.id}/attempts`,
        );
        setAttempts(attemptsRes.data);
      } catch (_) {
        /* Could not load attempts */
      }
    } catch (e) {
      setError("Could not load assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selected_option_id: optionId },
    }));
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { answer_text: text } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const answersList = (assignment.questions || []).map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id]?.answer_text || null,
        selected_option_id: answers[q.id]?.selected_option_id || null,
      }));
      const res = await api.post(
        `/learner/assignments/${assignment.id}/submit`,
        {
          answers: answersList,
        },
      );
      setResult(res.data);
      onComplete(); // Refresh course sidebar

      // Reload attempts history
      try {
        const attemptsRes = await api.get(
          `/learner/assignments/${assignment.id}/attempts`,
        );
        setAttempts(attemptsRes.data);
      } catch (_) {}
    } catch (e) {
      setError(e.response?.data?.detail || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="py-8 text-gray-400">Loading assignment...</div>;
  if (error && !assignment)
    return <div className="py-8 text-red-500">{error}</div>;
  if (!assignment)
    return (
      <div className="py-8 text-gray-400">
        No assignment found for this lesson.
      </div>
    );

  return (
    <div className="bg-muted/50 rounded-2xl md:rounded-[2rem] border border-gray-100/60 p-4 md:p-6 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardList size={22} className="text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">{assignment.title}</h2>
      </div>
      {assignment.description && (
        <p className="text-gray-600 mb-6 text-sm whitespace-pre-wrap">
          {assignment.description}
        </p>
      )}

      {result ? (
        // Show result
        <div className="space-y-4">
          {result.mcq_total > 0 && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 ${
                result.mcq_score === result.mcq_total
                  ? "bg-green-50 border border-green-100 text-green-800"
                  : "bg-yellow-50 border border-yellow-100 text-yellow-800"
              }`}
            >
              <CheckCircle
                size={20}
                className={
                  result.mcq_score === result.mcq_total
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              />
              <span className="font-semibold">
                MCQ Score: {result.mcq_score} / {result.mcq_total}
              </span>
            </div>
          )}
          {result.has_subjective && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-sm">
              Your written answers have been submitted and are pending
              instructor review.
            </div>
          )}
          <div className="space-y-4 mt-4">
            {result.answers.map((ans, i) => (
              <div
                key={ans.question_id}
                className="border border-gray-100 bg-white rounded-2xl p-4 shadow-sm"
              >
                <p className="font-semibold text-gray-800 mb-2">
                  {i + 1}. {ans.question_text}
                </p>
                {ans.question_type === "mcq" ? (
                  <div className="flex items-center gap-2">
                    {ans.is_correct ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className="text-sm text-gray-600 font-medium">
                      {ans.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic font-medium">
                    {ans.answer_text || "(no answer)"}
                  </p>
                )}
              </div>
            ))}
          </div>
          {result.status !== "approved" && (
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Status: {result.status.replace(/_/g, " ")}
            </p>
          )}
          {result.status === "rejected" && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <X size={20} className="text-red-650" />
                <div className="text-left">
                  <p className="font-bold text-sm">Attempt Failed</p>
                  <p className="text-xs text-red-600 font-medium">You did not meet the passing score requirement for this lesson.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setError("");
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
              >
                Try Again
              </button>
            </div>
          )}
          {nextLesson && (
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onNextLesson}
                className="bg-accent text-white px-6 py-3.5 rounded-xl font-bold hover:bg-opacity-90 flex items-center gap-2 hover:shadow-xl hover:shadow-accent/20 transition-all active:scale-95"
              >
                Next Lesson
              </button>
            </div>
          )}
        </div>
      ) : (
        // Show questions form
        <form onSubmit={handleSubmit} className="space-y-6">
          {(assignment.questions || []).map((q, idx) => (
            <div key={q.id} className="border border-gray-100 bg-white rounded-2xl p-5 shadow-sm">
              <p className="font-semibold text-gray-800 mb-3">
                {idx + 1}. {q.question_text}
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded font-bold ${
                    q.question_type === "mcq"
                      ? "bg-purple-50 text-purple-600 border border-purple-100"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}
                >
                  {q.question_type === "mcq" ? "MCQ" : "Written"}
                </span>
              </p>
              {q.question_type === "mcq" ? (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        answers[q.id]?.selected_option_id === opt.id
                          ? "border-primary bg-primary/10 font-bold"
                          : "border-gray-200 hover:border-gray-300 font-medium"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.id}
                        checked={answers[q.id]?.selected_option_id === opt.id}
                        onChange={() => handleOptionSelect(q.id, opt.id)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {opt.option_text}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  placeholder="Type your answer here..."
                  value={answers[q.id]?.answer_text || ""}
                  onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white font-medium"
                  rows={4}
                />
              )}
            </div>
          ))}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-accent px-6 py-3.5 rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
              <ClipboardList size={18} />
            </button>
          </div>
        </form>
      )}

      {/* Attempts History */}
      {attempts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-4 text-left">
            Attempt History
          </h3>
          <div className="space-y-3">
            {attempts.map((attempt, index) => {
              const attemptNumber = attempts.length - index;
              const isPassed = attempt.status === "approved";
              const isFailed = attempt.status === "rejected";
              
              return (
                <div
                  key={attempt.submission_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-150 flex items-center justify-center text-xs font-bold text-gray-500">
                      #{attemptNumber}
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-accent">
                        Submitted: {new Date(attempt.submitted_at).toLocaleString()}
                      </p>
                      {attempt.feedback && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Feedback: <span className="italic font-medium">{attempt.feedback}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.mcq_total > 0 && (
                      <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                        Score: {attempt.mcq_score} / {attempt.mcq_total}
                      </span>
                    )}
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      isPassed
                        ? "bg-green-50 text-green-700 border border-green-150"
                        : isFailed
                        ? "bg-red-50 text-red-700 border border-red-150"
                        : "bg-yellow-50 text-yellow-750 border border-yellow-150"
                    }`}>
                      {attempt.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
