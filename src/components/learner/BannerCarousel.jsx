import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const BannerCarousel = ({ courses = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (courses.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % courses.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [courses]);

  if (!courses || courses.length === 0) return null;

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % courses.length);
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + courses.length) % courses.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] rounded-2xl border border-white/10 shadow-md">
      {/* Slider Wrapper */}
      <div className="relative w-full min-h-[190px] md:min-h-[220px]">
        {courses.map((course, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={course.id}
              className={`w-full transition-all duration-500 ease-in-out absolute inset-0 ${
                isActive
                  ? "opacity-100 translate-x-0 pointer-events-auto z-10"
                  : idx < activeIndex
                  ? "opacity-0 -translate-x-full pointer-events-none z-0"
                  : "opacity-0 translate-x-full pointer-events-none z-0"
              }`}
            >
              <div className="relative w-full h-full p-6 sm:p-8 flex flex-col justify-center max-w-5xl">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-20 pr-12 md:pr-24">
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 max-w-2xl leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1.5">
                      <Link
                        to={`/courses/${course.id}`}
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
                      >
                        Enroll Now
                      </Link>

                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold text-white">
                        <span className="text-slate-400 font-normal">Price:</span>
                        <span className="text-emerald-400 font-black">
                          {course.is_paid && course.price > 0 ? `₹${course.price}` : "Free"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {courses.length > 1 && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
