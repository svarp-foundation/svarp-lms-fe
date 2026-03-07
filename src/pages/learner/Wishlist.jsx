import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import { useAuth } from "../../context/AuthContext";
import { Heart, BookOpen, Trash2, PlayCircle } from "lucide-react";

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null); // courseId being removed

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
      {/* Page header banner */}
      <div className="w-full bg-accent text-white px-8 py-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Heart size={26} className="text-red-400 fill-red-400" />
          My Wishlist
        </h1>
        <p className="text-gray-300 text-sm mt-1">
          Courses you've saved for later.
        </p>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <Heart size={36} className="text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Browse our courses and click the heart icon to save courses you'd
              like to take later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition"
            >
              <BookOpen size={18} />
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-video bg-accent relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle size={40} className="text-white/60" />
                    </div>
                  )}
                  {/* Paid badge */}
                  {course.is_paid && (
                    <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ₹{course.price}
                    </span>
                  )}
                  {!course.is_paid && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-4">
                    {course.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded-lg hover:bg-opacity-90 transition"
                    >
                      View Course
                    </button>
                    <button
                      onClick={() => handleRemove(course.id)}
                      disabled={removing === course.id}
                      title="Remove from wishlist"
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition flex-shrink-0 disabled:opacity-40"
                    >
                      {removing === course.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={15} />
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
