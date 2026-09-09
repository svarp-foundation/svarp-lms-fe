import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { getMediaUrl } from "../../config";
import LearnerLayout from "../../components/LearnerLayout";
import { useAuth } from "../../context/AuthContext";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { Heart, BookOpen, Trash2, PlayCircle } from "lucide-react";

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/learner/wishlist`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (courseId) => {
    setRemoving(courseId);
    try {
      await api.delete(`/learner/wishlist/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <LearnerLayout>
      {/* Page Header Banner */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] text-white border-b border-white/10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="page-padding py-8 md:py-10 max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Wishlist
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Curate and save courses you are interested in exploring next.
            </p>
          </div>
        </div>
      </div>

      <div className="page-padding py-8 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <CourseGridSkeleton count={4} />
        ) : courses.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 sm:p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-red-400 border border-red-100">
              <Heart size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-md">
              Browse our course catalog and click the heart icon on any card to save courses you'd like to take later.
            </p>
            <Link
              to="/courses-catalog"
              className="inline-flex items-center gap-2 bg-accent hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <BookOpen size={16} />
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="responsive-grid">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 hover:border-slate-300 overflow-hidden flex flex-col transition-all duration-200 group"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-[16/10] bg-slate-900 relative overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {course.thumbnail_url ? (
                    <img
                      src={getMediaUrl(course.thumbnail_url)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <PlayCircle size={40} />
                    </div>
                  )}

                  {/* Price badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-100">
                    {course.is_paid ? `₹${course.price}` : "Free"}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                    SVARP Academy
                  </span>
                  <h3
                    className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 mb-1 cursor-pointer group-hover:text-primary transition-colors leading-snug"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="flex-1 bg-accent hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-sm"
                    >
                      View Course
                    </button>
                    <button
                      onClick={() => handleRemove(course.id)}
                      disabled={removing === course.id}
                      title="Remove from wishlist"
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition flex-shrink-0 disabled:opacity-40"
                    >
                      {removing === course.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default Wishlist;
