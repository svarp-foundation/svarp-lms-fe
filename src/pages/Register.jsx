import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
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
      // Assuming backend endpoint for registration
      await axios.post(`${API_URL}/register`, {
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
      });

      // Auto-login after successful registration
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
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center p-6 md:p-12">
      {/* 1. LEFT COLUMN: Hero Image */}
      <div className="hidden md:flex flex-1 justify-center items-center p-8">
        <img
          src="https://frontends.udemycdn.com/components/auth/desktop-illustration-step-2-x2.webp"
          alt="Registration Illustration"
          className="max-w-lg w-full object-contain"
        />
      </div>

      {/* 2. RIGHT COLUMN: Registration Form */}
      <div className="flex-1 max-w-md w-full p-4">
        <h2 className="fluid-h3 font-bold mb-8 text-gray-900 leading-tight">
          Join SVARP Global Academy and start learning
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-800 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-600 font-medium"
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-800 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-600 font-medium"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-800 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-600 font-medium"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-800 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-600 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-3 font-bold hover:bg-opacity-90 transition shadow-sm text-center"
          >
            Create Account
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200 mt-6">
          <p className="text-sm text-gray-700">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-secondary underline hover:text-accent"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
