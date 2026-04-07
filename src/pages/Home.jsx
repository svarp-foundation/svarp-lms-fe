import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";
import {
  CheckCircle,
  ShieldCheck,
  Award,
  Globe,
  BarChart3,
  Users,
  Zap,
  ChevronRight,
  Search,
  BookOpen,
  Layout,
  Clock,
  ExternalLink,
  Smartphone,
  Languages,
} from "lucide-react";
import { ReactLenis } from "lenis/react";

/**
 * Premium Landing Page for SVARP Global Academy
 */
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
        // Stay on home for now or go to dashboard
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      // The backend requires authentication even for the public courses endpoint.
      // To avoid 401 console errors for guests, only fetch if user is present.
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/public/courses");
        setCourses(response.data);
      } catch (error) {
        // Silently handle 401 or auth errors for public endpoint
        if (
          error.response?.status !== 401 &&
          error.message !== "No refresh token"
        ) {
          console.error("Error fetching public courses:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [loading, courses]);

  const features = [
    {
      title: "Verified Learner Identity",
      desc: "Complete government ID and photo validation ensures authenticity.",
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    },
    {
      title: "Secure Certification",
      desc: "QR-based, tamper-proof certificates with unique IDs and photos.",
      icon: <Award className="w-8 h-8 text-primary" />,
    },
    {
      title: "Advanced Assessments",
      desc: "Structured tests with randomized questions and strict final exams.",
      icon: <Zap className="w-8 h-8 text-primary" />,
    },
    {
      title: "Global Verification",
      desc: "Anyone can instantly verify certificates through our public portal.",
      icon: <Globe className="w-8 h-8 text-primary" />,
    },
  ];

  const membershipTypes = [
    {
      name: "Student",
      price: "Flexible",
      icon: <BookOpen />,
      benefits: ["Course access", "Verified IDs"],
    },
    {
      name: "Annual",
      price: "$199/yr",
      icon: <Clock />,
      benefits: ["Full catalog", "Priority support"],
    },
    {
      name: "Corporate",
      price: "Custom",
      icon: <Users />,
      benefits: ["Batch enrollment", "Analytics"],
    },
    {
      name: "Lifetime",
      price: "$499",
      icon: <Award />,
      benefits: ["Permanent access", "All future updates"],
    },
  ];

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-muted text-gray-900 overflow-x-hidden selection:bg-primary/30">
        {/* 1. HERO SECTION */}
        <section className="relative section-padding px-6 overflow-hidden min-h-[80vh] flex items-center">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(155,207,155,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent font-medium text-sm mb-6 animate-float">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Global Learning Platform</span>
              </div>
              <div className="reveal">
                <h1 className="fluid-h1 font-bold text-accent mb-6 leading-tight">
                  Empowering Excellence, <br />
                  <span className="text-primary italic">Verified</span>{" "}
                  Achievement.
                </h1>
                <p className="fluid-p text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  SVARP Global Academy ensures authentic identity, structured
                  learning, and tamper-proof certification for professionals and
                  institutions worldwide.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-accent text-white font-bold rounded-xl hover-lift shadow-lg flex items-center gap-2 group transition-luxury"
                  >
                    Join the Academy
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/courses-catalog"
                    className="px-8 py-4 bg-white border border-gray-200 text-accent font-bold rounded-xl hover-lift shadow-sm transition-luxury"
                  >
                    Browse Courses
                  </Link>
                </div>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium reveal reveal-delay-200">
                <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>QR Verification</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>LMS Analytics</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Strict Mode Exams</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-xl lg:max-w-none reveal reveal-delay-300">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white hover:scale-[1.03] transition-luxury">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Digital Learning Platform"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-accent/40 to-transparent"></div>

                {/* Floating Stat Card */}
                <div className="absolute bottom-6 left-6 right-6 glass p-6 rounded-2xl flex items-center justify-between text-white transition-luxury hover:scale-105">
                  <div>
                    <p className="text-xs opacity-90 uppercase tracking-widest mb-1 font-bold">
                      Total Certificates Issued
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      128,450+
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-400 overflow-hidden hover:z-20 hover:scale-110 transition-transform"
                      >
                        <img
                          src={`https://i.pravatar.cc/100?img=${i + 15}`}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-xs flex items-center justify-center font-bold text-accent shadow-sm">
                      +5k
                    </div>
                  </div>
                </div>
              </div>

              {/* Background elements for image */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* 2. WHY CHOOSE SVARP */}
        <section className="section-padding px-6 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal">
              <h2 className="fluid-h2 font-bold text-accent mb-4 tracking-tight">
                Why Choose SVARP Global Academy
              </h2>
              <p className="fluid-p text-gray-600 max-w-3xl mx-auto">
                Our LMS ensures authentic learner identity, structured learning,
                and tamper-proof certification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className={`p-8 rounded-3xl bg-muted border border-gray-100 hover-lift group reveal reveal-delay-${(idx % 4) * 100}`}
                >
                  <div className="mb-6 p-4 rounded-2xl bg-white shadow-sm inline-block group-hover:bg-primary/20 transition-luxury">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-accent group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SMART ASSESSMENT SYSTEM */}
        <section className="section-padding px-6 bg-accent text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform origin-top translate-x-1/3"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-primary font-bold text-sm mb-6 border border-white/10">
                <Zap className="w-5 h-5" />
                <span>ADVANCED EXAMINATION ENGINE</span>
              </div>
              <h2 className="fluid-h2 font-bold mb-8 leading-tight tracking-tight">
                Uncompromising Quality in <br />
                <span className="text-primary italic underline decoration-primary/30 underline-offset-8">
                  Continuous Assessment
                </span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Continuous Learning",
                    desc: "Topic, Chapter, and Module level checks with instant feedback.",
                  },
                  {
                    title: "Strict Mode Final Exams",
                    desc: "Single attempt, time-limited, and screen-locked to prevent cheating.",
                  },
                  {
                    title: "Intelligent Question Bank",
                    desc: "50% Easy, 25% Moderate, 25% Difficult randomized selection.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex gap-5 p-5 rounded-2xl hover:bg-white/5 transition-luxury border border-transparent hover:border-white/10 reveal reveal-delay-${(i + 1) * 100}`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-accent flex items-center justify-center font-extrabold shadow-lg shadow-primary/20">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1 group-hover:text-primary">
                        {item.title}
                      </h4>
                      <p className="text-gray-400 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 reveal reveal-delay-200">
              <div className="space-y-6">
                <div className="aspect-square glass rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-float group hover:scale-105 transition-luxury">
                  <div className="bg-primary/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Search className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Randomized Questions</h4>
                </div>
                <div className="aspect-[4/3] glass rounded-3xl flex flex-col items-center justify-center p-8 text-center group hover:scale-105 transition-luxury">
                  <div className="bg-primary/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Time Limit Control</h4>
                </div>
              </div>
              <div className="space-y-6 translate-y-12">
                <div className="aspect-[3/4] glass rounded-3xl flex flex-col items-center justify-center p-8 text-center group hover:scale-105 transition-luxury">
                  <div className="bg-primary/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Anti-Cheating Tech</h4>
                </div>
                <div className="aspect-square glass rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-float delay-700 group hover:scale-105 transition-luxury">
                  <div className="bg-primary/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Live Analytics</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COURSES & LEARNING MODEL */}
        <section className="section-padding px-6 bg-muted">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 reveal">
              <div className="md:w-1/2">
                <h2 className="fluid-h2 font-bold text-accent mb-4 tracking-tight">
                  Flexible Learning Model
                </h2>
                <p className="fluid-p text-gray-600">
                  Courses tailored for students, professionals, and global
                  learners.
                </p>
              </div>
              <Link
                to="/courses-catalog"
                className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-luxury border-b-2 border-primary pb-1 group"
              >
                View All Courses{" "}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {[
                {
                  title: "Free Courses",
                  sub: "+ Free Certificate",
                  tag: "Open Access",
                  color: "bg-blue-500",
                  desc: "No-cost learning with basic verification.",
                },
                {
                  title: "Free Courses",
                  sub: "+ Paid Certificate",
                  tag: "Professional",
                  color: "bg-primary",
                  desc: "Study for free, pay only for official certification.",
                },
                {
                  title: "Paid Courses",
                  sub: "+ Paid Certificate",
                  tag: "Premium",
                  color: "bg-accent",
                  desc: "Full access to advanced modules and premium support.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-luxury relative overflow-hidden group reveal reveal-delay-100"
                >
                  <div
                    className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-white text-xs font-bold ${card.color} group-hover:px-6 transition-luxury`}
                  >
                    {card.tag}
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-accent group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-primary font-bold mb-6 italic">
                    {card.sub}
                  </p>
                  <p className="text-gray-600 mb-8 font-medium">{card.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Course Completion",
                      "Final Assessment Pass",
                      "Identity Verified",
                    ].map((item, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-accent transition-colors cursor-default"
                      >
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 px-4 bg-muted text-accent font-bold rounded-xl group-hover:bg-primary group-hover:text-accent transition-luxury border border-transparent group-hover:border-primary/20">
                    Learn More
                  </button>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.slice(0, 4).map((course) => (
                  <CourseCard key={course.id} course={course} isPublic={true} />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* 5. CERTIFICATE SHOWCASE */}
        <section className="section-padding px-6 bg-white border-y border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 reveal">
                <div className="relative group perspective-1000">
                  <div className="relative z-10 bg-white p-6 md:p-12 shadow-2xl rounded-2xl border-2 border-gray-50 transform rotate-2 group-hover:rotate-0 transition-luxury overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-accent">
                          Certificate of Achievement
                        </h3>
                        <p className="text-xs text-gray-500 tracking-widest mt-1">
                          SVARP GLOBAL ACADEMY
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-400">
                        QR CODE
                      </div>
                    </div>

                    <div className="text-center mb-10">
                      <p className="text-gray-500 font-medium mb-4 italic">
                        This is to certify that
                      </p>
                      <h4 className="text-3xl font-bold text-accent mb-2">
                        John Doe
                      </h4>
                      <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 border-2 border-primary/20 mb-4 overflow-hidden">
                        <img
                          src="https://i.pravatar.cc/150"
                          alt="Verified Learner"
                        />
                      </div>
                      <p className="text-gray-500 mb-1">
                        has successfully completed the course
                      </p>
                      <h5 className="text-xl font-bold text-primary">
                        Advanced Data Analytics
                      </h5>
                    </div>

                    <div className="flex justify-between items-end border-t border-gray-100 pt-8">
                      <div className="text-[10px] text-gray-400 uppercase">
                        <p className="mb-1">ID: SV-2024-8849</p>
                        <p>Date: March 9, 2026</p>
                      </div>
                      <div className="text-right">
                        <div className="w-auto border-b border-gray-300 mx-auto mb-2 signature-font italic">
                          Mr. Vikash Kumar
                        </div>
                        <p className="text-[10px] uppercase font-bold text-accent">
                          authorized signatory
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Back side hint */}
                  <div className="absolute -bottom-8 -right-8 w-64 glass p-4 rounded-xl shadow-xl transform group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700 z-20">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-primary" />
                      Back-Side Details
                    </h4>
                    <ul className="text-[10px] space-y-1 text-gray-600">
                      <li>• Major Topics Covered</li>
                      <li>• Course Duration (Hours)</li>
                      <li>• Assessment Type</li>
                      <li>• Grading: Pass / With Honour</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 reveal reveal-delay-200">
                <h2 className="fluid-h2 font-bold text-accent mb-6 tracking-tight">
                  Trusted Certificate System
                </h2>
                <p className="fluid-p text-gray-600 mb-8 leading-relaxed">
                  Our certificates meet elite professional standards. Every
                  credential is dual-purpose: a badge of honor for the learner
                  and a verifiable asset for the employer.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[
                    "Learner Photograph",
                    "QR Code Verification",
                    "Unique Certificate ID",
                    "Digital Signature",
                    "Skill-based Grading",
                    "Globally Verifiable",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-accent transition-luxury">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-sm text-gray-700 group-hover/item:text-accent transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-8 rounded-3xl bg-muted border border-primary/20 hover:border-primary/40 transition-luxury shadow-inner">
                  <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Public Verification Portal
                  </h4>
                  <p className="text-sm text-gray-600 mb-6 font-medium">
                    Verify instant credibility using Certificate ID or QR scan.
                  </p>
                  <div className="flex gap-2">
                    <input
                      id="manual-verify-input"
                      type="text"
                      placeholder="Enter Certificate ID"
                      className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary outline-none transition-luxury"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const code = e.target.value.trim();
                          if (code) navigate(`/verify/${code}`);
                        }
                      }}
                    />
                    <button
                      className="px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-primary hover:text-accent transition-luxury shadow-lg shadow-accent/10"
                      onClick={() => {
                        const code = document
                          .getElementById("manual-verify-input")
                          ?.value.trim();
                        if (code) navigate(`/verify/${code}`);
                      }}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. INSTITUTIONS & CORPORATES */}
        <section className="section-padding px-6 bg-[#0f172a] text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(155,207,155,0.05)_0%,transparent_50%)]"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 reveal">
              <h2 className="fluid-h2 font-bold mb-6 tracking-tight">
                Built for Scale & Impact
              </h2>
              <p className="text-gray-400 fluid-p max-w-2xl mx-auto font-medium">
                Custom solutions for government institutions, corporate giants,
                and training workshops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  title: "Institutional",
                  icon: <Globe />,
                  users: "Government / Schools",
                },
                {
                  title: "Enterprise",
                  icon: <ShieldCheck />,
                  users: "Corporates / HR Teams",
                },
                {
                  title: "SkillVerse",
                  icon: <Users />,
                  users: "Training Centers",
                },
              ].map((box, i) => (
                <div
                  key={i}
                  className={`bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-luxury group reveal reveal-delay-${i * 100}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8 animate-float group-hover:scale-110 group-hover:bg-primary group-hover:text-accent transition-luxury">
                    {React.cloneElement(box.icon, { className: "w-8 h-8" })}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {box.title}
                  </h3>
                  <p className="text-gray-400 mb-8 font-medium">{box.users}</p>
                  <ul className="space-y-4 mb-4">
                    {[
                      "Batch Enrollment",
                      "Bulk Certification",
                      "Learning Analytics",
                      "Custom Branding",
                    ].map((item, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-luxury cursor-default"
                      >
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-white/10 pt-20">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">99.9%</p>
                <p className="text-gray-500 text-sm">Platform Uptime</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">GDPR</p>
                <p className="text-gray-500 text-sm">Data Handling</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">15+</p>
                <p className="text-gray-500 text-sm">Languages Supported</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">1M+</p>
                <p className="text-gray-500 text-sm">Question Bank</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. MEMBERSHIP PROGRAMS */}
        <section className="py-24 px-6 bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-muted -z-10"></div>
          <div className="max-w-7xl mx-auto">
            {/* <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-accent mb-4 tracking-tight">
              Unlock Premium Learning
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              Choose a plan that fits your growth journey.
            </p>
          </div> */}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {membershipTypes.map((plan, i) => (
              <div
                key={i}
                className={`bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col hover-lift reveal reveal-delay-${i * 100}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-luxury">
                  {React.cloneElement(plan.icon, { className: "w-7 h-7" })}
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 group-hover:text-primary transition-colors">
                  {plan.name} Membership
                </h3>
                <p className="text-3xl font-extrabold text-primary mb-6 tracking-tight">
                  {plan.price}
                </p>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.benefits.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 text-sm text-gray-600 font-medium"
                    >
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {b}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm text-gray-400 font-medium italic">
                    <CheckCircle className="w-4 h-4 opacity-30" />
                    Discounted Fees
                  </li>
                </ul>
                <button className="w-full py-4 px-4 bg-accent text-white font-bold rounded-2xl hover:bg-primary hover:text-accent transition-luxury shadow-lg shadow-accent/10">
                  Choose Plan
                </button>
              </div>
            ))}
          </div> */}

            <div className="flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12 rounded-3xl bg-primary text-accent">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Multi-Language & Offline Learning
                </h3>
                <p className="font-medium opacity-90 leading-relaxed">
                  Study in your preferred language with localized content and
                  assessments. Offline workshop participants must also register,
                  upload ID, and pass the online assessment for standardized
                  certification.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/20 p-4 rounded-2xl flex flex-col items-center">
                  <Languages className="w-8 h-8 mb-2" />
                  <span className="text-sm font-bold">15+ Languages</span>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl flex flex-col items-center">
                  <Smartphone className="w-8 h-8 mb-2" />
                  <span className="text-sm font-bold">Offline Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="section-padding px-6 relative overflow-hidden text-white bg-accent">
          <div className="absolute inset-0 opacity-30">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Collaborative learning"
              className="w-full h-full object-cover scale-110 hover:scale-100 transition-luxury"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/80 to-transparent"></div>

          <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left reveal">
            <h2 className="fluid-h1 font-bold mb-8 leading-tight tracking-tight">
              Start Your Learning <br />
              Journey <span className="text-primary italic">Today</span>.
            </h2>
            <p className="fluid-p text-gray-300 mb-12 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
              Join thousands of professionals gaining verified skills and
              globally trusted certifications.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              <Link
                to="/register"
                className="px-10 py-5 bg-primary text-accent font-extrabold rounded-2xl shadow-2xl hover:bg-white transition-luxury transform hover:-translate-y-2"
              >
                Register Now
              </Link>
              <div className="flex flex-col justify-center text-left">
                <p className="font-bold flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-6 h-6" />
                  Verified Credentials
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  Trusted by Global Institutions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer className="bg-[#0f172a] text-white pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-2xl font-bold text-white tracking-tighter">
                    SVARP
                  </span>
                  <span className="text-2xl font-bold text-primary tracking-tighter italic">
                    GLOBAL
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Empowering learners, professionals, and institutions through
                  secure, skill-based online education backed by verified
                  certification.
                </p>
                <div className="flex gap-4">
                  {["Twitter", "LinkedIn", "Facebook", "YouTube"].map(
                    (social) => (
                      <div
                        key={social}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer group"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-primary">
                  Academy
                </h4>
                <ul className="space-y-4 text-gray-400">
                  <li>
                    <Link
                      to="/courses-catalog"
                      className="hover:text-white transition"
                    >
                      All Courses
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/verification"
                      className="hover:text-white transition"
                    >
                      Verification Portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/membership"
                      className="hover:text-white transition"
                    >
                      Membership Plans
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/assessment"
                      className="hover:text-white transition"
                    >
                      Smart Assessments
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-primary">
                  Resources
                </h4>
                <ul className="space-y-4 text-gray-400">
                  <li>
                    <Link to="/blog" className="hover:text-white transition">
                      Platform Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="hover:text-white transition">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/corporate"
                      className="hover:text-white transition"
                    >
                      For Institutions
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
                <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-primary">
                  Legal
                </h4>
                <ul className="space-y-4 text-gray-400">
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
                  <li>
                    <Link
                      to="/compliance"
                      className="hover:text-white transition"
                    >
                      GDPR Compliance
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start">
                <p className="text-gray-500 text-sm mb-2">
                  © {new Date().getFullYear()} SVARP Global Academy. All rights
                  reserved.
                </p>
                <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-bold">
                  Powered by SVARP Foundation
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe className="w-4 h-4" />
                  <span>English (Global)</span>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary font-bold">
                    100% SECURE SYSTEM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ReactLenis>
  );
};

export default Home;
