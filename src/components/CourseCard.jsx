import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, PlayCircle, Info, CheckCircle, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// Simple global cache to avoid N duplicate requests on page load
let wishlistCache = null;
let wishlistPromise = null;

const CourseCard = ({ course, isPublic = false, enrolled = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

          {/* Enrolled users get Continue button */}
          {enrolled ? (
            <Link
              to={`/courses/${course.id}/learn`}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm text-sm"
            >
              {course.progress === 100 ? (
                <>
                  <CheckCircle size={16} /> Completed
                </>
              ) : (
                <>
                  <PlayCircle size={16} /> Continue
                </>
              )}
            </Link>
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
    </div>
  );
};

export default CourseCard;
