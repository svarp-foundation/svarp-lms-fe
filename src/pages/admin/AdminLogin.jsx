import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../config";
import { Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const effectiveRole = user.role || (user.roles?.includes("admin") ? "admin" : "learner");
      if (effectiveRole === "admin") {
        navigate("/admin");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/token`,
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      
      // Decode token to verify admin role
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload.roles || (payload.role ? [payload.role] : []);

      if (!roles.includes("admin") && payload.role !== "admin") {
        setError("Access denied: You are not authorized as an admin.");
        setLoading(false);
        return;
      }

      login(token, refreshToken);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white md:bg-gray-50 flex flex-col md:items-center md:justify-center font-sans p-4">
      <div className="w-full md:max-w-md bg-white md:shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:border md:border-gray-100/80 relative flex flex-col md:rounded-[2rem] overflow-hidden">
        {/* Background ambient light effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        <div className="px-6 py-8 md:px-8 md:py-10 z-10">
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
            <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-2">
              Admin Portal
            </p>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center leading-tight">
            Sign in to manage LMS Portal
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs mb-4 text-center animate-pulse font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
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
              disabled={loading}
              className="w-full bg-accent text-white py-3.5 rounded-2xl font-bold hover:bg-opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md text-center mt-3 text-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
