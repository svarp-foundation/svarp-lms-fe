import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state (optional)

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-accent shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-wide">
                  SVARP
                </span>
                <span className="text-2xl font-semibold text-primary tracking-wide">
                  GLOBAL ACADEMY
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* {!user && (
              <>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Our Team
                </Link>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Courses
                </Link>
              </>
            )} */}

            {user?.role === "admin" ? (
              // ADMIN LINKS
              <>
                <Link
                  to="/admin"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/courses"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Manage Courses
                </Link>
                <Link
                  to="/admin/users"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Manage Users
                </Link>
              </>
            ) : user ? (
              // LEARNER LINKS
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Browse
                </Link>
              </>
            ) : null}

            {/* Auth Buttons / Connect */}
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-sm shadow-md">
                  {user.full_name
                    ? user.full_name[0].toUpperCase()
                    : user.email
                      ? user.email[0].toUpperCase()
                      : "U"}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link
                  to="/login"
                  className="bg-primary text-accent font-bold px-6 py-2 rounded-full hover:bg-white hover:text-accent transition-all shadow-md text-sm"
                >
                  Connect
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
