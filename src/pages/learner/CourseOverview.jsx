import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import API_URL, { getMediaUrl } from "../../config";

import { PlayCircle, FileText, CheckCircle, Lock, Heart, Share2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LearnerLayout from "../../components/LearnerLayout";
import ShareModal from "../../components/ShareModal";

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

  const isMember =
    (user && user.membership) || (course && course.discounted_price === 0);
  const showDiscount = isMember && course?.is_paid;

  const handleEnrollOrGo = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // If the course is paid and user isn't already enrolled, go to payment page UNLESS they are a member
    if (course.is_paid && !isMember) {
      // Check existing enrollment first
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
    fetchCourseDetails();
  }, [courseId]);

  // Check enrollment whenever course or user changes
  useEffect(() => {
    if (!user || !course) return;

    api
      .get(`/learner/courses`)
      .then((res) => {
        const enrolledCourse = res.data.find((c) => c.id === course.id);
        if (enrolledCourse) {
          setIsEnrolled(true);
          setProgress(enrolledCourse.progress || 0);
        } else {
          setIsEnrolled(false);
          setProgress(0);
        }
      })
      .catch(() => {});

    // Also check wishlist status
    api
      .get(`/learner/wishlist`)
      .then((res) => {
        setIsWishlisted(res.data.some((c) => c.id === course.id));
      })
      .catch(() => {});
  }, [user, course]);

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

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/public/courses/${courseId}`);
      setCourse(response.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex h-[60vh] bg-gray-50 items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </LearnerLayout>
    );
  }

  if (!course) {
    return (
      <LearnerLayout>
        <div className="flex h-[60vh] bg-gray-50 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
            <Link to="/dashboard" className="text-primary mt-4 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="bg-gray-50 pb-12">
      {/* Course Header */}
      <div className="bg-accent text-white page-padding">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-300 text-sm mb-6 whitespace-pre-wrap">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Created by {course.instructor_name || "Instructor"}</span>
            <span>•</span>
            <span>
              Last updated {new Date(course.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto page-padding responsive-layout-flex">
        {/* Left Column: Course Content */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Course Content
          </h2>

          {!user ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
              <Lock className="mx-auto h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Login to View Content
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Please log in or register to preview the course modules and
                lessons.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/login"
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary border border-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Register
                </Link>
              </div>
            </div>
          ) : course.modules && course.modules.length > 0 ? (
            <div className="space-y-4">
              {course.modules.map((module) => (
                <div
                  key={module.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                >
                  <div className="bg-gray-50 p-4 font-semibold text-gray-800 border-b border-gray-200 flex justify-between items-center">
                    <span>{module.title}</span>
                    <span className="text-sm text-gray-500">
                      {module.lessons ? module.lessons.length : 0} lectures
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {module.lessons &&
                      module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.lesson_type === "video" ? (
                              <PlayCircle size={16} className="text-gray-400" />
                            ) : (
                              <FileText size={16} className="text-gray-400" />
                            )}
                            <span className="text-gray-700">
                              {lesson.title}
                            </span>
                          </div>
                          {/* Preview or Start button could go here */}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No content available yet.
            </div>
          )}
        </div>

        {/* Right Column: Enrollment/Action Card */}
        <div className="responsive-layout-sidebar">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
            <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
              {course.thumbnail_url ? (
                <img
                  src={getMediaUrl(course.thumbnail_url)}
                  alt={course.title}
                  className="w-full h-full object-fill"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <PlayCircle size={48} />
                </div>
              )}
            </div>
            {/* Price Display */}
            {course.is_paid && (
              <div className="mb-4 text-center flex flex-col items-center">
                {showDiscount ? (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{course.price}
                    </span>
                    <span className="text-3xl font-bold text-primary">₹0</span>
                    <span className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-2 py-0.5 rounded-full">
                      Free for Members
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    ₹{course.price}
                  </span>
                )}
              </div>
            )}
            <div className="space-y-4">
              {/* If already enrolled — show Continue Learning */}
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}/learn`)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  {progress === 100 ? "Completed" : "Continue Learning"}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEnrollOrGo}
                    disabled={enrolling}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-lg disabled:opacity-50"
                  >
                    {enrolling
                      ? "Loading..."
                      : course.is_paid && !isMember
                        ? `Enroll — ₹${course.price}`
                        : "Enroll for Free"}
                  </button>
                  {(!course.is_paid || isMember) && (
                    <p className="text-xs text-center text-gray-500">
                      Free — Full lifetime access
                    </p>
                  )}
                </>
              )}
              {/* Wishlist Button — only for logged-in users */}
              {user && (
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`w-full py-2.5 rounded-lg font-medium border transition flex items-center justify-center gap-2 text-sm ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  } disabled:opacity-50`}
                >
                  <Heart
                    size={16}
                    className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                  />
                  {wishlistLoading
                    ? "..."
                    : isWishlisted
                      ? "Wishlisted"
                      : "Add to Wishlist"}
                </button>
              )}

              {/* Share Course Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full py-2.5 rounded-lg font-medium border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm"
              >
                <Share2 size={16} className="text-gray-600" />
                <span>Share Course</span>
              </button>
              <div className="text-sm text-gray-600 space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Access on mobile and TV</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Certificate of completion</span>
                </div>
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
