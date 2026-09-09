import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, PlayCircle, Info, CheckCircle, Heart, Award, Download, X, Share2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import API_URL, { getMediaUrl } from "../config";
import Certificate from "./Certificate";
import CertificateModalPreview from "./CertificateModalPreview";
import ShareModal from "./ShareModal";

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
  const [showShareModal, setShowShareModal] = useState(false);

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
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 border border-slate-200/80 hover:border-emerald-300/80 flex flex-col h-full group">
      <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden flex-shrink-0">
        {course.thumbnail_url ? (
          <img
            src={getMediaUrl(course.thumbnail_url)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <GraduationCap size={40} />
          </div>
        )}

        {/* Price / Free badge */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-100">
          {course.discounted_price === 0 ? (
            <span className="text-emerald-700">₹0 (Member)</span>
          ) : course.is_paid ? (
            `₹${course.price}`
          ) : (
            "Free"
          )}
        </span>

        {/* Action icons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Share Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShareModal(true);
            }}
            className="p-1.5 bg-white/90 hover:bg-white text-slate-600 rounded-lg shadow-sm transition-all active:scale-95 border border-slate-100/80"
            title="Share Course"
          >
            <Share2 size={14} />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="p-1.5 bg-white/90 hover:bg-white text-slate-600 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 border border-slate-100/80"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart
              size={14}
              className={isWishlisted ? "fill-red-500 text-red-500" : "text-slate-600"}
            />
          </button>
        </div>

        {/* Enrolled badge */}
        {enrolled && (
          <span className="absolute bottom-2.5 left-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <CheckCircle size={11} /> Enrolled
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
          SVARP Academy
        </span>
        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
          {course.description}
        </p>

        {enrolled && course.progress !== undefined && (
          <div className="mb-3.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-semibold">
              <span>Progress</span>
              <span className="text-slate-700 font-bold">{course.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/80">
          <Link
            to={`/courses/${course.id}`}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-2 px-2 rounded-xl font-semibold transition text-xs"
          >
            <Info size={14} /> Overview
          </Link>

          {/* Enrolled users get Continue/Completed button */}
          {enrolled ? (
            course.progress === 100 ? (
              <button
                onClick={handleCompletedClick}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl font-semibold transition text-xs shadow-sm"
              >
                <CheckCircle size={14} /> Completed
              </button>
            ) : (
              <Link
                to={`/courses/${course.id}/learn`}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl font-semibold transition text-xs shadow-sm"
              >
                <PlayCircle size={14} /> Continue
              </Link>
            )
          ) : !isPublic ? (
            <Link
              to={`/courses/${course.id}/learn`}
              className="flex items-center justify-center gap-1.5 bg-accent hover:bg-slate-800 text-white py-2 px-2 rounded-xl font-semibold transition text-xs shadow-sm"
            >
              <PlayCircle size={14} /> Resume
            </Link>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="flex items-center justify-center gap-1.5 bg-accent hover:bg-slate-800 text-white py-2 px-2 rounded-xl font-semibold transition text-xs shadow-sm"
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
        <div className="fixed inset-0 z-[10000] flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-accent">Your Course Certificate</h2>
            <div className="flex items-center gap-4">
              <a
                href={`${getSecureVideoUrl(metricsData.certificate_pdf_url)}&download=true`}
                download="Certificate.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-opacity-95 transition whitespace-nowrap flex-shrink-0"
              >
                <Download size={14} /> Download PDF
              </a>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <CertificateModalPreview>
            <Certificate
              learnerName={user?.full_name || user?.username || "SVARP Learner"}
              courseName={course.title}
              certificateId={metricsData.certificate_code || metricsData.certificate_id || `SV-${course.id}-${user?.id || "PRO"}`}
              date={new Date(metricsData.completion_date || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              isHonour={course.progress >= 75}
              qrImageUrl={getSecureVideoUrl(metricsData.certificate_pdf_url.replace(".pdf", ".png"))}
              profilePictureUrl={getSecureVideoUrl(metricsData.profile_picture_url || "/media/profile-picture")}
            />
          </CertificateModalPreview>
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        courseTitle={course.title}
        courseUrl={`${window.location.origin}/courses/${course.id}`}
      />
    </div>
  );
};

export default CourseCard;
