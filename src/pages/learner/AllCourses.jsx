import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { PageHeader, SearchBar, EmptyState } from "../../components/common";
import { BookOpen } from "lucide-react";

const AllCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const publicPromise = api.get(`/public/courses`, {
        params: { search: debouncedSearch, limit: 100 },
      });
      const enrollPromise = user
        ? api.get(`/learner/courses`)
        : Promise.resolve({ data: [] });

      const [res, enrollRes] = await Promise.all([publicPromise, enrollPromise]);
      setCourses(res.data || []);
      if (user) {
        setEnrolledCourses(enrollRes.data || []);
      }
    } catch (err) {
      console.error("Error fetching catalog courses:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <LearnerLayout>
      <div className="space-y-6">
        <PageHeader
          title="Explore Course Catalog"
          subtitle="Discover curated educational programs and structured learning tracks"
          actions={
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog courses..."
              className="w-full sm:w-72"
            />
          }
        />

        {/* Results Header */}
        {!loading && (
          <div className="text-xs text-slate-500 font-semibold">
            <span>
              Showing {courses.length} {courses.length === 1 ? "course" : "courses"}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </span>
          </div>
        )}

        {/* Course Cards Grid */}
        {loading ? (
          <CourseGridSkeleton count={8} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No matching courses found"
            description={
              search
                ? `No courses match "${search}". Try searching with different keywords.`
                : "No courses currently available in the catalog."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => {
              const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={isEnrolled}
                  isPublic={true}
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
