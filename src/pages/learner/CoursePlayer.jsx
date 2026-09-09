import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CertificateModalPreview from "../../components/CertificateModalPreview";
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
import { CheckCircle2 } from "lucide-react";

const CoursePlayer = () => {
  const { courseId } = useParams();

  const [courseContent, setCourseContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchCourseContent = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/learner/courses/${courseId}/content`);
      setCourseContent(res.data);

      // Extract completed lesson ids from response if available
      const completed = res.data.completed_lessons || res.data.progress?.completed_lessons || [];
      setCompletedLessonIds(completed);

      // Pick first lesson if none active
      setActiveLesson((current) => {
        if (current) return current;
        for (const mod of res.data.modules || []) {
          if (mod.lessons && mod.lessons.length > 0) {
            return mod.lessons[0];
          }
        }
        return null;
      });
    } catch (err) {
      console.error("Error fetching course content:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseContent();
  }, [fetchCourseContent]);

  const handleMarkComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/learner/courses/${courseId}/lessons/${activeLesson.id}/complete`, {});
      if (!completedLessonIds.includes(activeLesson.id)) {
        setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
      }
      fetchCourseContent();
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
      fetchCourseContent();
    } catch (err) {
      console.error("Error submitting assignment:", err);
      alert(err.response?.data?.detail || "Failed to submit assignment.");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // Calculate total lessons and progress
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
          onClaimCertificate={() => setShowCertificateModal(true)}
          sidebarOpen={mobileSidebarOpen}
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Player Workspace: Left Content + Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            {activeLesson ? (
              <>
                {/* Lesson Header Title */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Lesson
                    </span>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
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

                {/* Lesson Discussion Comments */}
                <div className="pt-4">
                  <LessonComments lessonId={activeLesson.id} />
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select a lesson from the curriculum sidebar to begin learning.
              </div>
            )}
          </main>

          {/* Curriculum Navigation Sidebar */}
          <PlayerSidebar
            modules={courseContent?.modules || []}
            activeLessonId={activeLesson?.id}
            completedLessonIds={completedLessonIds}
            onSelectLesson={(lesson) => setActiveLesson(lesson)}
            open={mobileSidebarOpen}
            setOpen={setMobileSidebarOpen}
          />
        </div>
      </div>

      {/* Certificate Modal Preview */}
      {showCertificateModal && (
        <CertificateModalPreview
          courseId={courseId}
          courseTitle={courseContent?.title}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </LearnerLayout>
  );
};

export default CoursePlayer;
