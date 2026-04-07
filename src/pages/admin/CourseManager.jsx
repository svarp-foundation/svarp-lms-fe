import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
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
  CheckSquare,
  GripVertical,
  Search,
} from "lucide-react";
import API_URL from "../../config";

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // info, curriculum
  const [uploading, setUploading] = useState(false);

  // Form state for Course
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    status: "draft",
    passing_score: 70,
    require_all_lessons_completed: true,
    require_assignment_approval: false,
    is_paid: false,
    price: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/admin/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
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
      is_paid: false,
      price: 0,
    });
    setActiveTab("info");
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url || "",
      status: course.status,
      passing_score: course.passing_score || 70,
      require_all_lessons_completed:
        course.require_all_lessons_completed !== undefined
          ? course.require_all_lessons_completed
          : true,
      require_assignment_approval: course.require_assignment_approval || false,
      is_paid: course.is_paid || false,
      price: course.price || 0,
    });
    setActiveTab("info");
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(error.response?.data?.detail || "Failed to delete course");
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (selectedCourse && selectedCourse.id) {
        response = await api.put(
          `/admin/courses/${selectedCourse.id}`,
          courseForm,
        );
      } else {
        response = await api.post(`/admin/courses`, courseForm);
      }
      fetchCourses();
      setSelectedCourse(response.data); // Set as selected to enable curriculum tab
      alert("Course saved successfully!");
    } catch (error) {
      console.error("Error saving course:", error);
      const errorMessage =
        error.response?.data?.detail || "Failed to save course";
      alert(errorMessage);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/admin/courses/bulk-create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      fetchCourses();
    } catch (error) {
      console.error("Error uploading course file:", error);
      alert(error.response?.data?.detail || "Failed to upload course file");
    } finally {
      setUploading(false);
      e.target.value = null; // Clear input to allow re-upload of same file
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Page Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="p-2.5 bg-violet-100 rounded-2xl text-violet-600 shadow-sm">
                <BookOpen size={24} className="stroke-[2.5]" />
              </span>
              Course Management
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Create, curate, and publish high-impact learning experiences.
            </p>
          </div>

          {!selectedCourse && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  document.getElementById("course-file-upload").click()
                }
                className={`px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={uploading}
              >
                <Upload size={18} />
                {uploading ? "Uploading..." : "Bulk Upload"}
              </button>
              <input
                type="file"
                id="course-file-upload"
                className="hidden"
                accept=".txt"
                onChange={handleBulkUpload}
              />
              <button
                onClick={handleCreateClick}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> New Course
              </button>
            </div>
          )}
        </div>

        {selectedCourse ? (
          /* ── Course Editor Interface ── */
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 bg-gray-50/30 p-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "info" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                >
                  <FileText size={16} /> Basic Info
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  disabled={!selectedCourse.id}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "curriculum" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"} ${!selectedCourse.id ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <LayoutGrid size={16} /> Curriculum
                </button>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="ml-auto px-6 py-3 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>

            <div className="p-4 md:p-10">
              {activeTab === "info" ? (
                <form
                  onSubmit={handleCourseSubmit}
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
                        Course Title
                      </label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Mastering Advanced React Patterns"
                        className="w-full bg-gray-50 border-none px-5 py-4 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-primary transition-all shadow-inner"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
                        Course Description
                      </label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Provide a compelling overview of what students will learn..."
                        className="w-full bg-gray-50 border-none px-5 py-4 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-primary transition-all shadow-inner"
                        rows={5}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
                        Thumbnail URL
                      </label>
                      <input
                        type="text"
                        value={courseForm.thumbnail_url}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            thumbnail_url: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-none px-5 py-4 rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-primary transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
                        Publication Status
                      </label>
                      <select
                        value={courseForm.status}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            status: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-none px-5 py-4 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary transition-all shadow-inner cursor-pointer"
                      >
                        <option value="draft">Draft (Private)</option>
                        <option value="published">Published (Public)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
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
                              passing_score: parseInt(e.target.value),
                            })
                          }
                          className="w-full bg-gray-50 border-none pl-5 pr-12 py-4 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary transition-all shadow-inner"
                          required
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-primary/10 group">
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={courseForm.require_all_lessons_completed}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              require_all_lessons_completed: e.target.checked,
                            })
                          }
                          className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-6 h-6 rounded-lg bg-white border-2 border-gray-200 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center text-white">
                          <Plus size={14} className="stroke-[4]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          Linear Learning
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Require all lessons
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-primary/10 group">
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={courseForm.require_assignment_approval}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              require_assignment_approval: e.target.checked,
                            })
                          }
                          className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-6 h-6 rounded-lg bg-white border-2 border-gray-200 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center text-white">
                          <Plus size={14} className="stroke-[4]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          Strict Assessment
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Require manual approval
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Pricing Section */}
                  <div className="p-6 rounded-3xl bg-violet-50/50 border border-violet-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-6 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={courseForm.is_paid}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              is_paid: e.target.checked,
                              price: e.target.checked
                                ? courseForm.price || 0
                                : 0,
                            })
                          }
                          className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-12 h-6 rounded-full bg-gray-200 peer-checked:bg-violet-500 transition-all relative">
                          <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all peer-checked:translate-x-6" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-violet-900">
                          Premium Access
                        </p>
                        <p className="text-xs text-violet-600 font-medium">
                          Set a price for this course
                        </p>
                      </div>
                    </div>

                    {courseForm.is_paid && (
                      <div className="relative w-full md:w-48">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={courseForm.price}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-white border-none pl-10 pr-5 py-3 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-violet-400 transition-all shadow-sm"
                          placeholder="Price"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-opacity-90 hover:shadow-xl hover:shadow-primary/20 transition-all"
                    >
                      {selectedCourse.id ? "Update Course" : "Create Course"}
                    </button>
                  </div>
                </form>
              ) : (
                <CurriculumEditor courseId={selectedCourse.id} />
              )}
            </div>
          </div>
        ) : (
          /* ── Course Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {courses.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
                    <BookOpen size={48} />
                  </div>
                  <p className="font-bold text-gray-500">
                    No courses yet. Click "New Course" to get started.
                  </p>
                </div>
              </div>
            )}
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        course.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {course.status}
                    </span>
                    {course.is_paid ? (
                      <span className="px-3 py-1 rounded-lg text-xs bg-violet-50 text-violet-700 border border-violet-100 font-bold">
                        ₹{course.price}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-100 font-bold">
                        Free
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Course"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="font-bold text-xl text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-8 font-medium">
                  {course.description}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                  <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Course ID: {course.id}
                  </div>
                  <button
                    onClick={() => handleEditClick(course)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-accent text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    Manage <Pencil size={14} />
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

const CurriculumEditor = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const fetchCurriculum = async () => {
    try {
      const response = await api.get(`/admin/courses/${courseId}`);
      setModules(response.data.modules || []);
    } catch (error) {
      console.error("Error fetching curriculum:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/courses/${courseId}/modules`, {
        title: newModuleTitle,
        description: newModuleDescription,
        order: modules.length + 1,
        lessons: [], // Currently backend might not need this if schema is clean
      });
      setNewModuleTitle("");
      setNewModuleDescription("");
      fetchCurriculum();
    } catch (error) {
      console.error("Error creating module:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curriculum</h2>
          <p className="text-sm text-gray-400 font-medium font-sans">Organize modules and lessons to build the learning path.</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner group">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-1">Quick Add Module</h3>
        <form onSubmit={handleAddModule} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="e.g. Introduction to SVARP"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className="flex-1 bg-white border-none px-5 py-3 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-primary transition-all shadow-sm"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Section
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {modules.map((module, index) => (
          <ModuleItem
            key={module.id}
            module={module}
            onUpdate={fetchCurriculum}
            index={index}
          />
        ))}
        {modules.length === 0 && !loading && (
          <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
             <LayoutGrid size={40} className="mx-auto text-gray-200 mb-3" />
             <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">No modules created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleItem = ({ module, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    type: "video",
    content: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      type: lesson.lesson_type, // Assuming lesson_type in DB, mapping back to type
      content: lesson.content || "",
      file: null,
    });
    setShowAddLesson(true);
    // If assignment, we might need questions, but for now focus on basic content
    // as the user specifically asked for text content editing.
  };

  const handleDeleteLesson = async (e, lessonId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      onUpdate();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson");
    }
  };

  const handleDeleteModule = async (e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this section and all its lessons?",
      )
    )
      return;
    try {
      await api.delete(`/admin/modules/${module.id}`);
      onUpdate();
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    }
  };

  // Assignment question builder state
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: "", question_type: "subjective", options: [] },
    ]);
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === "question_type" && value === "subjective") {
      updated[idx].options = [];
    }
    if (
      field === "question_type" &&
      value === "mcq" &&
      updated[idx].options.length === 0
    ) {
      updated[idx].options = [{ option_text: "", is_correct: false }];
    }
    setQuestions(updated);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const addOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options = [
      ...(updated[qIdx].options || []),
      { option_text: "", is_correct: false },
    ];
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    const updated = [...questions];
    const opts = [...updated[qIdx].options];
    if (field === "is_correct") {
      // Only one correct answer allowed
      opts.forEach((o, i) => {
        opts[i] = { ...o, is_correct: false };
      });
    }
    opts[oIdx] = { ...opts[oIdx], [field]: value };
    updated[qIdx].options = opts;
    setQuestions(updated);
  };

  const removeOption = (qIdx, oIdx) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(updated);
  };

  const handleFileChange = (e) => {
    setLessonForm({ ...lessonForm, file: e.target.files[0] });
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let videoUrl = "";
      if (
        lessonForm.type === "video" &&
        lessonForm.file &&
        !editingLessonId // Only upload new file if not editing, or if new file provided
      ) {
        const formData = new FormData();
        formData.append("file", lessonForm.file);
        const uploadRes = await api.post(`${API_URL}/admin/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        videoUrl = uploadRes.data.url;
      }

      if (editingLessonId) {
        // Update existing lesson
        const updateData = {
          title: lessonForm.title,
          content: lessonForm.content,
        };
        if (videoUrl) updateData.video_url = videoUrl;

        await api.put(`/admin/lessons/${editingLessonId}`, updateData);
      } else {
        // Create new lesson
        // Create the lesson
        const lessonRes = await api.post(
          `${API_URL}/admin/modules/${module.id}/lessons`,
          {
            title: lessonForm.title,
            content: lessonForm.type === "text" ? lessonForm.content : "",
            video_url: videoUrl,
            lesson_type: lessonForm.type,
            order: module.lessons ? module.lessons.length + 1 : 1,
          },
        );

        // If assignment, also create the assignment with questions
        if (lessonForm.type === "assignment") {
          await api.post(`/admin/assignments`, {
            title: lessonForm.title,
            description: lessonForm.content || "Complete this assignment.",
            lesson_id: lessonRes.data.id,
            questions: questions.map((q, idx) => ({
              question_text: q.question_text,
              question_type: q.question_type,
              order: idx + 1,
              options: q.question_type === "mcq" ? q.options : [],
            })),
          });
        }
      }

      setShowAddLesson(false);
      setEditingLessonId(null);
      setLessonForm({ title: "", type: "video", content: "", file: null });
      setQuestions([]);
      onUpdate();
    } catch (error) {
      console.error("Error adding/updating lesson:", error);
      alert("Failed to save lesson");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group/module animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div
        className="p-5 bg-gray-50/50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 text-gray-300 group-hover/module:text-gray-400 transition-colors">
            <GripVertical size={20} />
          </div>
          <h4 className="font-bold text-gray-900 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-mono text-gray-400 group-hover/module:border-primary/20 group-hover/module:text-primary transition-all">
              {String(index + 1).padStart(2, "0")}
            </span>
            {module.title}
          </h4>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <LayoutGrid size={12} />
            {module.lessons ? module.lessons.length : 0} Lessons
          </div>
          
          <div className="flex items-center gap-1 opacity-40 group-hover/module:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddLesson(!showAddLesson);
                setEditingLessonId(null);
                setLessonForm({ title: "", type: "video", content: "", file: null });
                setIsExpanded(true);
              }}
              className="p-2.5 bg-white border border-gray-100 text-primary rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
              title="Add Lesson"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleDeleteModule}
              className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
              title="Delete Section"
            >
              <Trash2 size={18} />
            </button>
            <div className="ml-2 p-1 text-gray-400">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {module.description && (
            <p className="text-gray-600 text-sm mb-4 italic px-2">
              {module.description}
            </p>
          )}

          {showAddLesson && (
            <div className="mb-6 p-4 border border-blue-100 bg-blue-50 rounded-lg">
              <h5 className="font-bold text-sm mb-3 text-blue-800">
                {editingLessonId ? "Edit Lesson" : "New Lesson"}
              </h5>
              <form onSubmit={handleAddLesson} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm"
                    required
                  />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={lessonForm.type === "video"}
                      onChange={() =>
                        setLessonForm({ ...lessonForm, type: "video" })
                      }
                    />
                    <VideoIcon size={16} /> Video
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={lessonForm.type === "text"}
                      onChange={() =>
                        setLessonForm({ ...lessonForm, type: "text" })
                      }
                    />
                    <FileText size={16} /> Text / Article
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={lessonForm.type === "assignment"}
                      onChange={() => {
                        setLessonForm({ ...lessonForm, type: "assignment" });
                        if (questions.length === 0) addQuestion();
                      }}
                    />
                    <ClipboardList size={16} /> Assignment
                  </label>
                </div>

                {editingLessonId && (
                  <p className="text-xs text-blue-600 italic">
                    Note: Changing lesson type is not supported in edit mode.
                  </p>
                )}

                {lessonForm.type === "video" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-white cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id={`file-${module.id}`}
                    />
                    <label
                      htmlFor={`file-${module.id}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {lessonForm.file
                          ? lessonForm.file.name
                          : "Upload Video File"}
                      </span>
                    </label>
                  </div>
                ) : lessonForm.type === "text" ? (
                  <textarea
                    placeholder="Lesson Content..."
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, content: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm"
                    rows={4}
                  />
                ) : (
                  // Assignment question builder
                  <div className="space-y-4">
                    <textarea
                      placeholder="Assignment description / instructions..."
                      value={lessonForm.content}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          content: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded text-sm"
                      rows={2}
                    />
                    <div className="space-y-3">
                      {questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="border border-gray-200 rounded-lg p-3 bg-white"
                        >
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder={`Question ${qIdx + 1}`}
                              value={q.question_text}
                              onChange={(e) =>
                                updateQuestion(
                                  qIdx,
                                  "question_text",
                                  e.target.value,
                                )
                              }
                              className="flex-1 border p-1.5 rounded text-sm"
                              required
                            />
                            <select
                              value={q.question_type}
                              onChange={(e) =>
                                updateQuestion(
                                  qIdx,
                                  "question_type",
                                  e.target.value,
                                )
                              }
                              className="border p-1.5 rounded text-sm"
                            >
                              <option value="subjective">Subjective</option>
                              <option value="mcq">MCQ</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {q.question_type === "mcq" && (
                            <div className="pl-2 space-y-1">
                              {(q.options || []).map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    placeholder={`Option ${oIdx + 1}`}
                                    value={opt.option_text}
                                    onChange={(e) =>
                                      updateOption(
                                        qIdx,
                                        oIdx,
                                        "option_text",
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1 border p-1.5 rounded text-xs"
                                    required
                                  />
                                  <label className="flex items-center gap-1 text-xs text-green-700 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`correct-${qIdx}`}
                                      checked={opt.is_correct}
                                      onChange={() =>
                                        updateOption(
                                          qIdx,
                                          oIdx,
                                          "is_correct",
                                          true,
                                        )
                                      }
                                    />
                                    Correct
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => removeOption(qIdx, oIdx)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(qIdx)}
                                className="text-xs text-primary hover:underline mt-1"
                              >
                                + Add Option
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-sm text-primary border border-primary px-3 py-1.5 rounded hover:bg-primary hover:text-white transition"
                    >
                      + Add Question
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddLesson(false);
                      setEditingLessonId(null);
                      setLessonForm({
                        title: "",
                        type: "video",
                        content: "",
                        file: null,
                      });
                    }}
                    className="px-3 py-1 text-sm bg-white border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-3 py-1 text-sm bg-primary text-white rounded"
                  >
                    {uploading
                      ? "Saving..."
                      : editingLessonId
                        ? "Save Changes"
                        : "Add Lesson"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {module.lessons &&
              module.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all group/lesson"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/lesson:bg-primary/5 group-hover/lesson:text-primary transition-colors">
                      {lesson.lesson_type === "video" ? (
                        <VideoIcon size={16} />
                      ) : lesson.lesson_type === "assignment" ? (
                        <ClipboardList size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">
                        {lesson.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {lesson.lesson_type} {lesson.lesson_type === "assignment" ? "• Manual Review" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLesson(lesson);
                      }}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      title="Edit Lesson"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteLesson(e, lesson.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Lesson"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            {(!module.lessons || module.lessons.length === 0) && (
              <div className="py-8 text-center border-2 border-dashed border-gray-50/50 rounded-2xl">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No content in this section</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
