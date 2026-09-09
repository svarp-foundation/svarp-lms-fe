import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../config";
import { LogOut, ChevronDown, User, Shield, Briefcase, GraduationCap } from "lucide-react";

export const UserMenu = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const token = localStorage.getItem("token") || "";
  const profilePicUrl = user?.profile_picture_url
    ? `${API_URL}${user.profile_picture_url}${user.profile_picture_url.includes("?") ? "&" : "?"}token=${token}`
    : null;

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  const effectiveRole =
    user.role ||
    (user.roles?.includes("admin")
      ? "admin"
      : user.roles?.includes("instructor")
      ? "instructor"
      : user.roles?.includes("instructor_pending")
      ? "instructor_pending"
      : "learner");

  const getRoleLabel = () => {
    switch (effectiveRole) {
      case "admin":
        return "Administrator";
      case "instructor":
        return "Instructor";
      case "instructor_pending":
        return "Instructor (Pending)";
      default:
        return "Learner";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-lg bg-[#1f3b45] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-2xs">
          {profilePicUrl && !imgError ? (
            <img
              src={profilePicUrl}
              alt={user.full_name || "User"}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="hidden sm:block leading-tight">
          <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
            {user.full_name || user.email}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {getRoleLabel()}
          </p>
        </div>

        <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fadeIn">
          {/* User info header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user.full_name || "User Account"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {getRoleLabel()}
            </span>
          </div>

          {/* Quick Studio Switching Links */}
          <div className="py-1">
            {effectiveRole === "admin" && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Shield size={14} className="text-indigo-600" />
                  <span>Admin Studio</span>
                </Link>
                <Link
                  to="/instructor/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Briefcase size={14} className="text-cyan-700" />
                  <span>Instructor Studio</span>
                </Link>
              </>
            )}

            {effectiveRole === "instructor" && (
              <Link
                to="/instructor/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <Briefcase size={14} className="text-cyan-700" />
                <span>Instructor Studio</span>
              </Link>
            )}

            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <GraduationCap size={14} className="text-emerald-700" />
              <span>Learner Portal</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
