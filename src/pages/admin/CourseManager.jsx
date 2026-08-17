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
  GripVertical,
} from "lucide-react";
import { CourseGridSkeleton } from "../../components/Skeletons";
import API_URL, { getMediaUrl } from "../../config";

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [uploading, setUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

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

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setThumbnailUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post(`/admin/upload`, formData);

      const url = uploadRes.data.url;
      setCourseForm((prev) => ({
        ...prev,
        thumbnail_url: url,
      }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert(error.response?.data?.detail || "Failed to upload thumbnail image.");
    } finally {
      setThumbnailUploading(false);
    }
  };

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
          courseForm
        );
      } else {
        response = await api.post(`/admin/courses`, courseForm);
      }
      fetchCourses();
      setSelectedCourse(response.data);
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
      e.target.value = null;
    }
  };

  const handleInjectFileForCourse = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt course file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/admin/courses/${courseId}/update-from-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "Course details and curriculum updated successfully!");
      fetchCourses();
      if (selectedCourse?.id === courseId) {
        const detailRes = await api.get(`/admin/courses/${courseId}`);
        setSelectedCourse(detailRes.data);
      }
    } catch (error) {
      console.error("Error injecting course file:", error);
      alert(error.response?.data?.detail || "Failed to update course from file");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 font-sans">
        {/* Page Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">Course Management</h1>
            <p className="text-xs text-slate-500">
              Create, curate, and publish high-impact learning experiences.
            </p>
          </div>

          {!selectedCourse && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() =>
                  document.getElementById("course-file-upload").click()
                }
                className={`bg-white border border-slate-200 text-slate-700 hover:border-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-xs shrink-0 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={uploading}
              >
                <Upload size={14} />
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "info" ? "bg-white text-accent border border-slate-200 shadow-xs" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}
                >
                  <FileText size={14} /> Basic Info
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  disabled={!selectedCourse.id}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "curriculum" ? "bg-white text-accent border border-slate-200 shadow-xs" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"} ${!selectedCourse.id ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <LayoutGrid size={14} /> Curriculum
                </button>
                {selectedCourse.id && (
                  <>
                    <button
                      onClick={() =>
                        document.getElementById(`inject-file-editor-${selectedCourse.id}`).click()
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-xs"
                      title="Inject new .txt file to update course details and curriculum"
                      disabled={uploading}
                    >
                      <Upload size={13} /> {uploading ? "Injecting..." : "Inject File to Update"}
                    </button>
                    <input
                      type="file"
                      id={`inject-file-editor-${selectedCourse.id}`}
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
                <form
                  onSubmit={handleCourseSubmit}
                  className="max-w-3xl mx-auto space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-0.5">
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
                        placeholder="e.g. Mastering SVARP Instrumentation"
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
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Provide an overview of the course content..."
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
                            onChange={(e) =>
                              setCourseForm({
                                ...courseForm,
                                thumbnail_url: e.target.value,
                              })
                            }
                            placeholder="Paste image URL or upload file below..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                          />
                          <label className="px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                            <Upload size={12} />
                            <span>{thumbnailUploading ? "Uploading..." : "Upload File"}</span>
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
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            status: e.target.value,
                          })
                        }
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors cursor-pointer group">
                      <div className="relative w-5 h-5 flex-shrink-0">
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
                        <div className="w-5 h-5 rounded bg-white border-2 border-slate-200 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center text-white">
                          <Plus size={12} className="stroke-[4]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-accent">
                          Linear Learning
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Require all lessons
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors cursor-pointer group">
                      <div className="relative w-5 h-5 flex-shrink-0">
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
                        <div className="w-5 h-5 rounded bg-white border-2 border-slate-200 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center text-white">
                          <Plus size={12} className="stroke-[4]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-accent">
                          Strict Assessment
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Require manual approval
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Pricing Section */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-5 flex-shrink-0">
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
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-primary transition-all relative">
                          <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-accent">
                          Premium Access
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Set a price for this course
                        </p>
                      </div>
                    </div>

                    {courseForm.is_paid && (
                      <div className="relative w-full sm:w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
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
                          className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 outline-none focus:border-accent text-xs font-bold"
                          placeholder="Price"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg transition-all text-xs"
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
        ) : loading ? (
          <CourseGridSkeleton count={6} />
        ) : (
          /* ── Course Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {courses.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center border border-slate-200 rounded-lg bg-white">
                <BookOpen size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  No courses yet. Click "New Course" to get started.
                </p>
              </div>
            )}
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-md border border-slate-200 p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors shadow-xs animate-fadeIn"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                        course.status === "published"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {course.status}
                    </span>
                    {course.is_paid ? (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-violet-50 text-violet-600 border border-violet-100 font-bold">
                        ₹{course.price}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                        Free
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-500 transition-all"
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-accent leading-snug mb-1">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="text-[8px] text-slate-400 font-mono">
                    ID: {course.id}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        document.getElementById(`inject-file-card-${course.id}`).click()
                      }
                      className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold transition-all text-[10px] flex items-center gap-1"
                      title="Inject new .txt file to update details & curriculum"
                      disabled={uploading}
                    >
                      Inject File <Upload size={10} />
                    </button>
                    <input
                      type="file"
                      id={`inject-file-card-${course.id}`}
                      className="hidden"
                      accept=".txt"
                      onChange={(e) => handleInjectFileForCourse(course.id, e)}
                    />
                    <button
                      onClick={() => handleEditClick(course)}
                      className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:border-accent hover:text-accent font-bold transition-all text-[10px] flex items-center gap-1"
                    >
                      Manage <Pencil size={11} />
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
        lessons: [],
      });
      setNewModuleTitle("");
      setNewModuleDescription("");
      fetchCurriculum();
    } catch (error) {
      console.error("Error creating module:", error);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-accent">Curriculum</h2>
          <p className="text-xs text-slate-400">
            Organize modules and lessons to build the learning path.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-0.5">
          Quick Add Module
        </h3>
        <form
          onSubmit={handleAddModule}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            placeholder="e.g. Introduction to SVARP"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
            required
          />
          <button
            type="submit"
            className="bg-primary hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <Plus size={14} /> Add Section
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => (
          <ModuleItem
            key={module.id}
            module={module}
            onUpdate={fetchCurriculum}
            index={index}
          />
        ))}
        {modules.length === 0 && !loading && (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg bg-white">
            <LayoutGrid size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              No modules created yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleItem = ({ module, onUpdate, index }) => {
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
      type: lesson.lesson_type,
      content: lesson.content || "",
      file: null,
    });
    setShowAddLesson(true);
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
        "Are you sure you want to delete this section and all its lessons?"
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

  const updateQuestion = (qIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx] = { ...updated[qIdx], [field]: value };
    if (field === "question_type" && value === "subjective") {
      updated[qIdx].options = [];
    }
    if (
      field === "question_type" &&
      value === "mcq" &&
      updated[qIdx].options.length === 0
    ) {
      updated[qIdx].options = [{ option_text: "", is_correct: false }];
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
        !editingLessonId
      ) {
        const formData = new FormData();
        formData.append("file", lessonForm.file);
        const uploadRes = await api.post(`${API_URL}/admin/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        videoUrl = uploadRes.data.url;
      }

      if (editingLessonId) {
        const updateData = {
          title: lessonForm.title,
          content: lessonForm.content,
        };
        if (videoUrl) updateData.video_url = videoUrl;

        await api.put(`/admin/lessons/${editingLessonId}`, updateData);
      } else {
        const lessonRes = await api.post(
          `${API_URL}/admin/modules/${module.id}/lessons`,
          {
            title: lessonForm.title,
            content: lessonForm.type === "text" ? lessonForm.content : "",
            video_url: videoUrl,
            lesson_type: lessonForm.type,
            order: module.lessons ? module.lessons.length + 1 : 1,
          }
        );

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden group/module animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div
        className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 text-slate-300 group-hover/module:text-slate-400 transition-colors">
            <GripVertical size={16} />
          </div>
          <h4 className="font-bold text-accent text-xs flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[9px] font-mono text-slate-400 group-hover/module:border-primary/20 group-hover/module:text-primary transition-all">
              {String(index + 1).padStart(2, "0")}
            </span>
            {module.title}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-slate-200 text-[8px] font-bold uppercase tracking-wider text-slate-400">
            <LayoutGrid size={10} />
            {module.lessons ? module.lessons.length : 0} Lessons
          </div>

          <div className="flex items-center gap-1 opacity-60 group-hover/module:opacity-100 transition-opacity">
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
              className="p-1 bg-white border border-slate-200 text-primary rounded hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xs"
              title="Add Lesson"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={handleDeleteModule}
              className="p-1 bg-white border border-slate-200 text-slate-400 rounded hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-xs"
              title="Delete Section"
            >
              <Trash2 size={14} />
            </button>
            <div className="ml-1 p-0.5 text-slate-400">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 bg-white">
          {module.description && (
            <p className="text-slate-500 text-xs mb-3 italic px-1">
              {module.description}
            </p>
          )}

          {showAddLesson && (
            <div className="mb-4 p-3 border border-slate-200 bg-slate-50 rounded-lg">
              <h5 className="font-bold text-xs mb-2 text-accent">
                {editingLessonId ? "Edit Lesson" : "New Lesson"}
              </h5>
              <form onSubmit={handleAddLesson} className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                    required
                  />
                </div>
                <div className="flex gap-4 flex-wrap text-xs font-medium text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={lessonForm.type === "video"}
                      onChange={() =>
                        setLessonForm({ ...lessonForm, type: "video" })
                      }
                    />
                    <VideoIcon size={14} /> Video
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={lessonForm.type === "text"}
                      onChange={() =>
                        setLessonForm({ ...lessonForm, type: "text" })
                      }
                    />
                    <FileText size={14} /> Text / Article
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={lessonForm.type === "assignment"}
                      onChange={() => {
                        setLessonForm({ ...lessonForm, type: "assignment" });
                        if (questions.length === 0) addQuestion();
                      }}
                    />
                    <ClipboardList size={14} /> Assignment
                  </label>
                </div>

                {editingLessonId && (
                  <p className="text-[9px] text-slate-500 italic">
                    Note: Changing lesson type is not supported in edit mode.
                  </p>
                )}

                {lessonForm.type === "video" ? (
                  <div className="border-2 border-dashed border-slate-200 rounded p-3 text-center bg-white cursor-pointer hover:bg-slate-50">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id={`file-${module.id}`}
                    />
                    <label
                      htmlFor={`file-${module.id}`}
                      className="cursor-pointer flex flex-col items-center justify-center min-h-[60px]"
                    >
                      <Upload size={18} className="text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-600 font-medium">
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                    rows={4}
                  />
                ) : (
                  /* Assignment Question Builder */
                  <div className="space-y-3">
                    <textarea
                      placeholder="Assignment description / instructions..."
                      value={lessonForm.content}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          content: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                      rows={2}
                    />
                    <div className="space-y-2">
                      {questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="border border-slate-200 rounded-lg p-2.5 bg-white"
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
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-accent text-xs font-semibold"
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
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-accent text-xs font-bold"
                            >
                              <option value="subjective">Subjective</option>
                              <option value="mcq">MCQ</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
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
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-accent text-[10px] font-semibold"
                                    required
                                  />
                                  <label className="flex items-center gap-1 text-[10px] text-green-700 cursor-pointer font-bold">
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
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(qIdx)}
                                className="text-[10px] text-primary hover:underline font-bold mt-0.5"
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
                      className="text-xs text-primary border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 rounded font-bold"
                    >
                      + Add Question
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
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
                    className="px-3 py-1 text-xs bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-3 py-1 text-xs bg-primary hover:bg-slate-900 text-white rounded font-bold disabled:bg-slate-200"
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

          <div className="space-y-1.5">
            {module.lessons &&
              module.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg hover:bg-slate-50/50 group/lesson"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 font-bold">
                      {lesson.lesson_type === "video" ? (
                        <VideoIcon size={12} />
                      ) : lesson.lesson_type === "assignment" ? (
                        <ClipboardList size={12} />
                      ) : (
                        <FileText size={12} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-accent truncate">
                        {lesson.title}
                      </p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {lesson.lesson_type}{" "}
                        {lesson.lesson_type === "assignment"
                          ? "• Manual Review"
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLesson(lesson);
                      }}
                      className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:border-accent hover:text-accent transition-all"
                      title="Edit Lesson"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteLesson(e, lesson.id)}
                      className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-500 transition-all"
                      title="Delete Lesson"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            {(!module.lessons || module.lessons.length === 0) && (
              <div className="py-6 text-center border border-dashed border-slate-100 rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  No content in this section
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
