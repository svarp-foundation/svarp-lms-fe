import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { useAuth } from "../../context/AuthContext";
import { BannerCarousel } from "../../components/learner";
import { PageHeader, EmptyState, Button } from "../../components/common";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const publicPromise = api.get("/public/courses?limit=8");
      const enrollPromise = user
        ? api.get("/learner/courses")
        : Promise.resolve({ data: [] });

      const [pubRes, enrRes] = await Promise.all([publicPromise, enrollPromise]);
      setFeaturedCourses(pubRes.data || []);
      setEnrolledCourses(enrRes.data || []);
    } catch (err) {
      console.error("Error loading learner dashboard courses:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardCourses();
  }, [fetchDashboardCourses]);

  return (
    <LearnerLayout>
      <div className="space-y-8">
        {/* Top Banner Hero Slider */}
        {featuredCourses.length > 0 && (
          <BannerCarousel courses={featuredCourses.slice(0, 4)} />
        )}

        {/* My Enrolled Learning Courses */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                My Enrolled Courses
              </h2>
              <p className="text-xs text-slate-500">
                Continue where you left off in your learning path
              </p>
            </div>

            {enrolledCourses.length > 0 && (
              <span className="text-xs font-semibold text-slate-500">
                {enrolledCourses.length} active
              </span>
            )}
          </div>

          {loading ? (
            <CourseGridSkeleton count={3} />
          ) : enrolledCourses.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No courses enrolled yet"
              description="Explore our curated catalog to start learning high-demand industry skills."
              actionLabel="Explore Course Catalog"
              onAction={() => {}}
              actionIcon={BookOpen}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Explore More Courses */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Featured Courses
              </h2>
              <p className="text-xs text-slate-500">
                Expand your knowledge with these structured curricula
              </p>
            </div>

            <Link
              to="/courses-catalog"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Browse all</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <CourseGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredCourses.map((course) => {
                const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrolled={isEnrolled}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </LearnerLayout>
  );
};

export default Dashboard;
