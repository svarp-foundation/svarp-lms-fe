import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import { downloadCertificatePdf } from "../../utils/certificate";
import { CoursePlayerSkeleton } from "../../components/Skeletons";
import {
  PlayerHeader,
  PlayerSidebar,
  VideoPlayer,
  TextContent,
  QuizRunner,
  AssignmentRunner,
  LessonComments,
} from "../../components/player";
import { Button } from "../../components/common";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

const CoursePlayer = () => {
  const { courseId } = useParams();

  const [courseContent, setCourseContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const mainContentRef = React.useRef(null);

  const fetchCourseContent = React.useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(res.data);

      // Extract all completed lesson ids from modules
      const completed = [];
      const allLessonsList = [];
      (res.data.modules || []).forEach((mod) => {
        (mod.lessons || []).forEach((les) => {
          allLessonsList.push(les);
          if (les.completed) {
            completed.push(les.id);
          }
        });
      });
      setCompletedLessonIds(completed);

      // Pick active lesson: preserve existing or choose first uncompleted / first lesson
      setActiveLesson((current) => {
        if (current) {
          const matched = allLessonsList.find((l) => l.id === current.id);
          return matched || current;
        }
        const firstUncompleted = allLessonsList.find((l) => !l.completed);
        return firstUncompleted || allLessonsList[0] || null;
      });
    } catch (err) {
      console.error("Error fetching course content:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseContent(false);
  }, [fetchCourseContent]);

  // Smooth scroll to top when changing lessons
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeLesson?.id]);

  const handleMarkComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);

    // Find next lesson from full lesson sequence
    const allLessonsList = [];
    (courseContent?.modules || []).forEach((m) => {
      (m.lessons || []).forEach((l) => allLessonsList.push(l));
    });

    const currentIndex = allLessonsList.findIndex((l) => l.id === activeLesson.id);
    const nextLesson =
      currentIndex !== -1 && currentIndex + 1 < allLessonsList.length
        ? allLessonsList[currentIndex + 1]
        : null;

    try {
      await api.post(`/learner/courses/${courseId}/lessons/${activeLesson.id}/complete`, {});
      
      // Update local completed state immediately for snappy UI
      setCompletedLessonIds((prev) => {
        if (!prev.includes(activeLesson.id)) {
          return [...prev, activeLesson.id];
        }
        return prev;
      });

      // Automatically advance to the next lesson if available
      if (nextLesson) {
        setActiveLesson(nextLesson);
      }

      // Silently refresh server content & progress without flashing skeleton
      await fetchCourseContent(true);
    } catch (err) {
      console.error("Error completing lesson:", err);
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitAssignment = async ({ textResponse, file }) => {
    if (!activeLesson) return;
    setSubmittingAssignment(true);
    try {
      const formData = new FormData();
      if (textResponse) formData.append("text_response", textResponse);
      if (file) formData.append("file", file);

      await api.post(
        `/learner/courses/${courseId}/lessons/${activeLesson.id}/submit`,
        formData
      );
      alert("Assignment submitted successfully for instructor evaluation.");
      await fetchCourseContent(true);
    } catch (err) {
      console.error("Error submitting assignment:", err);
      alert(err.response?.data?.detail || "Failed to submit assignment.");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (downloadingCert) return;
    setDownloadingCert(true);
    try {
      // Claim/ensure certificate record exists
      const res = await api.post(`/learner/courses/${courseId}/claim-certificate`);
      const certData = res.data;
      const pdfUrl = certData.pdf_url || `/media/${certData.certificate_code}.pdf`;
      await downloadCertificatePdf(pdfUrl, certData.certificate_code);
    } catch (err) {
      console.error("Error claiming or downloading certificate:", err);
      alert(
        err.response?.data?.detail ||
          "Unable to download certificate. Please make sure all course requirements are completed."
      );
    } finally {
      setDownloadingCert(false);
    }
  };

  // Calculate total lessons, progress, and previous/next navigation
  const allLessons = [];
  (courseContent?.modules || []).forEach((m) => {
    (m.lessons || []).forEach((l) => allLessons.push(l));
  });

  const totalLessonsCount = allLessons.length;
  const progressPct =
    totalLessonsCount > 0
      ? (completedLessonIds.length / totalLessonsCount) * 100
      : 0;

  const isCurrentCompleted = activeLesson && completedLessonIds.includes(activeLesson.id);

  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex !== -1 && currentLessonIndex + 1 < allLessons.length
      ? allLessons[currentLessonIndex + 1]
      : null;

  if (loading) {
    return (
      <LearnerLayout isPlayerPage>
        <CoursePlayerSkeleton />
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout isPlayerPage>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Top Header */}
        <PlayerHeader
          courseTitle={courseContent?.title || "Course"}
          progressPercentage={progressPct}
          courseId={courseId}
          isCertified={courseContent?.certificate_issued}
          onDownloadCertificate={handleDownloadCertificate}
          downloadingCertificate={downloadingCert}
        />

        {/* Player Workspace: Left Content + Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            {activeLesson ? (
              <>
                {/* Lesson Header Title */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Lesson
                    </span>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 break-words">
                      {activeLesson.title}
                    </h1>
                  </div>

                  {!isCurrentCompleted && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleMarkComplete}
                      loading={completing}
                      icon={CheckCircle2}
                      className="whitespace-nowrap flex-shrink-0"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>

                {/* Video Lesson Type */}
                {activeLesson.lesson_type === "video" && (
                  <div className="space-y-6">
                    <VideoPlayer
                      videoUrl={activeLesson.video_url}
                      title={activeLesson.title}
                    />

                    {activeLesson.content && (
                      <TextContent content={activeLesson.content} />
                    )}
                  </div>
                )}

                {/* Text Reading Lesson Type */}
                {activeLesson.lesson_type === "text" && (
                  <TextContent content={activeLesson.content} />
                )}

                {/* Quiz Assessment Lesson Type */}
                {activeLesson.lesson_type === "quiz" && (
                  <QuizRunner
                    questions={activeLesson.questions || []}
                    passingScore={courseContent?.passing_score ?? 70}
                    onCompleteQuiz={({ passed }) => {
                      if (passed) handleMarkComplete();
                    }}
                  />
                )}

                {/* Assignment Assessment Lesson Type */}
                {activeLesson.lesson_type === "assignment" && (
                  <AssignmentRunner
                    lesson={activeLesson}
                    submission={activeLesson.submission}
                    onSubmitAssignment={handleSubmitAssignment}
                    submitting={submittingAssignment}
                  />
                )}

                {/* Previous / Next Lesson Navigation Footer */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setActiveLesson(prevLesson)}
                    icon={ArrowLeft}
                  >
                    Previous
                  </Button>

                  <Button
                    type="button"
                    variant={nextLesson ? "primary" : "outline"}
                    size="xs"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setActiveLesson(nextLesson)}
                    icon={ArrowRight}
                  >
                    Next Lesson
                  </Button>
                </div>

                {/* Lesson Discussion Comments */}
                <div className="pt-2">
                  <LessonComments lessonId={activeLesson.id} />
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select a lesson to begin learning.
              </div>
            )}
          </main>

          {/* Desktop-Only Curriculum Navigation Sidebar */}
          <PlayerSidebar
            modules={courseContent?.modules || []}
            activeLessonId={activeLesson?.id}
            completedLessonIds={completedLessonIds}
            onSelectLesson={(lesson) => setActiveLesson(lesson)}
          />
        </div>
      </div>
    </LearnerLayout>
  );
};

export default CoursePlayer;


