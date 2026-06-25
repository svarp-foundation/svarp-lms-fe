import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setLoadingRecommended(true);
    try {
      // 1. Fetch enrolled courses
      const enrolledRes = await api.get(`/learner/courses`);
      setEnrolledCourses(enrolledRes.data);
      setLoading(false);

      // 2. Fetch public courses
      const publicRes = await api.get(`/public/courses`, { params: { limit: 100 } });
      
      // 3. Filter out already enrolled courses for recommendations
      const enrolledIds = enrolledRes.data.map(c => c.id);
      const recommended = publicRes.data.filter(c => !enrolledIds.includes(c.id));
      setRecommendedCourses(recommended.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setLoadingRecommended(false);
    }
  };

  const inProgressCourses = enrolledCourses.filter((course) => course.progress < 100);
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Approx card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <LearnerLayout>
      {/* Welcome banner */}
      <div className="w-full bg-accent text-white page-padding relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back,
            {user?.full_name ? ` ${user.full_name.split(" ")[0]}` : " Learner"}!
          </h1>
          <p className="text-gray-300 text-sm mt-2 max-w-md">
            Your progress is looking great. Ready to dive back in?
          </p>
        </div>
      </div>

      <div className="page-padding max-w-7xl mx-auto">
        {/* SECTION 1: In Progress */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            In Progress / Resume Learning
          </h2>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : inProgressCourses.length > 0 ? (
            <div className="responsive-grid">
              {inProgressCourses.map((course) => (
                <CourseCard key={course.id} course={course} enrolled={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">
                You don't have any courses in progress.
              </p>
              <Link to="/" className="text-primary font-bold mt-2 inline-block">
                Browse Courses
              </Link>
            </div>
          )}
        </section>

        {/* SECTION 2: Recommended Courses */}
        <section className="mb-12 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Recommended Courses
            </h2>
            {recommendedCourses.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCarousel("left")}
                  className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm focus:outline-none"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm focus:outline-none"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {loadingRecommended ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recommendedCourses.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
            >
              {recommendedCourses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-80 md:w-96">
                  <CourseCard course={course} enrolled={false} isPublic={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">
                You have enrolled in all available courses!
              </p>
            </div>
          )}
        </section>
      </div>
    </LearnerLayout>
  );
};

export default Dashboard;
