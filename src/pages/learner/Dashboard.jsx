import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Banner Carousel Component ───────────────────────────────────────────────
const BannerCarousel = ({ courses }) => {
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
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] border-b border-white/10 shadow-lg">
      {/* Slider Wrapper */}
      <div className="relative w-full min-h-[240px] md:min-h-[260px]">
        {courses.map((course, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={course.id}
              className={`w-full transition-all duration-700 ease-in-out absolute inset-0 ${
                isActive
                  ? "opacity-100 translate-x-0 pointer-events-auto z-10"
                  : idx < activeIndex
                  ? "opacity-0 -translate-x-full pointer-events-none z-0"
                  : "opacity-0 translate-x-full pointer-events-none z-0"
              }`}
            >
              <div className="relative w-full h-full page-padding py-6 md:py-8 flex flex-col justify-center max-w-7xl mx-auto">
                {/* Background Ambient Glow Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-20 pr-12 md:pr-28">
                  {/* Left Column: Text & CTA */}
                  <div className="flex-1 min-w-0 space-y-3">

                    {/* Course Title */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight line-clamp-2 drop-shadow-sm">
                      {course.title}
                    </h3>

                    {/* Course Description */}
                    <p className="text-gray-300 text-xs md:text-sm font-medium line-clamp-2 max-w-2xl leading-relaxed">
                      {course.description}
                    </p>

                    {/* Action Bar: Button + Price Pill */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-emerald-300 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs md:text-sm transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-95"
                      >
                        Enroll Now
                      </Link>
                      
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs md:text-sm font-extrabold text-white">
                        <span className="text-gray-400 text-xs font-semibold">Price:</span>
                        <span className="text-primary font-black">
                          {course.is_paid ? `₹${course.price}` : "Free"}
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

      {/* Top-Right Navigation Controls */}
      {courses.length > 1 && (
        <div className="absolute top-4 right-4 md:right-8 z-30 flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-sm"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Slide Indicators */}
      {courses.length > 1 && (
        <div className="absolute bottom-4 right-6 md:right-12 z-30 flex items-center gap-1.5">
          {courses.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-primary shadow-sm shadow-primary/50"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [newLaunchedCourses, setNewLaunchedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const hasShown = sessionStorage.getItem(`welcome_shown_${user.id}`);
      if (!hasShown) {
        setShowWelcome(true);
        sessionStorage.setItem(`welcome_shown_${user.id}`, "true");
      }
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setLoadingRecommended(true);
    try {
      // Fetch enrolled courses and public courses in parallel
      const [enrolledRes, publicRes] = await Promise.all([
        api.get(`/learner/courses`),
        api.get(`/public/courses`, { params: { limit: 100 } }),
      ]);

      const enrolledData = enrolledRes.data || [];
      const publicData = publicRes.data || [];

      setEnrolledCourses(enrolledData);
      setLoading(false);

      // Filter out already enrolled courses for recommendations
      const enrolledIds = enrolledData.map((c) => c.id);
      const recommended = publicData.filter((c) => !enrolledIds.includes(c.id));
      setRecommendedCourses(recommended.slice(0, 3));

      // Get top 3 newly launched courses (sorted by id descending) that are not enrolled
      const sortedNew = [...publicData]
        .sort((a, b) => b.id - a.id)
        .filter((c) => !enrolledIds.includes(c.id));
      setNewLaunchedCourses(sortedNew.slice(0, 3));
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
      {showWelcome && (
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
      )}

      {/* Featured Banner Carousel (Full width, no sides white space) */}
      {!loading && inProgressCourses.length === 0 && newLaunchedCourses.length > 0 && (
        <BannerCarousel courses={newLaunchedCourses} />
      )}

      <div className="page-padding max-w-7xl mx-auto mt-8">
        {/* SECTION 1: In Progress */}
        {(loading || inProgressCourses.length > 0 || newLaunchedCourses.length === 0) && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              In Progress / Resume Learning
            </h2>

            {loading ? (
              <CourseGridSkeleton count={3} />
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
        )}

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
            <CourseGridSkeleton count={3} />
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
// Trigger HMR rebuild
