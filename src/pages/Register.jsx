import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError("");
    try {
      await axios.post(`${API_URL}/register`, {
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
      });

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
      <div className="w-full md:max-w-md bg-white md:shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:border md:border-gray-100/80 relative flex flex-col flex-1 md:flex-initial md:rounded-[2rem] overflow-hidden">
        
        {/* Background ambient light effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        {/* Form Container */}
        <div className="px-6 py-8 md:px-8 md:py-10 z-10 flex-1 flex flex-col justify-center md:flex-initial">
          {/* Brand Logo */}
          <div className="text-center mb-4">
            <div className="flex flex-col items-center mb-1">
              <span className="text-3xl font-extrabold text-accent tracking-wide leading-none">
                SVARP
              </span>
              <span className="text-3xl font-extrabold text-primary tracking-wide mt-1.5 leading-none">
                GLOBAL ACADEMY
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-2">
              Learner Portal
            </p>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center leading-tight">
            Create an account to start learning
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

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-white py-3 rounded-2xl font-bold hover:bg-opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md text-center mt-2 text-sm"
            >
              Create Account
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
        </div>

      </div>
    </div>
  );
};

export default Register;
