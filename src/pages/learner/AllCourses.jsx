import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Search } from "lucide-react";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/courses`, {
        params: { search: debouncedSearch, limit: 100 },
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <LearnerLayout>
      {/* Page header banner */}
      <div className="w-full bg-accent text-white px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen size={28} className="text-primary" />
              Explore Courses
            </h1>
            <p className="text-gray-300 text-sm mt-2 max-w-lg">
              Discover new skills and knowledge. Search through our catalog of
              expertly crafted courses.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
              <Search size={36} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No courses found
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              We couldn't find any courses matching "{search}". Try adjusting
              your search terms.
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-primary font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} isPublic={true} />
            ))}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default AllCourses;
