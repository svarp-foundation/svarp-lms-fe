import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, PlayCircle, Info, CheckCircle, Heart, Award, Download, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import API_URL from "../config";
import Certificate from "./Certificate";

// Simple global cache to avoid N duplicate requests on page load
let wishlistCache = null;
let wishlistPromise = null;

const CourseCard = ({ course, isPublic = false, enrolled = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsData, setMetricsData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkWishlist = async () => {
      if (wishlistCache !== null) {
        setIsWishlisted(wishlistCache.includes(course.id));
        return;
      }

      if (!wishlistPromise) {
        wishlistPromise = api.get("/learner/wishlist")
          .then((res) => {
            wishlistCache = res.data.map((c) => c.id);
            return wishlistCache;
          })
          .catch((err) => {
            console.error("Error fetching wishlist", err);
            wishlistPromise = null;
            return [];
          });
      }

      const ids = await wishlistPromise;
      setIsWishlisted(ids.includes(course.id));
    };

    checkWishlist();
  }, [user, course.id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/learner/wishlist/${course.id}`);
        setIsWishlisted(false);
        if (wishlistCache) {
          wishlistCache = wishlistCache.filter((id) => id !== course.id);
        }
      } else {
        await api.post(`/learner/wishlist/${course.id}`, {});
        setIsWishlisted(true);
        if (wishlistCache) {
          wishlistCache.push(course.id);
        }
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const getSecureVideoUrl = (url) => {
    if (!url) return "";
    const token = localStorage.getItem("token") || "";
    let secureUrl = url.replace("/static/uploads/", "/media/");

    if (secureUrl.startsWith("/")) {
      secureUrl = `${API_URL}${secureUrl}`;
    } else if (!secureUrl.startsWith("http")) {
      secureUrl = `${API_URL}/${secureUrl}`;
    }

    return `${secureUrl}${secureUrl.includes("?") ? "&" : "?"}token=${token}`;
  };

  const handleCompletedClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMetricsModal(true);
    setLoadingMetrics(true);
    try {
      const res = await api.get(`/learner/courses/${course.id}/content`);
      setMetricsData(res.data);
    } catch (err) {
      console.error("Error fetching course metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-md overflow-hidden hover-lift transition-luxury border border-gray-100 flex flex-col h-full group">
      <div className="h-44 bg-gray-200 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <GraduationCap size={48} />
          </div>
        )}

        {/* Price / Free badge */}
        <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold shadow-sm bg-white text-gray-800">
          {course.discounted_price === 0 ? (
            <span className="text-primary">₹0 (Member)</span>
          ) : course.is_paid ? (
            `₹${course.price}`
          ) : (
            "Free"
          )}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50 z-10 flex items-center justify-center"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={16}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>

        <span className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded text-xs font-bold text-gray-800 shadow-sm">
          {course.status === "published" ? "Course" : "Draft"}
        </span>

        {/* Enrolled badge */}
        {enrolled && (
          <span className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow">
            <CheckCircle size={12} /> Enrolled
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-3 font-semibold">SVARP GLOBAL ACADEMY</p>
        <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-grow leading-relaxed">
          {course.description}
        </p>

        {enrolled && course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
              <span>Course Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link
            to={`/courses/${course.id}`}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition text-sm"
          >
            <Info size={16} /> Overview
          </Link>

          {/* Enrolled users get Continue/Completed button */}
          {enrolled ? (
            course.progress === 100 ? (
              <button
                onClick={handleCompletedClick}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm text-sm"
              >
                <CheckCircle size={16} /> Completed
              </button>
            ) : (
              <Link
                to={`/courses/${course.id}/learn`}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm text-sm"
              >
                <PlayCircle size={16} /> Continue
              </Link>
            )
          ) : !isPublic ? (
            <Link
              to={`/courses/${course.id}/learn`}
              className="flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-sm text-sm"
            >
              <PlayCircle size={16} /> Resume
            </Link>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-sm text-sm"
            >
              {course.discounted_price === 0
                ? "Enroll Free"
                : course.is_paid
                  ? `Enroll ₹${course.price}`
                  : "Enroll Free"}
            </Link>
          )}
        </div>
      </div>

      {/* Course Metrics & Certificate Modal */}
      {showMetricsModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMetricsModal(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] z-10 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Award className="text-yellow-500 w-6 h-6 animate-pulse" />
                <span className="font-extrabold text-gray-900 text-lg">Course Completed!</span>
              </div>
              <button
                onClick={() => setShowMetricsModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Course Title and Image */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-16 h-16 rounded-xl object-fill flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="text-gray-400 w-8 h-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 leading-tight truncate">{course.title}</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1">SVARP GLOBAL ACADEMY</p>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-green-800 font-bold mb-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Completed
                  </span>
                  <span>100% Progress</span>
                </div>
                <div className="h-2 w-full bg-green-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
              </div>

              {/* Course Metrics */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Course Metrics</h5>
                {loadingMetrics ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : metricsData ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex flex-col">
                      <span className="text-2xl font-black text-primary">{metricsData.modules.length}</span>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Modules Completed</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex flex-col">
                      <span className="text-2xl font-black text-primary">
                        {metricsData.modules.reduce((sum, m) => sum + m.lessons.length, 0)}
                      </span>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Lessons Completed</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Could not load course metrics.</p>
                )}
              </div>

              {/* Certificate Download Area */}
              <div className="pt-2">
                {loadingMetrics ? (
                  <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                ) : metricsData?.certificate_pdf_url ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50/50 border border-yellow-100 p-5 rounded-2xl flex flex-col items-center text-center">
                    <Award className="text-yellow-600 w-10 h-10 mb-2" />
                    <h5 className="font-extrabold text-amber-900 text-sm">Certificate is ready!</h5>
                    <p className="text-xs text-amber-800/80 mt-1 max-w-[85%]">
                      Your certificate of completion has been generated successfully.
                    </p>
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md shadow-yellow-600/10"
                    >
                      <Award size={16} /> View Certificate
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50/50 border border-yellow-100 p-5 rounded-2xl flex flex-col items-center text-center">
                    <Award className="text-yellow-600 w-10 h-10 mb-2" />
                    <h5 className="font-extrabold text-amber-900 text-sm">Certificate is ready!</h5>
                    <p className="text-xs text-amber-800/80 mt-1 max-w-[85%]">
                      Your certificate of completion has been generated successfully.
                    </p>
                    <button
                      onClick={() => setShowVerificationWarning(true)}
                      className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md shadow-yellow-600/10"
                    >
                      <Award size={16} /> View Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <Link
                to={`/courses/${course.id}/learn`}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition text-center text-sm shadow-md flex items-center justify-center"
              >
                Go to Course Player
              </Link>
              <button
                onClick={() => setShowMetricsModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Full Screen Certificate Viewer Modal */}
      {showCertificate && metricsData?.certificate_pdf_url && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-accent">Your Course Certificate</h2>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-12">
              <div className="max-w-4xl mx-auto">
                <Certificate
                  learnerName={user?.full_name || user?.username || "SVARP Learner"}
                  courseName={course.title}
                  certificateId={metricsData.certificate_id || `SV-${course.id}-${user?.id || "PRO"}`}
                  date={new Date(metricsData.completion_date || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  isHonour={course.progress >= 75}
                  qrImageUrl={getSecureVideoUrl(metricsData.certificate_pdf_url.replace(".pdf", ".png"))}
                  profilePictureUrl={metricsData.profile_picture_url}
                />
                
                <div className="mt-12 text-center">
                  <a
                    href={`${getSecureVideoUrl(metricsData.certificate_pdf_url)}&download=true`}
                    download="Certificate.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:bg-primary hover:text-accent transition-luxury"
                  >
                    <Download size={20} /> Download Official PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Verification Warning Modal */}
      {showVerificationWarning && createPortal(
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.stopPropagation();
            setTimeout(() => setShowVerificationWarning(false), 100);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative text-center border border-gray-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 mx-auto mb-4">
              <Award className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-accent mb-2">
              Profile Incomplete
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              please complete profile on svarp.org, by registering same email to generate certificate
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://svarp.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent hover:bg-opacity-95 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-accent/10"
                onClick={(e) => e.stopPropagation()}
              >
                Go to svarp.org
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeout(() => setShowVerificationWarning(false), 100);
                }}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 py-3 rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CourseCard;
