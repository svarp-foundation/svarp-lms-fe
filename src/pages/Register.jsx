import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";
import { CheckCircle2, GraduationCap, Briefcase } from "lucide-react";
import { SPECIALIZATION_DOMAINS, DEFAULT_SPECIALIZATION } from "../constants/specializations";
import { FormInput, FormTextarea, Button } from "../components/common";

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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
        setLoading(false);
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
        }
      );

      await login(loginResponse.data.access_token, loginResponse.data.refresh_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col md:items-center md:justify-center font-sans p-4">
      <div className="w-full md:max-w-md bg-white shadow-xl border border-slate-200/80 rounded-2xl overflow-hidden my-4 p-6 sm:p-8">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1 leading-none mb-1">
            <span className="text-2xl font-black text-[#1f3b45] tracking-tight">
              SVARP
            </span>
            <span className="text-2xl font-black text-emerald-700">
              GLOBAL
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {accountType === "instructor" ? "Instructor Onboarding" : "Learner Registration"}
          </p>
        </div>

        {isSubmittedInstructor ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Application Submitted!
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Thank you for applying to become an instructor at SVARP Academy. An administrator
                will review your application and activate your Instructor Studio access shortly.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login" className="block w-full">
                <Button variant="primary" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Account Type Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAccountType("learner")}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  accountType === "learner"
                    ? "bg-white text-[#1f3b45] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <GraduationCap size={15} />
                <span>Learner</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType("instructor");
                  if (!formData.specialty) {
                    setFormData({ ...formData, specialty: DEFAULT_SPECIALIZATION });
                  }
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  accountType === "instructor"
                    ? "bg-white text-[#1f3b45] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Briefcase size={15} />
                <span>Instructor</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl text-xs mb-4 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <FormInput
                label="Full Name"
                name="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {accountType === "instructor" && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
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
                        className="text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        {isCustomSpecialty ? "Catalog Domains" : "Custom Domain"}
                      </button>
                    </div>

                    {!isCustomSpecialty ? (
                      <select
                        value={formData.specialty}
                        onChange={handleSpecialtySelect}
                        className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#1f3b45]"
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
                        <option value="__custom__">+ Enter Custom Domain...</option>
                      </select>
                    ) : (
                      <FormInput
                        placeholder="e.g. Distributed Consensus Systems"
                        name="customSpecialty"
                        value={formData.customSpecialty}
                        onChange={handleChange}
                        required
                      />
                    )}
                  </div>

                  <FormTextarea
                    label="Instructor Bio & Professional Experience"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about your industry experience and teaching background..."
                    required
                  />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />

                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  loading={loading}
                >
                  {accountType === "instructor" ? "Submit Application" : "Create Account"}
                </Button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
