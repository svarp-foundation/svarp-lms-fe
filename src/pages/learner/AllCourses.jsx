import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Search, X, Sparkles } from "lucide-react";

const AllCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const publicPromise = api.get(`/public/courses`, {
        params: { search: debouncedSearch, limit: 100 },
      });
      const enrollPromise = user ? api.get(`/learner/courses`) : Promise.resolve({ data: [] });

      const [res, enrollRes] = await Promise.all([publicPromise, enrollPromise]);
      setCourses(res.data || []);
      if (user) {
        setEnrolledCourses(enrollRes.data || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <LearnerLayout>
      {/* Page Header Banner */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] text-white border-b border-white/10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="page-padding py-8 md:py-10 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-400/30 mb-3">
                <Sparkles size={12} />
                Course Catalog
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <BookOpen size={28} className="text-primary flex-shrink-0" />
                Explore Courses
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Discover new skills and knowledge. Search through our catalog of
                industry-standard courses.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-80 lg:w-96">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:bg-white/15 transition-all shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-padding py-8 max-w-7xl mx-auto space-y-6">
        {/* Results count & status */}
        {!loading && (
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              {search
                ? `Showing results for "${search}" (${courses.length})`
                : `All Courses (${courses.length})`}
            </span>
          </div>
        )}

        {loading ? (
          <CourseGridSkeleton count={8} />
        ) : courses.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 sm:p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              No courses found
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-md">
              We couldn't find any courses matching "{search}". Try searching with different keywords.
            </p>
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-2 bg-accent hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="responsive-grid">
            {courses.map((course) => {
              const enrolledCourse = enrolledCourses.find((c) => c.id === course.id);
              const isEnrolled = !!enrolledCourse;
              const courseData = isEnrolled
                ? { ...course, progress: enrolledCourse.progress }
                : course;
              return (
                <CourseCard
                  key={course.id}
                  course={courseData}
                  isPublic={true}
                  enrolled={isEnrolled}
                />
              );
            })}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default AllCourses;
