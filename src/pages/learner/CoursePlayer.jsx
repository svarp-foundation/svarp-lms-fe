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
      <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col md:flex-row bg-white relative overflow-hidden">
      {/* ── Mobile Header ── */}
      <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between sticky top-0 z-40">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors text-accent animate-luxury"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-sm font-extrabold truncate px-2 text-accent uppercase tracking-wider">
          {courseContent.title}
        </h2>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors text-accent"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ── Backdrop for Mobile Sidebar ── */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Drawer on mobile, persistent on desktop) ── */}
      <div className={`
        w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-[60]
        fixed inset-y-0 right-0 transform transition-transform duration-300 md:relative md:translate-x-0
        ${mobileSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Back navigation (Desktop only) */}
          <button
            onClick={() => navigate("/dashboard")}
            className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between mb-4 md:block">
            <h3 className="text-accent font-extrabold text-lg leading-tight">
              {courseContent.title}
            </h3>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-2 text-gray-400 hover:text-accent"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${courseContent.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              {courseContent.progress}% Course Completed
            </p>
            {(courseContent.certificate_pdf_url || Number(courseContent.progress) >= 100) ? (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (courseContent.certificate_pdf_url) {
                      setShowCertificate(true);
                    } else {
                      setShowVerificationWarning(true);
                    }
                  }}
                  className="w-full bg-accent hover:bg-opacity-90 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Award size={16} />
                  View Certificate
                </button>
              </div>
            ) : (
              (Number(courseContent.progress) >= 100 || !!courseContent.certificate_pdf_url) &&
              courseContent.require_final_assignment && (
                <div className="mt-4">
                  <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100 font-medium">
                    Certificate pending final assignment review.
                  </p>
                </div>
              )
            )}
          </div>

          <div className="space-y-6 flex-1">
            {courseContent.modules.map((module) => (
              <div key={module.id}>
                <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-3 px-1">
                  {module.title}
                </h4>
                <ul className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`
                          p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all font-semibold
                          ${activeLesson?.id === lesson.id ? "bg-primary/25 text-accent shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-accent"}
                          ${lesson.locked ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}
                      `}
                    >
                      {lesson.completed ? (
                        <CheckCircle
                          size={18}
                          className={activeLesson?.id === lesson.id ? "text-accent" : "text-green-500"}
                        />
                      ) : lesson.locked ? (
                        <Lock size={16} className="text-gray-400" />
                      ) : (
                        <PlayCircle size={18} className={activeLesson?.id === lesson.id ? "text-accent" : "text-gray-400"} />
                      )}

                      <span className="text-sm truncate font-medium">{lesson.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white overflow-y-auto w-full page-container-context">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10">
            {(Number(courseContent?.progress) >= 100 || !!courseContent?.certificate_pdf_url) && (
              <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-[#1f3b45] to-[#15803d] text-white rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10">
                {/* Decorative backgrounds/glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                    <Award className="w-10 h-10 text-green-300" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                      Congratulations, {user?.full_name || user?.username || "Learner"}!
                    </h2>
                    <p className="text-white/80 text-sm md:text-base font-medium max-w-xl">
                      You have finished all modules and requirements for <strong className="text-white font-semibold">"{courseContent.title}"</strong>. Your hard work has paid off!
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
                    {courseContent.certificate_pdf_url ? (
                      <>
                        <button
                          onClick={() => setShowCertificate(true)}
                          className="bg-white text-[#1f3b45] hover:bg-green-50 px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                        >
                          <Award size={18} />
                          View Certificate
                        </button>
                        <a
                          href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                          download="Certificate.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30 px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 text-center"
                        >
                          <Download size={18} />
                          Download Certificate
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowVerificationWarning(true)}
                          className="bg-white text-[#1f3b45] hover:bg-green-50 px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                        >
                          <Award size={18} />
                          View Certificate
                        </button>
                        <button
                          onClick={() => setShowVerificationWarning(true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30 px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 text-center"
                        >
                          <Download size={18} />
                          Download Certificate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="w-full mb-8">
              <h1 className="text-accent text-2xl md:text-3xl font-bold mb-6 leading-tight tracking-tight">
                {activeLesson.title}
              </h1>

              {activeLesson.lesson_type === "video" && activeLesson.video_url && (
                <div className="aspect-video bg-black rounded-2xl mb-6 overflow-hidden shadow-md ring-1 ring-white/10">
                  <video
                    src={getSecureVideoUrl(activeLesson.video_url)}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}

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
              <article className="prose prose-slate max-w-none mb-8 prose-headings:text-accent prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800">
                {activeLesson.content ? (
                  <div
                    className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed accessibility-text"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(activeLesson.content),
                    }}
                  />
                ) : (
                  <p className="text-gray-400 italic">
                    This lesson doesn't have any text content.
                  </p>
                )}
              </article>
            )}

            {activeLesson.lesson_type !== "assignment" && (
              <div className="border-t border-gray-100 pt-6 flex justify-end">
                {!activeLesson.completed ? (
                  <button
                    onClick={handleLessonComplete}
                    disabled={completing}
                    className="w-full sm:w-auto justify-center bg-gradient-to-r from-accent to-[#2d5462] text-white px-8 py-4 rounded-2xl font-extrabold hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-300 flex items-center gap-3 group/btn disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {completing ? (
                      <>
                        <CheckCircle size={20} className="animate-spin text-primary" />
                        <span className="tracking-wide text-white">Saving Progress...</span>
                      </>
                    ) : (
                      <>
                        <span className="tracking-wide text-white">Mark as Complete</span>
                        <CheckCircle size={20} className="group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-transform duration-300 text-primary" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-end">
                    <div className="justify-center bg-green-50/60 backdrop-blur-sm text-green-700 px-8 py-4 rounded-2xl font-extrabold flex items-center gap-3 border border-green-100/80 shadow-sm shadow-green-600/5">
                      <CheckCircle size={22} className="text-green-600" />
                      <span className="tracking-wide">Lesson Completed!</span>
                    </div>
                    {getNextLesson(activeLesson) && (
                      <button
                        onClick={() => handleLessonSelect(getNextLesson(activeLesson))}
                        className="bg-accent hover:bg-opacity-90 text-white px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-300"
                      >
                        Next Lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>

            {/* ── Lesson Discussion Forum ── */}
            <div className="mt-12 pt-8 border-t border-gray-150">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare size={22} className="text-accent" />
                <h3 className="text-xl font-extrabold text-accent">Discussion Forum</h3>
                <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded-full">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              </div>

              {/* Comment Post Form */}
              <form onSubmit={handlePostComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or share your thoughts about this lesson..."
                  className="w-full border border-gray-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white font-medium shadow-sm transition-all"
                  rows={3}
                />
                {newComment.trim() && (
                  <div className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 border border-red-100 p-3.5 rounded-xl mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                    <span className="leading-relaxed">
                      Please comment under community guidelines. If found faulty then your account can be terminated.
                    </span>
                  </div>
                )}
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-accent hover:bg-opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="py-4 text-center text-sm text-gray-400">Loading comments...</div>
              ) : commentsError ? (
                <div className="py-4 text-center text-sm text-red-500">{commentsError}</div>
              ) : comments.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-450 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 font-medium">
                  No comments yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => {
                    const initials = c.user.full_name
                      ? c.user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                      : c.user.email.slice(0, 2).toUpperCase();
                    
                    const isAuthorOrAdmin = c.user_id === user?.id || user?.role === "admin";
                    const isInstructor = c.user.role === "admin";

                    return (
                      <div key={c.id} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CommentAvatar
                          src={c.user.profile_picture_url ? getSecureVideoUrl(c.user.profile_picture_url) : null}
                          alt={c.user.full_name || "Profile"}
                          initials={initials}
                          isInstructor={isInstructor}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-accent">
                                {c.user.full_name || c.user.email}
                              </span>
                              {isInstructor && (
                                <span className="text-[10px] bg-accent/10 text-accent font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Instructor
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {new Date(c.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                          {isAuthorOrAdmin && (
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Delete comment"
                              >
                                <Trash2 size={15} />
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
          (Number(courseContent?.progress) >= 100 || !!courseContent?.certificate_pdf_url) ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-6 bg-gray-50/50">
              <div className="max-w-2xl w-full relative overflow-hidden bg-gradient-to-br from-[#1f3b45] to-[#15803d] text-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/10 text-center flex flex-col items-center">
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>
                
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner mb-6 animate-float">
                  <Award className="w-12 h-12 text-green-300" />
                </div>
                
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-white/15 text-green-200 uppercase tracking-widest mb-4 border border-white/10">
                  🏆 Course Accomplished!
                </span>
                
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 animate-luxury">
                  Outstanding Work, {user?.full_name || user?.username || "Learner"}!
                </h2>
                
                <p className="text-white/80 text-base md:text-lg font-medium max-w-lg mb-8 leading-relaxed">
                  You've successfully completed <strong className="text-white">"{courseContent.title}"</strong>. You've demonstrated dedication and mastership across all modules.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  {courseContent.certificate_pdf_url ? (
                    <>
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="bg-white text-[#1f3b45] hover:bg-green-50 px-8 py-4 rounded-2xl font-extrabold shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <Award size={20} />
                        View Certificate
                      </button>
                      <a
                        href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                        download="Certificate.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30 px-8 py-4 rounded-2xl font-extrabold shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 hover:-translate-y-0.5 text-center"
                      >
                        <Download size={20} />
                        Download Certificate
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowVerificationWarning(true)}
                        className="bg-white text-[#1f3b45] hover:bg-green-50 px-8 py-4 rounded-2xl font-extrabold shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <Award size={20} />
                        View Certificate
                      </button>
                      <button
                        onClick={() => setShowVerificationWarning(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30 px-8 py-4 rounded-2xl font-extrabold shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 hover:-translate-y-0.5 text-center"
                      >
                        <Download size={20} />
                        Download Certificate
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center bg-white">
              <PlayCircle size={64} className="mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-gray-300">Select a lesson to start learning</h3>
            </div>
          )
        )}
      </div>

      {/* Verification Warning Modal */}
      {showVerificationWarning && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.stopPropagation();
            setTimeout(() => setShowVerificationWarning(false), 100);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 mx-auto mb-4">
              <Award className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-accent mb-2">
              Profile Incomplete
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              please complete profile on svarp.org, by registering same email to generate certificate
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://svarp.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent hover:bg-opacity-95 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-accent/10"
                onClick={(e) => e.stopPropagation()}
              >
                Go to svarp.org
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeout(() => setShowVerificationWarning(false), 100);
                }}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 py-3 rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Certificate Modal */}
      {showCertificate && courseContent?.certificate_pdf_url && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-accent">Your Course Certificate</h2>
            <div className="flex items-center gap-4">
              <a
                href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                download="Certificate.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-opacity-95 transition whitespace-nowrap flex-shrink-0"
              >
                <Download size={14} /> Download PDF
              </a>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <CertificateModalPreview>
            <Certificate
              learnerName={user?.full_name || user?.username || "SVARP Learner"}
              courseName={courseContent.title}
              certificateId={courseContent.certificate_code || courseContent.certificate_id || `SV-${courseContent.id}-${user?.id || "PRO"}`}
              date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
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
