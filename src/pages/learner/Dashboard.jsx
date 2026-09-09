import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, GraduationCap } from "lucide-react";

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
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] border-b border-white/10 shadow-md">
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
              <div className="relative w-full h-full page-padding py-5 md:py-7 flex flex-col justify-center max-w-7xl mx-auto">
                {/* Background Ambient Glow Effects */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-20 pr-12 md:pr-24">
                  {/* Left Column: Text & CTA */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Course Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight line-clamp-2 drop-shadow-sm">
                      {course.title}
                    </h3>

                    {/* Course Description */}
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 max-w-2xl leading-relaxed">
                      {course.description}
                    </p>

                    {/* Action Bar: Button + Price Pill */}
                    <div className="flex flex-wrap items-center gap-3 pt-1.5">
                      <Link
                        to={`/courses/${course.id}`}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-emerald-300 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-primary/20 active:scale-95"
                      >
                        Enroll Now
                      </Link>
                      
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white">
                        <span className="text-slate-400 font-normal">Price:</span>
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
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-sm"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Slide Indicators */}
      {courses.length > 1 && (
        <div className="absolute bottom-3 right-6 md:right-12 z-30 flex items-center gap-1.5">
          {courses.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-5 bg-primary shadow-sm shadow-primary/50"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
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
      setRecommendedCourses(recommended.slice(0, 6));

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
      const scrollAmount = 300; // Card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <LearnerLayout>
      {/* Featured Banner Carousel */}
      {!loading && inProgressCourses.length === 0 && newLaunchedCourses.length > 0 && (
        <BannerCarousel courses={newLaunchedCourses} />
      )}

      <div className="page-padding max-w-7xl mx-auto space-y-8">
        {/* Welcome Greeting Card */}
        {showWelcome && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent via-[#172e38] to-[#0f172a] text-white p-6 sm:p-7 border border-white/10 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Welcome back, {user?.full_name ? user.full_name.split(" ")[0] : "Learner"}!
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
                  Continue where you left off or discover new courses.
                </p>
              </div>
              <Link
                to="/courses-catalog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all self-start sm:self-auto"
              >
                <BookOpen size={14} />
                Explore Catalog
              </Link>
            </div>
          </div>
        )}

        {/* SECTION 1: In Progress / Enrolled */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={20} className="text-accent" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                In Progress & Enrolled Courses
              </h2>
            </div>
            {enrolledCourses.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? "Course" : "Courses"}
              </span>
            )}
          </div>

          {loading ? (
            <CourseGridSkeleton count={4} />
          ) : enrolledCourses.length > 0 ? (
            <div className="responsive-grid">
              {enrolledCourses.map((course) => (
                <CourseCard key={course.id} course={course} enrolled={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <GraduationCap size={24} />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">No enrolled courses yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Explore our catalog of certified courses and start learning today.
              </p>
              <Link
                to="/courses-catalog"
                className="inline-flex items-center gap-2 bg-accent hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </section>

        {/* SECTION 2: Recommended Courses */}
        <section className="relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Recommended For You
              </h2>
            </div>
            {recommendedCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <Link
                  to="/courses-catalog"
                  className="text-xs font-semibold text-slate-500 hover:text-accent mr-2 hidden sm:inline-block"
                >
                  View All &rarr;
                </Link>
                <button
                  onClick={() => scrollCarousel("left")}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {loadingRecommended ? (
            <CourseGridSkeleton count={4} />
          ) : recommendedCourses.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 scroll-smooth"
            >
              {recommendedCourses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
                  <CourseCard course={course} enrolled={false} isPublic={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 text-center">
              <p className="text-xs text-slate-500">
                You are enrolled in all available courses!
              </p>
            </div>
          )}
        </section>
      </div>
    </LearnerLayout>
  );
};

export default Dashboard;
