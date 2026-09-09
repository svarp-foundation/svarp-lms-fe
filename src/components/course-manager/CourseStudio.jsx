import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { PageHeader, FilterTabs, ConfirmModal } from "../common";
import CourseList from "./CourseList";
import CourseInfoForm from "./CourseInfoForm";
import CurriculumEditor from "./CurriculumEditor";
import ModuleModal from "./ModuleModal";
import LessonModal from "./LessonModal";
import CourseTextImporterModal from "./CourseTextImporterModal";
import { CourseGridSkeleton } from "../Skeletons";

export const CourseStudio = ({
  apiPrefix = "/instructor", // "/instructor" or "/admin"
  title = "Course Studio",
  subtitle = "Author, organize, and publish educational courses",
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("curriculum"); // "curriculum" | "info"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [savingModule, setSavingModule] = useState(false);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    lesson_type: "video",
    content: "",
    video_url: "",
    assignment_title: "",
    assignment_description: "",
    due_date: "",
    questions: [],
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [showImporterModal, setShowImporterModal] = useState(false);
  const [importingText, setImportingText] = useState(false);

  // Delete Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });

  // Course Form
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    status: "draft",
    passing_score: 70,
    require_all_lessons_completed: true,
    require_assignment_approval: false,
    require_final_assignment: false,
    is_paid: false,
    price: 0,
  });
  const [savingCourse, setSavingCourse] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${apiPrefix}/courses`);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [apiPrefix]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const fetchCourseDetail = async (courseId) => {
    try {
      const res = await api.get(`${apiPrefix}/courses/${courseId}`);
      setSelectedCourse(res.data);
      setCourseForm({
        title: res.data.title || "",
        description: res.data.description || "",
        thumbnail_url: res.data.thumbnail_url || "",
        status: res.data.status || "draft",
        passing_score: res.data.passing_score ?? 70,
        require_all_lessons_completed: res.data.require_all_lessons_completed ?? true,
        require_assignment_approval: res.data.require_assignment_approval ?? false,
        require_final_assignment: res.data.require_final_assignment ?? false,
        is_paid: res.data.is_paid ?? false,
        price: res.data.price ?? 0,
      });
    } catch (err) {
      console.error("Error fetching course detail:", err);
    }
  };

  const handleCreateCourseClick = () => {
    setSelectedCourse({}); // empty object indicates new course mode
    setCourseForm({
      title: "",
      description: "",
      thumbnail_url: "",
      status: "draft",
      passing_score: 70,
      require_all_lessons_completed: true,
      require_assignment_approval: false,
      require_final_assignment: false,
      is_paid: false,
      price: 0,
    });
    setActiveTab("info");
  };

  const handleEditCourseClick = (course) => {
    fetchCourseDetail(course.id);
    setActiveTab("curriculum");
  };

  const handleBackToList = () => {
    setSelectedCourse(null);
    fetchCourses();
  };

  // Thumbnail upload
  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`${apiPrefix}/upload`, formData);
      setCourseForm((prev) => ({
        ...prev,
        thumbnail_url: res.data.url,
      }));
    } catch (err) {
      console.error("Error uploading thumbnail:", err);
      alert(err.response?.data?.detail || "Failed to upload image.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Video upload
  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`${apiPrefix}/upload`, formData);
      setLessonForm((prev) => ({
        ...prev,
        video_url: res.data.url,
      }));
    } catch (err) {
      console.error("Error uploading video:", err);
      alert(err.response?.data?.detail || "Failed to upload video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Course Form Submit
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      if (selectedCourse?.id) {
        // Update
        const res = await api.put(
          `${apiPrefix}/courses/${selectedCourse.id}`,
          courseForm
        );
        setSelectedCourse((prev) => ({ ...prev, ...res.data }));
        alert("Course details updated successfully.");
      } else {
        // Create
        const res = await api.post(`${apiPrefix}/courses`, courseForm);
        setSelectedCourse(res.data);
        setActiveTab("curriculum");
      }
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      alert(err.response?.data?.detail || "Failed to save course.");
    } finally {
      setSavingCourse(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = (courseId) => {
    setConfirmModalState({
      isOpen: true,
      title: "Delete Course",
      message:
        "Are you sure you want to delete this course? All associated modules, lessons, and assignments will be permanently removed.",
      loading: false,
      onConfirm: async () => {
        setConfirmModalState((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`${apiPrefix}/courses/${courseId}`);
          setConfirmModalState({ isOpen: false, onConfirm: null, loading: false });
          if (selectedCourse?.id === courseId) {
            setSelectedCourse(null);
          }
          fetchCourses();
        } catch (err) {
          console.error("Error deleting course:", err);
          alert(err.response?.data?.detail || "Failed to delete course.");
          setConfirmModalState((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  };

  // Module actions
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title || "", description: mod.description || "" });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    setSavingModule(true);
    try {
      if (editingModule) {
        await api.put(
          `${apiPrefix}/courses/${selectedCourse.id}/modules/${editingModule.id}`,
          moduleForm
        );
      } else {
        await api.post(
          `${apiPrefix}/courses/${selectedCourse.id}/modules`,
          moduleForm
        );
      }
      setShowModuleModal(false);
      fetchCourseDetail(selectedCourse.id);
    } catch (err) {
      console.error("Error saving module:", err);
      alert(err.response?.data?.detail || "Failed to save module.");
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = (moduleId) => {
    setConfirmModalState({
      isOpen: true,
      title: "Delete Module",
      message:
        "Are you sure you want to delete this module and all of its lessons?",
      loading: false,
      onConfirm: async () => {
        setConfirmModalState((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(
            `${apiPrefix}/courses/${selectedCourse.id}/modules/${moduleId}`
          );
          setConfirmModalState({ isOpen: false, onConfirm: null, loading: false });
          fetchCourseDetail(selectedCourse.id);
        } catch (err) {
          console.error("Error deleting module:", err);
          alert(err.response?.data?.detail || "Failed to delete module.");
          setConfirmModalState((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  };

  // Lesson actions
  const handleOpenAddLesson = (moduleId) => {
    setActiveModuleId(moduleId);
    setEditingLesson(null);
    setLessonForm({
      title: "",
      lesson_type: "video",
      content: "",
      video_url: "",
      assignment_title: "",
      assignment_description: "",
      due_date: "",
      questions: [],
    });
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (moduleId, lesson) => {
    setActiveModuleId(moduleId);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || "",
      lesson_type: lesson.lesson_type || "video",
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      assignment_title: lesson.assignment_title || "",
      assignment_description: lesson.assignment_description || "",
      due_date: lesson.due_date || "",
      questions: lesson.questions || [],
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      if (editingLesson) {
        await api.put(
          `${apiPrefix}/courses/${selectedCourse.id}/modules/${activeModuleId}/lessons/${editingLesson.id}`,
          lessonForm
        );
      } else {
        await api.post(
          `${apiPrefix}/courses/${selectedCourse.id}/modules/${activeModuleId}/lessons`,
          lessonForm
        );
      }
      setShowLessonModal(false);
      fetchCourseDetail(selectedCourse.id);
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert(err.response?.data?.detail || "Failed to save lesson.");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = (moduleId, lessonId) => {
    setConfirmModalState({
      isOpen: true,
      title: "Delete Lesson",
      message: "Are you sure you want to delete this lesson?",
      loading: false,
      onConfirm: async () => {
        setConfirmModalState((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(
            `${apiPrefix}/courses/${selectedCourse.id}/modules/${moduleId}/lessons/${lessonId}`
          );
          setConfirmModalState({ isOpen: false, onConfirm: null, loading: false });
          fetchCourseDetail(selectedCourse.id);
        } catch (err) {
          console.error("Error deleting lesson:", err);
          alert(err.response?.data?.detail || "Failed to delete lesson.");
          setConfirmModalState((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  };

  // Bulk Text Importer
  const handleBulkImport = async (text) => {
    setImportingText(true);
    try {
      const res = await api.post(`${apiPrefix}/courses/import-bundle`, {
        bundle_text: text,
      });
      alert(`Course "${res.data.title}" successfully created from bundle.`);
      setShowImporterModal(false);
      fetchCourses();
      fetchCourseDetail(res.data.id);
    } catch (err) {
      console.error("Error importing course bundle:", err);
      alert(err.response?.data?.detail || "Failed to parse course text bundle.");
    } finally {
      setImportingText(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View 1: Course List Overview */}
      {!selectedCourse ? (
        <>
          <PageHeader title={title} subtitle={subtitle} />

          {loading ? (
            <CourseGridSkeleton />
          ) : (
            <CourseList
              courses={courses}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onCreateCourse={handleCreateCourseClick}
              onEditCourse={handleEditCourseClick}
              onDeleteCourse={handleDeleteCourse}
              onOpenImporter={() => setShowImporterModal(true)}
            />
          )}
        </>
      ) : (
        /* View 2: Course Editor & Curriculum Studio */
        <>
          <PageHeader
            title={
              selectedCourse.id
                ? selectedCourse.title || "Edit Course"
                : "Create New Course"
            }
            subtitle={
              selectedCourse.id
                ? `Course ID: #${selectedCourse.id} · Status: ${selectedCourse.status || "draft"}`
                : "Enter course details to initialize curriculum"
            }
            onBack={handleBackToList}
            backLabel="Back to Courses"
            actions={
              selectedCourse.id && (
                <FilterTabs
                  tabs={[
                    { id: "curriculum", label: "Curriculum & Lessons" },
                    { id: "info", label: "Course Details & Pricing" },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              )
            }
          />

          {activeTab === "info" || !selectedCourse.id ? (
            <CourseInfoForm
              formData={courseForm}
              onChange={(e) =>
                setCourseForm({ ...courseForm, [e.target.name]: e.target.value })
              }
              onThumbnailUpload={handleThumbnailUpload}
              uploadingThumbnail={uploadingThumbnail}
              onSubmit={handleCourseSubmit}
              saving={savingCourse}
              isEditing={!!selectedCourse.id}
            />
          ) : (
            <CurriculumEditor
              modules={selectedCourse.modules || []}
              onAddModule={handleOpenAddModule}
              onEditModule={handleOpenEditModule}
              onDeleteModule={handleDeleteModule}
              onAddLesson={handleOpenAddLesson}
              onEditLesson={handleOpenEditLesson}
              onDeleteLesson={handleDeleteLesson}
              onOpenImporter={() => setShowImporterModal(true)}
            />
          )}
        </>
      )}

      {/* Module Create/Edit Modal */}
      <ModuleModal
        isOpen={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        moduleForm={moduleForm}
        onChange={(e) =>
          setModuleForm({ ...moduleForm, [e.target.name]: e.target.value })
        }
        onSubmit={handleSaveModule}
        isEditing={!!editingModule}
        saving={savingModule}
      />

      {/* Lesson Create/Edit Modal */}
      <LessonModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        lessonForm={lessonForm}
        onChange={(e) =>
          setLessonForm({ ...lessonForm, [e.target.name]: e.target.value })
        }
        onQuestionsChange={(questions) =>
          setLessonForm({ ...lessonForm, questions })
        }
        onVideoUpload={handleVideoUpload}
        uploadingVideo={uploadingVideo}
        onSubmit={handleSaveLesson}
        isEditing={!!editingLesson}
        saving={savingLesson}
      />

      {/* Bulk Course Text Importer Modal */}
      <CourseTextImporterModal
        isOpen={showImporterModal}
        onClose={() => setShowImporterModal(false)}
        onImport={handleBulkImport}
        importing={importingText}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        loading={confirmModalState.loading}
        onClose={() =>
          setConfirmModalState({ isOpen: false, onConfirm: null, loading: false })
        }
        onConfirm={confirmModalState.onConfirm}
      />
    </div>
  );
};

export default CourseStudio;
