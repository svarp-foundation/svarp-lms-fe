import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full bg-white md:bg-gray-50 flex flex-col md:items-center md:justify-center font-sans selection:bg-primary/20 md:p-4">
      {/* ── Responsive Auth Card ── */}
      <div className="w-full md:max-w-md bg-white md:shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:border md:border-gray-100/80 relative flex flex-col flex-1 md:flex-initial md:rounded-[2rem] overflow-hidden">
        {/* Background ambient light effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        {/* Form Container */}
        <div className="px-6 py-8 md:px-8 md:py-10 z-10 flex-1 flex flex-col justify-center md:flex-initial">
          {/* Brand Logo */}
          <div className="text-center mb-6">
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

          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center leading-tight">
            Log in to continue your learning journey
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs mb-4 text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-400 font-medium transition-all text-sm shadow-sm"
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

            <button
              type="submit"
              className="w-full bg-accent text-white py-3.5 rounded-2xl font-bold hover:bg-opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md text-center mt-3 text-sm"
            >
              Continue
            </button>
          </form>

          <div className="text-center mt-8 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-bold text-primary hover:text-accent hover:underline ml-1"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
