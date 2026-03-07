import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        `${API_URL}/token`,
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      login(response.data.access_token, response.data.refresh_token);

      // Decode token to check role
      const payload = JSON.parse(
        atob(response.data.access_token.split(".")[1]),
      );
      if (payload.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center p-6 md:p-12">
      {/* 1. LEFT COLUMN: Hero Image */}
      <div className="hidden md:flex flex-1 justify-center items-center p-8">
        <img
          src="https://frontends.udemycdn.com/components/auth/desktop-illustration-step-2-x2.webp"
          alt="Login Illustration"
          className="max-w-lg w-full object-contain"
        />
      </div>

      {/* 2. RIGHT COLUMN: Login Form */}
      <div className="flex-1 max-w-md w-full p-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          Log in to continue your learning journey
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-600 font-medium"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-600 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-3 font-bold hover:bg-opacity-90 transition shadow-sm text-center"
          >
            Continue
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase">
            Other log in options
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Buttons (Look-alike) */}
        <div className="flex justify-center gap-4 mb-8">
          <button className="w-12 h-12 border border-gray-900 flex items-center justify-center hover:bg-gray-100 transition">
            <span className="text-xl font-bold text-gray-700">G</span>
          </button>
          <button className="w-12 h-12 border border-gray-900 flex items-center justify-center hover:bg-gray-100 transition">
            <span className="text-xl font-bold text-blue-600">f</span>
          </button>
          <button className="w-12 h-12 border border-gray-900 flex items-center justify-center hover:bg-gray-100 transition">
            <span className="text-xl font-bold text-gray-900"></span>
          </button>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-bold text-secondary underline hover:text-accent"
            >
              Sign up
            </a>
          </p>
          <a
            href="#"
            className="block mt-4 text-sm font-bold text-secondary underline hover:text-accent"
          >
            Log in with your organization
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
