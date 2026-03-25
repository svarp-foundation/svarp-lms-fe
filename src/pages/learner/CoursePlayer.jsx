import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import API_URL from "../../config";
import { sanitizeHtml } from "../../lib/sanitize";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import Certificate from "../../components/Certificate";
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

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    try {
      const response = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(response.data);

      // Select first unlocked lesson if none active
      if (!activeLesson && response.data.modules.length > 0) {
        // Find first module with lessons
        for (const module of response.data.modules) {
          if (module.lessons.length > 0) {
            // Find first unlocked lesson (usually the first one)
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
  };

  const handleLessonComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);

    // Optimistic update — flip the button to "Completed" immediately
    setActiveLesson((prev) => ({ ...prev, completed: true }));

    try {
      await api.post(
        `/learner/courses/${courseId}/lessons/${activeLesson.id}/complete`,
        {},
      );

      // Refetch to sync sidebar progress + unlock next lesson
      const response = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(response.data);

      // Sync the activeLesson state with the freshly fetched data
      for (const module of response.data.modules) {
        const updated = module.lessons.find((l) => l.id === activeLesson.id);
        if (updated) {
          setActiveLesson(updated);
          break;
        }
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      // Roll back optimistic update on failure
      setActiveLesson((prev) => ({ ...prev, completed: false }));
    } finally {
      setCompleting(false);
    }
  };

  const getSecureVideoUrl = (url) => {
    if (!url) return "";
    const token = localStorage.getItem("token") || "";
    // Migrate legacy static URLs to the new secure media endpoint
    let secureUrl = url.replace("/static/uploads/", "/media/");

    // If the URL is relative (starts with /), prepend the API_URL
    // Make sure we don't accidentally prepend it if it's already an absolute URL (starts with http)
    if (secureUrl.startsWith("/")) {
      secureUrl = `${API_URL}${secureUrl}`;
    } else if (!secureUrl.startsWith("http")) {
      secureUrl = `${API_URL}/${secureUrl}`;
    }

    return `${secureUrl}${secureUrl.includes("?") ? "&" : "?"}token=${token}`;
  };

  if (loading) return <div className="p-8">Loading course content...</div>;
  if (!courseContent)
    return <div className="p-8">Course not found or access denied.</div>;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r p-4 hidden md:flex flex-col overflow-y-auto max-h-screen">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Dashboard
        </button>
        <h3 className="text-accent font-bold text-lg mb-4">
          {courseContent.title}
        </h3>
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${courseContent.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {courseContent.progress}% Completed
          </p>
          {courseContent.certificate_pdf_url ? (
            <div className="mt-4 pt-4 border-t flex flex-col gap-2">
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2"
              >
                <Award size={16} />
                View Certificate
              </button>
            </div>
          ) : (
            courseContent.progress === 100 &&
            courseContent.require_final_assignment && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 italic">
                  Certificate will be available after final assignment approval.
                </p>
              </div>
            )
          )}
        </div>

        <div className="space-y-4">
          {courseContent.modules.map((module) => (
            <div key={module.id}>
              <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2 px-2">
                {module.title}
              </h4>
              <ul className="space-y-1">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`
                        p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors
                        ${activeLesson?.id === lesson.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100"}
                        ${lesson.locked ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""}
                    `}
                  >
                    {lesson.completed ? (
                      <CheckCircle
                        size={18}
                        className="text-green-500 shrink-0"
                      />
                    ) : lesson.locked ? (
                      <Lock size={18} className="text-gray-400 shrink-0" />
                    ) : lesson.lesson_type === "video" ? (
                      <PlayCircle
                        size={18}
                        className="text-gray-500 shrink-0"
                      />
                    ) : lesson.lesson_type === "assignment" ? (
                      <ClipboardList
                        size={18}
                        className="text-purple-500 shrink-0"
                      />
                    ) : (
                      <FileText size={18} className="text-gray-500 shrink-0" />
                    )}

                    <span className="text-sm truncate">{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Final Assignment Section */}
          {courseContent.require_final_assignment &&
            courseContent.final_assignment && (
              <div className="pt-4 border-t mt-4">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2 px-2">
                  Final Completion
                </h4>
                <div
                  onClick={() => {
                    if (courseContent.progress === 100) {
                      setActiveLesson({
                        ...courseContent.final_assignment,
                        lesson_type: "assignment",
                        isFinal: true,
                      });
                    }
                  }}
                  className={`
                    p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors
                    ${activeLesson?.isFinal ? "bg-purple-100 text-purple-700 font-medium" : "hover:bg-gray-100 text-gray-700"}
                    ${courseContent.progress < 100 ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""}
                  `}
                >
                  <Award size={18} className="text-purple-600 shrink-0" />
                  <span className="text-sm font-semibold">
                    Final Assignment
                  </span>
                  {courseContent.progress < 100 && (
                    <Lock size={14} className="text-gray-400 ml-auto" />
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-accent text-3xl font-bold mb-6">
              {activeLesson.title}
            </h1>

            {activeLesson.lesson_type === "video" && activeLesson.video_url && (
              <div className="aspect-video bg-black rounded-xl mb-8 overflow-hidden">
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
              <>
                <div className="prose max-w-none mb-8">
                  {activeLesson.content ? (
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(activeLesson.content),
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">
                      No text content for this lesson.
                    </p>
                  )}
                </div>

                <div className="border-t pt-8 flex justify-end">
                  {!activeLesson.completed ? (
                    <button
                      onClick={handleLessonComplete}
                      disabled={completing}
                      className={
                        completing
                          ? "bg-green-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 opacity-80 cursor-not-allowed"
                          : "bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2 transition-all"
                      }
                    >
                      {completing ? (
                        <>
                          <CheckCircle size={20} className="animate-bounce" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Mark as Complete <CheckCircle size={20} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all">
                      <CheckCircle size={20} className="text-green-600" />
                      Lesson Completed!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a lesson to start learning
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && courseContent?.certificate_pdf_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 md:p-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Your Course Certificate</h2>
              <div className="flex items-center gap-4">
                <a
                  href={`${getSecureVideoUrl(courseContent.certificate_pdf_url)}&download=true`}
                  download="Certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-opacity-90 transition flex items-center gap-2"
                >
                  <Download size={18} /> Download PDF
                </a>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="text-gray-500 hover:text-gray-800 focus:outline-none flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-12">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-inner overflow-hidden border border-gray-100">
                <Certificate
                  learnerName={
                    user?.full_name || user?.username || "SVARP Learner"
                  }
                  courseName={courseContent.title}
                  certificateId={
                    courseContent.certificate_id ||
                    `SV-${courseContent.id}-${user?.id || "PRO"}`
                  }
                  date={new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  isHonour={courseContent.progress >= 75}
                  qrImageUrl={getSecureVideoUrl(
                    courseContent.certificate_pdf_url.replace(".pdf", ".png"),
                  )}
                  profilePictureUrl={courseContent.profile_picture_url}
                />
              </div>

              {/* Manual PDF Iframe (Bottom Optional) */}
              <div className="mt-12 opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-center text-xs text-gray-400 mb-4 tracking-widest uppercase">
                  Official PDF Verification Document Below
                </p>
                <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden grayscale opacity-50">
                  <iframe
                    src={getSecureVideoUrl(courseContent.certificate_pdf_url)}
                    className="w-full h-full border-0"
                    title="Certificate PDF Backup"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
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
              className={`p-4 rounded-lg flex items-center gap-3 ${
                result.mcq_score === result.mcq_total
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
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
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
              Your written answers have been submitted and are pending
              instructor review.
            </div>
          )}
          <div className="space-y-4 mt-4">
            {result.answers.map((ans, i) => (
              <div
                key={ans.question_id}
                className="border border-gray-100 rounded-lg p-4"
              >
                <p className="font-medium text-gray-800 mb-2">
                  {i + 1}. {ans.question_text}
                </p>
                {ans.question_type === "mcq" ? (
                  <div className="flex items-center gap-2">
                    {ans.is_correct ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {ans.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    {ans.answer_text || "(no answer)"}
                  </p>
                )}
              </div>
            ))}
          </div>
          {result.status !== "approved" && result.has_subjective && (
            <p className="text-xs text-gray-400 mt-2">
              Status: {result.status.replace(/_/g, " ")}
            </p>
          )}
        </div>
      ) : (
        // Show questions form
        <form onSubmit={handleSubmit} className="space-y-6">
          {(assignment.questions || []).map((q, idx) => (
            <div key={q.id} className="border border-gray-100 rounded-lg p-4">
              <p className="font-medium text-gray-800 mb-3">
                {idx + 1}. {q.question_text}
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    q.question_type === "mcq"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
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
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        answers[q.id]?.selected_option_id === opt.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.id}
                        checked={answers[q.id]?.selected_option_id === opt.id}
                        onChange={() => handleOptionSelect(q.id, opt.id)}
                        className="text-primary"
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
                  className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                />
              )}
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
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
