import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import InstructorLayout from "../../components/InstructorLayout";
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  Video as VideoIcon,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Pencil,
  BookOpen,
  LayoutGrid,
  Search,
  CheckCircle,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  HelpCircle,
  X,
  Check,
} from "lucide-react";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { getMediaUrl } from "../../config";

const InstructorCourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [uploading, setUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Module / Lesson Editor Modals
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonModuleId, setLessonModuleId] = useState(null);
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

  // Main Course Form State
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/instructor/courses");
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async (courseId) => {
    try {
      const response = await api.get(`/instructor/courses/${courseId}`);
      setSelectedCourse(response.data);
      setCourseForm({
        title: response.data.title || "",
        description: response.data.description || "",
        thumbnail_url: response.data.thumbnail_url || "",
        status: response.data.status || "draft",
        passing_score: response.data.passing_score ?? 70,
        require_all_lessons_completed: response.data.require_all_lessons_completed ?? true,
        require_assignment_approval: response.data.require_assignment_approval ?? false,
        require_final_assignment: response.data.require_final_assignment ?? false,
        is_paid: response.data.is_paid ?? false,
        price: response.data.price ?? 0,
      });
    } catch (error) {
      console.error("Error fetching course detail:", error);
    }
  };

  const handleCreateClick = () => {
    setSelectedCourse({});
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

  const handleEditClick = (course) => {
    fetchCourseDetail(course.id);
    setActiveTab("info");
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await api.delete(`/instructor/courses/${courseId}`);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(error.response?.data?.detail || "Failed to delete course");
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setThumbnailUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("/instructor/upload", formData);
      setCourseForm((prev) => ({
        ...prev,
        thumbnail_url: uploadRes.data.url,
      }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert(error.response?.data?.detail || "Failed to upload thumbnail image.");
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (selectedCourse && selectedCourse.id) {
        response = await api.put(`/instructor/courses/${selectedCourse.id}`, courseForm);
      } else {
        response = await api.post("/instructor/courses", courseForm);
      }
      fetchCourses();
      setSelectedCourse(response.data);
      alert("Course saved successfully!");
    } catch (error) {
      console.error("Error saving course:", error);
      alert(error.response?.data?.detail || "Failed to save course");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt file formatted course bundle.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/instructor/courses/import-bundle", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "Course imported successfully!");
      fetchCourses();
    } catch (error) {
      console.error("Error importing course bundle:", error);
      alert(error.response?.data?.detail || "Failed to import course bundle");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleInjectFileForCourse = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt course bundle file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/instructor/courses/${courseId}/update-from-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "Course curriculum updated from file successfully!");
      fetchCourses();
      if (selectedCourse?.id === courseId) {
        fetchCourseDetail(courseId);
      }
    } catch (error) {
      console.error("Error injecting course file:", error);
      alert(error.response?.data?.detail || "Failed to update course from file");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // ── Module Handlers ──
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description || "" });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) return;
    try {
      if (editingModule) {
        await api.put(`/instructor/modules/${editingModule.id}`, moduleForm);
      } else {
        await api.post(`/instructor/courses/${selectedCourse.id}/modules`, moduleForm);
      }
      setShowModuleModal(false);
      fetchCourseDetail(selectedCourse.id);
    } catch (err) {
      alert("Failed to save module");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    try {
      await api.delete(`/instructor/modules/${moduleId}`);
      fetchCourseDetail(selectedCourse.id);
    } catch (err) {
      alert("Failed to delete module");
    }
  };

  // ── Lesson Handlers ──
  const handleOpenAddLesson = (moduleId) => {
    setLessonModuleId(moduleId);
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

  const handleOpenEditLesson = (moduleId, les) => {
    setLessonModuleId(moduleId);
    setEditingLesson(les);

    const asgn = les.assignment;
    setLessonForm({
      title: les.title || "",
      lesson_type: les.lesson_type || "video",
      content: les.content || "",
      video_url: les.video_url || "",
      assignment_title: asgn?.title || "",
      assignment_description: asgn?.description || "",
      due_date: asgn?.due_date ? asgn.due_date.split("T")[0] : "",
      questions:
        asgn?.questions?.map((q) => ({
          question_text: q.question_text || "",
          question_type: q.question_type || "mcq",
          options: q.options?.map((opt) => ({
            text: opt.option_text || "",
            is_correct: opt.is_correct || false,
          })) || [],
        })) || [],
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;
    try {
      const payload = {
        title: lessonForm.title,
        lesson_type: lessonForm.lesson_type,
        content: lessonForm.content,
        video_url: lessonForm.video_url,
        assignment_title: lessonForm.assignment_title || undefined,
        assignment_description: lessonForm.assignment_description || undefined,
        due_date: lessonForm.due_date || undefined,
        questions: lessonForm.questions.length > 0 ? lessonForm.questions : undefined,
      };

      if (editingLesson) {
        await api.put(`/instructor/lessons/${editingLesson.id}`, payload);
      } else {
        await api.post(`/instructor/modules/${lessonModuleId}/lessons`, payload);
      }
      setShowLessonModal(false);
      fetchCourseDetail(selectedCourse.id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to save lesson");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await api.delete(`/instructor/lessons/${lessonId}`);
      fetchCourseDetail(selectedCourse.id);
    } catch (err) {
      alert("Failed to delete lesson");
    }
  };

  // Question manipulation in Lesson Modal
  const handleAddQuestion = () => {
    setLessonForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          question_type: "mcq",
          options: [
            { text: "Option A", is_correct: true },
            { text: "Option B", is_correct: false },
          ],
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index) => {
    setLessonForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleAddOption = (qIndex) => {
    setLessonForm((prev) => {
      const updatedQuestions = [...prev.questions];
      const currentOptions = updatedQuestions[qIndex].options || [];
      updatedQuestions[qIndex].options = [
        ...currentOptions,
        { text: `Option ${String.fromCharCode(65 + currentOptions.length)}`, is_correct: false },
      ];
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setLessonForm((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter(
        (_, i) => i !== optIndex
      );
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSetCorrectOption = (qIndex, optIndex) => {
    setLessonForm((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((opt, i) => ({
        ...opt,
        is_correct: i === optIndex,
      }));
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <InstructorLayout>
      <div className="space-y-4 font-sans">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">Instructor Studio</h1>
            <p className="text-xs text-slate-500">
              Create, curate, and publish high-impact courses and assessments.
            </p>
          </div>

          {!selectedCourse && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => document.getElementById("instructor-course-bulk-upload").click()}
                className={`bg-white border border-slate-200 text-slate-700 hover:border-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-xs shrink-0 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={uploading}
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : "Bulk Upload (.txt)"}
              </button>
              <input
                type="file"
                id="instructor-course-bulk-upload"
                className="hidden"
                accept=".txt"
                onChange={handleBulkUpload}
              />
              <button
                onClick={handleCreateClick}
                className="bg-primary hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Plus size={14} /> New Course
              </button>
            </div>
          )}
        </div>

        {selectedCourse ? (
          /* ── Course Editor Interface ── */
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-1.5">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "info"
                      ? "bg-white text-accent border border-slate-200 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <FileText size={14} /> Basic Info
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  disabled={!selectedCourse.id}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "curriculum"
                      ? "bg-white text-accent border border-slate-200 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  } ${!selectedCourse.id ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <LayoutGrid size={14} /> Curriculum
                </button>
                {selectedCourse.id && (
                  <>
                    <button
                      onClick={() =>
                        document.getElementById(`instructor-inject-file-${selectedCourse.id}`).click()
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-xs"
                      title="Inject new .txt file to update course details and curriculum"
                      disabled={uploading}
                    >
                      <Upload size={13} /> {uploading ? "Injecting..." : "Inject File to Update"}
                    </button>
                    <input
                      type="file"
                      id={`instructor-inject-file-${selectedCourse.id}`}
                      className="hidden"
                      accept=".txt"
                      onChange={(e) => handleInjectFileForCourse(selectedCourse.id, e)}
                    />
                  </>
                )}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="ml-auto px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === "info" ? (
                /* ── Info Tab ── */
                <form onSubmit={handleCourseSubmit} className="max-w-3xl mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
                        Course Title
                      </label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="e.g. Modern Full-Stack Development with Node & React"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
                        Course Description
                      </label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        placeholder="Provide an overview of the curriculum and learning outcomes..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
                        Course Thumbnail
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={courseForm.thumbnail_url}
                            onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                            placeholder="Image URL or upload below..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                          />
                          <label className="px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                            <Upload size={12} />
                            <span>{thumbnailUploading ? "Uploading..." : "Upload"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={thumbnailUploading}
                              onChange={handleThumbnailUpload}
                            />
                          </label>
                        </div>

                        {courseForm.thumbnail_url && (
                          <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                            <img
                              src={getMediaUrl(courseForm.thumbnail_url)}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setCourseForm({ ...courseForm, thumbnail_url: "" })}
                              className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
                              title="Remove Thumbnail"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
                        Publication Status
                      </label>
                      <select
                        value={courseForm.status}
                        onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-bold cursor-pointer"
                      >
                        <option value="draft">Draft (Private)</option>
                        <option value="published">Published (Public)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
                        Passing Score (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={courseForm.passing_score}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              passing_score: parseInt(e.target.value) || 70,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 outline-none focus:border-accent text-xs font-bold"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
                        Course Pricing
                      </label>
                      <div className="flex gap-3 items-center">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={courseForm.is_paid}
                            onChange={(e) => setCourseForm({ ...courseForm, is_paid: e.target.checked })}
                            className="rounded border-slate-300 text-accent focus:ring-accent"
                          />
                          Paid Course
                        </label>
                        {courseForm.is_paid && (
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={courseForm.price}
                              onChange={(e) =>
                                setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })
                              }
                              placeholder="Price in INR"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 outline-none focus:border-accent text-xs font-bold"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={courseForm.require_all_lessons_completed}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, require_all_lessons_completed: e.target.checked })
                        }
                        className="rounded border-slate-300 text-accent focus:ring-accent w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-700">Require All Lessons Completed</div>
                        <div className="text-[10px] text-slate-400">Students must view all lessons before certificate</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={courseForm.require_assignment_approval}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, require_assignment_approval: e.target.checked })
                        }
                        className="rounded border-slate-300 text-accent focus:ring-accent w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-700">Require Assignment Approval</div>
                        <div className="text-[10px] text-slate-400">Instructor review required for assignments</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    {selectedCourse.id ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(selectedCourse.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete Course
                      </button>
                    ) : <div />}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(null)}
                        className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-primary hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        Save Course
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* ── Curriculum Tab ── */
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-accent">Modules & Lessons</h3>
                      <p className="text-[11px] text-slate-400">Structure learning path and create assessments</p>
                    </div>
                    <button
                      onClick={handleOpenAddModule}
                      className="bg-primary hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus size={14} /> Add Module
                    </button>
                  </div>

                  {(!selectedCourse.modules || selectedCourse.modules.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <p>No modules created for this course yet.</p>
                      <button
                        onClick={handleOpenAddModule}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-accent font-bold rounded-lg text-xs hover:bg-slate-50"
                      >
                        <Plus size={13} /> Create First Module
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCourse.modules.map((mod, mIdx) => (
                        <div
                          key={mod.id}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
                        >
                          {/* Module Header */}
                          <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                M{mIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-accent truncate">{mod.title}</h4>
                                {mod.description && (
                                  <p className="text-[10px] text-slate-400 truncate">{mod.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenAddLesson(mod.id)}
                                className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                              >
                                <Plus size={12} /> Add Lesson
                              </button>
                              <button
                                onClick={() => handleOpenEditModule(mod)}
                                className="p-1 rounded text-slate-400 hover:text-accent hover:bg-slate-100 transition"
                                title="Edit Module"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(mod.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
                                title="Delete Module"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Lessons inside Module */}
                          <div className="p-2 space-y-1.5">
                            {(!mod.lessons || mod.lessons.length === 0) ? (
                              <div className="py-3 text-center text-[11px] text-slate-400 italic">
                                No lessons in this module. Click "+ Add Lesson" above.
                              </div>
                            ) : (
                              mod.lessons.map((les, lIdx) => (
                                <div
                                  key={les.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 hover:bg-slate-50 border border-slate-100 transition text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-[10px] font-bold text-slate-400 w-5">
                                      {lIdx + 1}.
                                    </span>
                                    {les.lesson_type === "video" ? (
                                      <VideoIcon size={14} className="text-blue-500 flex-shrink-0" />
                                    ) : les.lesson_type === "quiz" ? (
                                      <HelpCircle size={14} className="text-purple-500 flex-shrink-0" />
                                    ) : (
                                      <FileText size={14} className="text-emerald-500 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-700 truncate block">
                                        {les.title}
                                      </span>
                                      {les.assignment && (
                                        <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
                                          <ClipboardList size={10} /> {les.assignment.title}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mr-1">
                                      {les.lesson_type}
                                    </span>
                                    <button
                                      onClick={() => handleOpenEditLesson(mod.id, les)}
                                      className="p-1 rounded text-slate-400 hover:text-accent hover:bg-slate-100 transition"
                                      title="Edit Lesson"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLesson(les.id)}
                                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
                                      title="Delete Lesson"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Course Grid View ── */
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search authored courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                />
              </div>
              <div className="text-xs font-bold text-slate-500 px-2 shrink-0">
                {filteredCourses.length} {filteredCourses.length === 1 ? "Course" : "Courses"}
              </div>
            </div>

            {loading ? (
              <CourseGridSkeleton count={6} />
            ) : filteredCourses.length === 0 ? (
              <div className="text-center text-xs text-slate-400 italic py-16 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <BookOpen className="mx-auto text-slate-300" size={36} />
                <p className="font-bold text-slate-600 text-sm">No Courses Found</p>
                <p className="text-xs text-slate-400">
                  {searchTerm ? "No courses match your search criteria." : "You have not created any courses yet."}
                </p>
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-xs"
                >
                  <Plus size={14} /> Create New Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Course Thumbnail */}
                    <div className="aspect-video w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                      {course.thumbnail_url ? (
                        <img
                          src={getMediaUrl(course.thumbnail_url)}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
                          <GraduationCap size={32} />
                        </div>
                      )}
                      <span
                        className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs ${
                          course.status === "published"
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    {/* Course Card Body */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-accent group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {course.description || "No description provided."}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span>{course.module_count || 0} Modules • {course.lesson_count || 0} Lessons</span>
                          <span className="text-slate-600">
                            {course.is_paid ? `₹${course.price}` : "Free"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(course)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-accent font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1"
                          >
                            <Pencil size={12} /> Edit Studio
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition"
                            title="Delete course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MODAL: Module Form ── */}
        {showModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-accent">
                  {editingModule ? "Edit Module" : "Create New Module"}
                </h3>
                <button
                  onClick={() => setShowModuleModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveModule} className="p-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Module Title
                  </label>
                  <input
                    type="text"
                    required
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="e.g. Module 1: Introduction to Web Architecture"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Module Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    placeholder="Key topics and concepts covered in this module..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Lesson & Quiz Form ── */}
        {showLessonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h3 className="text-xs font-bold text-accent">
                  {editingLesson ? "Edit Lesson / Assessment" : "Create New Lesson"}
                </h3>
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      required
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="e.g. Understanding Asynchronous JavaScript"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Lesson Type
                    </label>
                    <select
                      value={lessonForm.lesson_type}
                      onChange={(e) => setLessonForm({ ...lessonForm, lesson_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-bold"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="text">Text / Reading Article</option>
                      <option value="quiz">MCQ Quiz / Exam</option>
                      <option value="assignment">Subjective Assignment</option>
                    </select>
                  </div>
                </div>

                {/* Video URL Input */}
                {lessonForm.lesson_type === "video" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Video URL (YouTube, Vimeo, or MP4)
                    </label>
                    <input
                      type="text"
                      value={lessonForm.video_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                    />
                  </div>
                )}

                {/* Content / Markdown Editor */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Lesson Markdown / Notes Content
                  </label>
                  <textarea
                    rows={4}
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Enter lesson summary, lecture notes, or markdown explanations..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                  />
                </div>

                {/* Assignment & MCQ Builder */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-accent">Assessment Questions</h4>
                      <p className="text-[10px] text-slate-400">Add MCQs or essay prompts for this lesson</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Plus size={12} /> Add Question
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Assignment Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={lessonForm.assignment_title}
                        onChange={(e) => setLessonForm({ ...lessonForm, assignment_title: e.target.value })}
                        placeholder="e.g. Module 1 Knowledge Check"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Due Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={lessonForm.due_date}
                        onChange={(e) => setLessonForm({ ...lessonForm, due_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Question List */}
                  <div className="space-y-3 pt-2">
                    {lessonForm.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Question {qIdx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={q.question_type}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLessonForm((prev) => {
                                  const updated = [...prev.questions];
                                  updated[qIdx].question_type = val;
                                  return { ...prev, questions: updated };
                                });
                              }}
                              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] font-bold"
                            >
                              <option value="mcq">Multiple Choice</option>
                              <option value="subjective">Subjective Essay</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-slate-400 hover:text-red-500 p-0.5"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          required
                          value={q.question_text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLessonForm((prev) => {
                              const updated = [...prev.questions];
                              updated[qIdx].question_text = val;
                              return { ...prev, questions: updated };
                            });
                          }}
                          placeholder="Enter question text..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                        />

                        {/* MCQ Options */}
                        {q.question_type === "mcq" && (
                          <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span>Options (Select correct option):</span>
                              <button
                                type="button"
                                onClick={() => handleAddOption(qIdx)}
                                className="text-primary hover:underline"
                              >
                                + Add Option
                              </button>
                            </div>

                            {q.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={opt.is_correct}
                                  onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                                  className="text-primary focus:ring-primary"
                                />
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setLessonForm((prev) => {
                                      const updated = [...prev.questions];
                                      updated[qIdx].options[optIdx].text = val;
                                      return { ...prev, questions: updated };
                                    });
                                  }}
                                  className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    className="text-slate-400 hover:text-red-500"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowLessonModal(false)}
                    className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Save Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default InstructorCourseManager;
