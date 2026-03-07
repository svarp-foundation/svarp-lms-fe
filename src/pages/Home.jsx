import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";
import CourseCard from "../components/CourseCard";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching public courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* 1. HERO SECTION */}
      <div className="bg-accent text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <div className="bg-white text-gray-900 p-8 rounded-lg shadow-2xl max-w-lg">
              <h1 className="text-4xl font-bold mb-4">
                Your career companion is here
              </h1>
              <p className="text-lg mb-6 text-gray-700">
                Get ahead with structured courses, interactive content, and
                verifiable certifications — all in one place.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-accent text-white font-bold rounded hover:bg-opacity-90 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-gray-900 text-gray-900 font-bold rounded hover:bg-gray-100 transition-colors"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            {/* Abstract Hero Image Placeholder */}
            <div className="w-96 h-96 bg-primary rounded-full opacity-20 blur-3xl absolute -top-10 -right-10"></div>
            <div className="w-80 h-80 bg-white rounded-full opacity-10 blur-2xl absolute bottom-0 left-20"></div>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Student learning"
              className="relative z-10 rounded-lg shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 2. TRUSTED BY SECTION */}
      <div className="bg-muted py-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 font-medium mb-6">
            Trusted by leading companies around the world
          </p>
          {/* <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-60 grayscale">
            <span className="text-xl font-bold font-serif text-gray-600">
              VolksWagen
            </span>
            <span className="text-xl font-bold font-sans text-gray-600">
              SAMSUNG
            </span>
            <span className="text-xl font-bold font-mono text-gray-600">
              Cisco
            </span>
            <span className="text-xl font-bold font-serif text-gray-600 italic">
              Vimeo
            </span>
            <span className="text-xl font-bold font-sans text-gray-600">
              P&G
            </span>
            <span className="text-xl font-bold font-mono text-gray-600">
              Citi
            </span>
          </div> */}
        </div>
      </div>

      {/* 3. COURSES SECTION (Skills to transform...) */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Skills to transform your career and life
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          From critical skills to technical topics, SVARP supports your
          professional development.
        </p>

        {/* Fake Tabs */}
        {/* <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto pb-2">
          <button className="font-bold text-gray-900 border-b-2 border-gray-900 pb-2 whitespace-nowrap">
            Latest Courses
          </button>
          <button className="font-medium text-gray-500 hover:text-gray-900 pb-2 whitespace-nowrap">
            IT Certifications
          </button>
          <button className="font-medium text-gray-500 hover:text-gray-900 pb-2 whitespace-nowrap">
            Web Development
          </button>
          <button className="font-medium text-gray-500 hover:text-gray-900 pb-2 whitespace-nowrap">
            Leadership
          </button>
        </div> */}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} isPublic={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">
              No courses available publicly right now.
            </p>
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-8">
            <Link
              to="/login"
              className="px-6 py-3 border border-gray-900 font-bold text-gray-900 hover:bg-gray-100 transition inline-block rounded"
            >
              Show all courses
            </Link>
          </div>
        )}
      </div>

      {/* 4. FEATURE SECTION (Dark) */}
      <div className="bg-accent text-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="text-primary text-3xl mb-2">🚀</div>
                <h3 className="font-bold mb-1">Career Growth</h3>
                <p className="text-sm text-gray-300">
                  Advance with premium content.
                </p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm mt-8">
                <div className="text-primary text-3xl mb-2">🏆</div>
                <h3 className="font-bold mb-1">Certified</h3>
                <p className="text-sm text-gray-300">Earn recognized badges.</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Reimagine your career in the AI era
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Future-proof your skills with our Personal Plan. Get access to a
              variety of fresh content from real-world experts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="bg-white text-accent rounded-full p-1 text-xs">
                  ✓
                </span>
                <span className="font-medium">Learn AI and more</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-accent rounded-full p-1 text-xs">
                  ✓
                </span>
                <span className="font-medium">Prep for a certification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-accent rounded-full p-1 text-xs">
                  ✓
                </span>
                <span className="font-medium">Practice with AI coaching</span>
              </div>
            </div>
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-accent font-bold rounded hover:bg-primary transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* 5. TESTIMONIALS */}
      <div className="bg-muted py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">
            See what others are achieving through learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded border border-gray-200 shadow-sm"
              >
                <div className="text-4xl text-gray-900 mb-4">“</div>
                <p className="text-gray-700 mb-6">
                  Because of this platform, I was able to clear my two
                  interviews... Thanks for making such wonderful content.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      Learner {i}
                    </p>
                    <p className="text-xs text-gray-500">
                      Full Stack Developer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 6. FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SVARP GLOBAL ACADEMY</h3>
            <p className="text-gray-400 text-sm">
              Empowering learners with dynamic progression and verifiable
              achievements. The next generation of organizational learning.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-300">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/courses" className="hover:text-white transition">
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/certifications"
                  className="hover:text-white transition"
                >
                  Certifications
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition">
                  Pricing Options
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-300">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-white transition">
                  Learning Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-300">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SVARP. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-white transition">
              Twitter
            </span>
            <span className="cursor-pointer hover:text-white transition">
              LinkedIn
            </span>
            <span className="cursor-pointer hover:text-white transition">
              GitHub
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
