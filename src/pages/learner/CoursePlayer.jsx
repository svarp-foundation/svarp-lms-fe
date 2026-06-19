import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import API_URL from "../../config";
import { sanitizeHtml } from "../../lib/sanitize";
import { useAuth } from "../../context/AuthContext";
import Certificate from "../../components/Certificate";
import LearnerLayout from "../../components/LearnerLayout";
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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

      // Find the next lesson automatically
      let foundActive = false;
      let nextLesson = null;

      for (const m of response.data.modules) {
        for (const l of m.lessons) {
          if (foundActive && !l.locked) {
            nextLesson = l;
            break;
          }
          if (l.id === activeLesson.id) {
            foundActive = true;
          }
        }
        if (nextLesson) break;
      }

      if (nextLesson) {
        setActiveLesson(nextLesson);
      } else {
        // Fallback: Just sync current lesson status if no next found
        for (const module of response.data.modules) {
          const updated = module.lessons.find((l) => l.id === activeLesson.id);
          if (updated) {
            setActiveLesson(updated);
            break;
          }
        }
      }
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
        <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-white items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
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
            {courseContent.certificate_pdf_url ? (
              <div className="mt-4">
                <button
                  onClick={() => setShowCertificate(true)}
                  className="w-full bg-accent hover:bg-opacity-90 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Award size={16} />
                  View Certificate
                </button>
              </div>
            ) : (
              courseContent.progress === 100 &&
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
                onComplete={fetchCourseContent}
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
                  <div className="w-full sm:w-auto justify-center bg-green-50/60 backdrop-blur-sm text-green-700 px-8 py-4 rounded-2xl font-extrabold flex items-center gap-3 border border-green-100/80 shadow-sm shadow-green-600/5">
                    <CheckCircle size={22} className="text-green-600" />
                    <span className="tracking-wide">Lesson Completed!</span>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center bg-white">
            <PlayCircle size={64} className="mb-4 opacity-10" />
            <h3 className="text-lg font-bold text-gray-300">Select a lesson to start learning</h3>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && courseContent?.certificate_pdf_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-accent">Your Course Certificate</h2>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-12">
              <div className="max-w-4xl mx-auto">
                <Certificate
                  learnerName={user?.full_name || user?.username || "SVARP Learner"}
                  courseName={courseContent.title}
                  certificateId={courseContent.certificate_id || `SV-${courseContent.id}-${user?.id || "PRO"}`}
                  date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  isHonour={courseContent.progress >= 75}
                  qrImageUrl={getSecureVideoUrl(courseContent.certificate_pdf_url.replace(".pdf", ".png"))}
                  profilePictureUrl={courseContent.profile_picture_url}
                />
                
                <div className="mt-12 text-center">
                   <a
                    href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                    download="Certificate.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:bg-primary hover:text-accent transition-luxury"
                  >
                    <Download size={20} /> Download Official PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </LearnerLayout>
  );
};

export default CoursePlayer;

// ─── Assignment Player Component ────────────────────────────────────────────

const AssignmentPlayer = ({
  lesson,
  initialAssignment,
  courseId,
  onComplete,
}) => {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [answers, setAnswers] = useState({}); // { question_id: { answer_text, selected_option_id } }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignment();
  }, [lesson?.id, initialAssignment?.id]);

  const fetchAssignment = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      if (lesson) {
        // Find assignment linked to this lesson
        const res = await api.get(
          `/learner/assignments/by-lesson/${lesson.id}`,
        );
        setAssignment(res.data);
      } else if (initialAssignment) {
        setAssignment(initialAssignment);
      }
      const currentAsgn = initialAssignment || assignment;
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
          {result.status !== "approved" && result.has_subjective && (
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Status: {result.status.replace(/_/g, " ")}
            </p>
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
    </div>
  );
};
