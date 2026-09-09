import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";
import { Eye, EyeOff, CheckCircle2, GraduationCap, Briefcase, Sparkles } from "lucide-react";
import { SPECIALIZATION_DOMAINS, DEFAULT_SPECIALIZATION } from "../constants/specializations";

const Register = () => {
  const [accountType, setAccountType] = useState("learner"); // "learner" or "instructor"
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: DEFAULT_SPECIALIZATION,
    customSpecialty: "",
    bio: "",
  });
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
  const [error, setError] = useState("");
  const [isSubmittedInstructor, setIsSubmittedInstructor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecialtySelect = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomSpecialty(true);
      setFormData({ ...formData, specialty: "" });
    } else {
      setIsCustomSpecialty(false);
      setFormData({ ...formData, specialty: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const finalSpecialty = isCustomSpecialty
      ? formData.customSpecialty || formData.specialty
      : formData.specialty;

    if (accountType === "instructor" && !finalSpecialty) {
      setError("Please select or enter your area of expertise");
      return;
    }

    setError("");
    try {
      await axios.post(`${API_URL}/register`, {
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: accountType,
        specialty: accountType === "instructor" ? finalSpecialty : undefined,
        bio: accountType === "instructor" ? formData.bio : undefined,
      });

      if (accountType === "instructor") {
        setIsSubmittedInstructor(true);
        return;
      }

      const loginResponse = await axios.post(
        `${API_URL}/token`,
        new URLSearchParams({
          username: formData.email,
          password: formData.password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      login(loginResponse.data.access_token, loginResponse.data.refresh_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white md:bg-gray-50 flex flex-col md:items-center md:justify-center font-sans selection:bg-primary/20 md:p-4">
      {/* ── Responsive Auth Card ── */}
      <div className="w-full md:max-w-md bg-white md:shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:border md:border-gray-100/80 relative flex flex-col flex-1 md:flex-initial md:rounded-[2rem] overflow-hidden my-4">
        {/* Background ambient light effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        {/* Form Container */}
        <div className="px-6 py-8 md:px-8 md:py-9 z-10 flex-1 flex flex-col justify-center md:flex-initial">
          {/* Brand Logo */}
          <div className="text-center mb-3">
            <div className="flex flex-col items-center mb-1">
              <span className="text-3xl font-extrabold text-accent tracking-wide leading-none">
                SVARP
              </span>
              <span className="text-3xl font-extrabold text-primary tracking-wide mt-1.5 leading-none">
                GLOBAL ACADEMY
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-2">
              {accountType === "instructor" ? "Instructor Onboarding" : "Learner Portal"}
            </p>
          </div>

          {isSubmittedInstructor ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Thank you for applying to become an instructor at SVARP Academy. An administrator
                  will review your application and activate your Instructor Studio access shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block w-full bg-accent text-white py-3 rounded-2xl font-bold hover:bg-opacity-95 transition-all text-sm shadow-md"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Account Type Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAccountType("learner")}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    accountType === "learner"
                      ? "bg-white text-accent shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <GraduationCap size={14} />
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("instructor");
                    if (!formData.specialty) {
                      setFormData({ ...formData, specialty: DEFAULT_SPECIALIZATION });
                    }
                  }}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    accountType === "instructor"
                      ? "bg-white text-accent shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Briefcase size={14} />
                  Instructor
                </button>
              </div>

              <h2 className="text-sm font-bold text-gray-800 mb-3 text-center leading-tight">
                {accountType === "instructor"
                  ? "Apply as an Instructor & Teach Courses"
                  : "Create an account to start learning"}
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-2xl text-xs mb-3 text-center animate-pulse">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                    required
                  />
                </div>

                {accountType === "instructor" && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1 ml-1 mr-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Specialization & Domain
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSpecialty(!isCustomSpecialty);
                            if (isCustomSpecialty) {
                              setFormData({ ...formData, specialty: DEFAULT_SPECIALIZATION });
                            }
                          }}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          {isCustomSpecialty ? "Choose from catalog" : "Enter custom domain"}
                        </button>
                      </div>

                      {!isCustomSpecialty ? (
                        <div className="relative">
                          <select
                            value={formData.specialty}
                            onChange={handleSpecialtySelect}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 font-medium transition-all text-xs shadow-sm appearance-none cursor-pointer"
                          >
                            {SPECIALIZATION_DOMAINS.map((domain) => (
                              <optgroup key={domain.category} label={domain.category}>
                                {domain.areas.map((area) => (
                                  <option key={area} value={area}>
                                    {area}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                            <option value="__custom__">+ Other / Custom Specialization...</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          name="customSpecialty"
                          placeholder="e.g. Embedded Firmware & IoT, Quantum Computing"
                          value={formData.customSpecialty}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                        Short Bio / Teaching Background
                      </label>
                      <textarea
                        name="bio"
                        rows={2}
                        placeholder="Brief summary of your professional background, certifications, and courses you plan to teach..."
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-xs shadow-sm"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent text-white py-3 rounded-2xl font-bold hover:bg-opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md text-center mt-2 text-sm"
                >
                  {accountType === "instructor" ? "Submit Instructor Application" : "Create Account"}
                </button>
              </form>

              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-primary hover:text-accent hover:underline ml-1"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
