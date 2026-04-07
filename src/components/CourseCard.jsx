import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, PlayCircle, Info, CheckCircle } from "lucide-react";

const CourseCard = ({ course, isPublic = false, enrolled = false }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-md overflow-hidden hover-lift transition-luxury border border-gray-100 flex flex-col h-full group">
      <div className="h-44 bg-gray-200 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

        <span className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded text-xs font-bold text-gray-800 shadow-sm">
          {course.status === "published" ? "Course" : "Draft"}
        </span>

        {/* Enrolled badge */}
        {enrolled && (
          <span className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow">
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
              <PlayCircle size={16} /> Continue
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
