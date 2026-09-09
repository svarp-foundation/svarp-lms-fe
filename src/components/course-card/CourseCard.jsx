import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, Heart, Share2 } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import CourseMetricsModal from "./CourseMetricsModal";
import ShareModal from "../ShareModal";
import { CourseThumbnail } from "../common";

export const CourseCard = ({ course, enrolled = false }) => {
  const navigate = useNavigate();
  const { isWishlisted, loading: wishlistLoading, toggleWishlist } = useWishlist(course.id);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleWishlistClick = async (e) => {
    const res = await toggleWishlist(e);
    if (res?.requiresAuth) {
      navigate("/login");
    }
  };

  const isCompleted = course.is_completed || (course.progress && course.progress >= 100);
  const progressPct = course.progress ?? 0;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
        <div>
          {/* Card Thumbnail */}
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
            <Link to={`/courses/${course.id}`} className="block w-full h-full">
              <CourseThumbnail
                thumbnailUrl={course.thumbnail_url}
                title={course.title}
              />
            </Link>

            {/* Top Right Quick Actions */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={handleWishlistClick}
                disabled={wishlistLoading}
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all ${
                  isWishlisted
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-black/40 text-white hover:bg-black/60"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={15}
                  className={isWishlisted ? "fill-white" : ""}
                />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowShareModal(true);
                }}
                className="w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-xs transition-all"
                title="Share Course"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-2">
            <Link to={`/courses/${course.id}`}>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                {course.title}
              </h3>
            </Link>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {course.description || "Master these industry-relevant skills with structured curricula."}
            </p>

            {/* Progress bar if enrolled */}
            {enrolled && (
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Progress</span>
                  <span className="text-emerald-700">{Math.round(progressPct)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, progressPct)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & CTA button */}
        <div className="p-4 pt-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {enrolled ? (
              <span className="text-[11px] font-bold text-emerald-700">
                {isCompleted ? "Completed" : "In Progress"}
              </span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-slate-900">
                  {course.is_paid && course.price > 0 ? `₹${course.price}` : "Free"}
                </span>
                {course.original_price && course.original_price > course.price && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ₹{course.original_price}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowMetricsModal(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="View Syllabus Overview"
            >
              <Info size={16} />
            </button>

            <Link
              to={enrolled ? `/courses/${course.id}/learn` : `/courses/${course.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f3b45] hover:bg-[#152930] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{enrolled ? "Continue" : "View"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Modal */}
      <CourseMetricsModal
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        course={course}
      />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          course={course}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default CourseCard;
