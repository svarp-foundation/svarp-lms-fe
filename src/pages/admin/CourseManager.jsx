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
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Course Management</h1>
          {!selectedCourse && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  document.getElementById("course-file-upload").click()
                }
                className={`bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-all ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={uploading}
              >
                <Upload size={20} />{" "}
                {uploading ? "Uploading..." : "Upload Course File"}
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
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center gap-2"
              >
                <Plus size={20} /> New Course
              </button>
            </div>
          )}
        </div>

        {selectedCourse ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-6 py-4 font-medium ${activeTab === "info" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  disabled={!selectedCourse.id}
                  className={`px-6 py-4 font-medium ${activeTab === "curriculum" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"} ${!selectedCourse.id ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={
                    !selectedCourse.id
                      ? "Save course first to add curriculum"
                      : ""
                  }
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="ml-auto px-6 py-4 text-gray-500 hover:text-red-500"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "info" ? (
                <form
                  onSubmit={handleCourseSubmit}
                  className="max-w-2xl mx-auto space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, title: e.target.value })
                      }
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={courseForm.status}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, status: e.target.value })
                      }
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Score (%)
                    </label>
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
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseForm.require_all_lessons_completed}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            require_all_lessons_completed: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                      />
                      Require All Lessons Completed
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseForm.require_assignment_approval}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            require_assignment_approval: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                      />
                      Require Assignment Approval
                    </label>
                  </div>
                  {/* Paid Course Toggle */}
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseForm.is_paid}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            is_paid: e.target.checked,
                            price: e.target.checked ? courseForm.price || 0 : 0,
                          })
                        }
                        className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                      />
                      This is a Paid Course
                    </label>
                    {courseForm.is_paid && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course Price (₹)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={courseForm.price}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-primary"
                          required
                          placeholder="e.g. 499"
                        />
                      </div>
                    )}
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <CurriculumEditor courseId={selectedCourse.id} />
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${course.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {course.status}
                    </span>
                    {course.is_paid ? (
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 font-semibold">
                        ₹{course.price}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(course)}
                      className="text-primary font-medium hover:underline"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-500 font-medium hover:underline"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <form onSubmit={handleAddModule} className="flex gap-2">
          <input
            type="text"
            placeholder="New Section Title"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="text"
            placeholder="New Section Description (Optional)"
            value={newModuleDescription}
            onChange={(e) => setNewModuleDescription(e.target.value)}
            className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 border border-gray-300 font-medium"
          >
            Add Section
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <ModuleItem
            key={module.id}
            module={module}
            onUpdate={fetchCurriculum}
          />
        ))}
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
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div
        className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {module.title}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {module.lessons ? module.lessons.length : 0} lessons
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddLesson(!showAddLesson);
              setEditingLessonId(null);
              setLessonForm({
                title: "",
                type: "video",
                content: "",
                file: null,
              });
              setIsExpanded(true);
            }}
            className="text-primary text-sm font-medium hover:underline"
          >
            + Add Content
          </button>
          <button
            onClick={handleDeleteModule}
            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete Section"
          >
            <Trash2 size={16} />
          </button>
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

          <div className="space-y-2">
            {module.lessons &&
              module.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group"
                >
                  <div className="flex items-center gap-3">
                    {lesson.lesson_type === "video" ? (
                      <VideoIcon size={16} className="text-gray-400" />
                    ) : lesson.lesson_type === "assignment" ? (
                      <ClipboardList size={16} className="text-purple-400" />
                    ) : (
                      <FileText size={16} className="text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {lesson.title}
                    </span>
                    {lesson.lesson_type === "assignment" && (
                      <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                        Assignment
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLesson(lesson);
                      }}
                      className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Edit Lesson"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteLesson(e, lesson.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Lesson"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            {(!module.lessons || module.lessons.length === 0) && (
              <div className="text-xs text-gray-400 italic text-center py-2">
                No lessons in this section
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
