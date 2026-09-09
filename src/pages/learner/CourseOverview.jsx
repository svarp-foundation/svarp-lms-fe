import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import {
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  Heart,
  Share2,
  ArrowLeft,
  Clock,
  Award,
  Globe,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LearnerLayout from "../../components/LearnerLayout";
import ShareModal from "../../components/ShareModal";
import { CourseOverviewSkeleton } from "../../components/Skeletons";
import { CourseThumbnail } from "../../components/common";

const CourseOverview = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const isMember = (() => {
    if (course && course.discounted_price === 0) return true;
    if (!user || !user.membership) return false;
    const m = user.membership;
    if (!m.is_active) return false;
    if (m.end_date && new Date(m.end_date) < new Date()) return false;
    return true;
  })();
  const showDiscount = isMember && course?.is_paid;

  const handleEnrollOrGo = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // If the course is paid and user isn't already enrolled, go to payment page UNLESS they are a member
    if (course.is_paid && !isMember) {
      try {
        const enrollRes = await api.get(`/learner/courses`);
        const alreadyEnrolled = enrollRes.data.some((c) => c.id === course.id);
        if (alreadyEnrolled) {
          navigate(`/courses/${courseId}/learn`);
          return;
        }
      } catch {
        // Not enrolled — fall through to payment
      }
      navigate(`/courses/${courseId}/pay`, { state: { course } });
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/learner/enroll/${courseId}`, {});
      navigate(`/courses/${courseId}/learn`);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.detail === "Already enrolled"
      ) {
        navigate(`/courses/${courseId}/learn`);
      } else {
        console.error("Error enrolling:", error);
        navigate(`/courses/${courseId}/learn`);
      }
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const coursePromise = api.get(`/public/courses/${courseId}`);
        const enrollPromise = user ? api.get(`/learner/courses`) : Promise.resolve({ data: [] });
        const wishlistPromise = user ? api.get(`/learner/wishlist`) : Promise.resolve({ data: [] });

        const [courseRes, enrollRes, wishlistRes] = await Promise.all([
          coursePromise,
          enrollPromise,
          wishlistPromise,
        ]);

        setCourse(courseRes.data);

        // Expand all modules by default
        if (courseRes.data?.modules) {
          const initialExpanded = {};
          courseRes.data.modules.forEach((m) => {
            initialExpanded[m.id] = true;
          });
          setExpandedModules(initialExpanded);
        }

        const enrolledCourse = (enrollRes.data || []).find((c) => c.id === Number(courseId));
        if (enrolledCourse) {
          setIsEnrolled(true);
          setProgress(enrolledCourse.progress || 0);
        } else {
          setIsEnrolled(false);
          setProgress(0);
        }

        setIsWishlisted((wishlistRes.data || []).some((c) => c.id === Number(courseId)));
      } catch (error) {
        console.error("Error loading course overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [courseId, user]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        await api.delete(`/learner/wishlist/${courseId}`);
        setIsWishlisted(false);
      } else {
        await api.post(`/learner/wishlist/${courseId}`, {});
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <LearnerLayout>
        <CourseOverviewSkeleton />
      </LearnerLayout>
    );
  }

  if (!course) {
    return (
      <LearnerLayout>
        <div className="flex h-[60vh] bg-slate-50 items-center justify-center">
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm">
            <GraduationCap size={40} className="mx-auto text-slate-400 mb-3" />
            <h2 className="text-lg font-bold text-slate-800">Course not found</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">The course you are looking for does not exist or has been removed.</p>
            <Link
              to="/courses-catalog"
              className="inline-flex items-center gap-2 bg-accent text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <LearnerLayout>
      {/* Course Hero Banner */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] text-white border-b border-white/10 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="page-padding py-8 md:py-12 max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4">
            <Link
              to="/courses-catalog"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-primary transition-colors font-semibold mb-1"
            >
              <ArrowLeft size={14} /> Back to Courses
            </Link>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap line-clamp-3">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <GraduationCap size={15} className="text-primary" />
                <span>Instructor: <strong>{course.instructor_name || "SVARP Faculty"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-slate-400" />
                <span>Updated {new Date(course.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={15} className="text-slate-400" />
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="page-padding py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols on desktop): Curriculum & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview / About Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">About this Course</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Modules</span>
                  <span className="text-lg font-extrabold text-slate-800">{course.modules?.length || 0}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Lessons</span>
                  <span className="text-lg font-extrabold text-slate-800">{totalLessons}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Certificate</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 inline-block">Official Included</span>
                </div>
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Course Content</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.modules?.length || 0} modules • {totalLessons} lectures
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allExpanded = Object.values(expandedModules).every(Boolean);
                    const updated = {};
                    course.modules?.forEach((m) => {
                      updated[m.id] = !allExpanded;
                    });
                    setExpandedModules(updated);
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {Object.values(expandedModules).every(Boolean) ? "Collapse All" : "Expand All"}
                </button>
              </div>

              {!user ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                  <Lock className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Login to View Content
                  </h3>
                  <p className="text-slate-500 mb-4 text-xs max-w-sm mx-auto">
                    Please log in or register to preview the curriculum modules and lessons.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      to="/login"
                      className="bg-accent text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              ) : course.modules && course.modules.length > 0 ? (
                <div className="space-y-3">
                  {course.modules.map((module, idx) => {
                    const isExpanded = expandedModules[module.id];
                    const lessonCount = module.lessons?.length || 0;
                    return (
                      <div
                        key={module.id}
                        className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full bg-slate-50 hover:bg-slate-100/80 p-4 font-semibold text-slate-800 border-b border-slate-200/60 flex justify-between items-center text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-400 w-5">
                              {idx + 1}.
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {module.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium">
                              {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={16} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={16} className="text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {module.lessons && module.lessons.length > 0 ? (
                              module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.lesson_type === "video" ? (
                                      <PlayCircle size={16} className="text-slate-400 flex-shrink-0" />
                                    ) : (
                                      <FileText size={16} className="text-slate-400 flex-shrink-0" />
                                    )}
                                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                                      {lesson.title}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-slate-400 italic">
                                No lessons in this module.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic py-4">
                  No content available yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col on desktop): Sticky Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 sticky top-20 sm:top-24 space-y-5">
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative shadow-inner">
                <CourseThumbnail
                  thumbnailUrl={course.thumbnail_url}
                  title={course.title}
                />
              </div>

              {/* Price Display */}
              <div className="text-center pt-1">
                {course.is_paid ? (
                  showDiscount ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-slate-400 line-through">
                          ₹{course.price}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          ₹0
                        </span>
                      </div>
                      <span className="inline-block text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Free with Active Membership
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        ₹{course.price}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">One-time payment</p>
                    </div>
                  )
                ) : (
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                      Free
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">Full lifetime access</p>
                  </div>
                )}
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/courses/${courseId}/learn`)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle size={18} />
                    {progress === 100 ? "Review Completed Course" : "Continue Learning"}
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollOrGo}
                    disabled={enrolling}
                    className="w-full bg-accent hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition shadow-sm disabled:opacity-50 text-sm"
                  >
                    {enrolling
                      ? "Enrolling..."
                      : course.is_paid && !isMember
                        ? `Enroll Now — ₹${course.price}`
                        : "Enroll for Free"}
                  </button>
                )}

                {/* Secondary Actions: Wishlist & Share */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {user && (
                    <button
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      className={`py-2 rounded-xl font-semibold border transition flex items-center justify-center gap-1.5 text-xs ${
                        isWishlisted
                          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      } disabled:opacity-50`}
                    >
                      <Heart
                        size={14}
                        className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                      />
                      <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowShareModal(true)}
                    className={`py-2 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 text-xs ${
                      !user ? "col-span-2" : ""
                    }`}
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Course Features Checklist */}
              <div className="text-xs text-slate-600 space-y-2.5 pt-4 border-t border-slate-100">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  Course Includes:
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Full lifetime access to all lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Official Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Access on mobile, tablet, and desktop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        courseTitle={course.title}
        courseUrl={window.location.href}
      />
    </LearnerLayout>
  );
};

export default CourseOverview;
