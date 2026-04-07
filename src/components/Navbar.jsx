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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-12 h-12 flex items-center justify-center text-primary hover:text-white transition-luxury focus:outline-none z-50"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5 flex items-center justify-center">
                <span 
                  className={`absolute h-[2px] bg-primary transition-all duration-300 ease-in-out ${
                    isOpen ? "w-6 rotate-45" : "w-6 -translate-y-2"
                  }`} 
                />
                <span 
                  className={`absolute h-[2px] bg-primary transition-all duration-300 ease-in-out ${
                    isOpen ? "opacity-0" : "w-6 opacity-100"
                  }`} 
                />
                <span 
                  className={`absolute h-[2px] bg-primary transition-all duration-300 ease-in-out ${
                    isOpen ? "w-6 -rotate-45" : "w-6 translate-y-2"
                  }`} 
                />
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {user?.role === "admin" ? (
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
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-accent font-bold px-6 py-2 rounded-full hover:bg-white transition-all shadow-md text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-accent/95 backdrop-blur-md border-t border-gray-800 ${
          isOpen ? "max-h-[500px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-6 flex flex-col gap-4">
          {user?.role === "admin" ? (
            <>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-gray-800"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/courses"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-gray-800"
              >
                Manage Courses
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-gray-800"
              >
                Manage Users
              </Link>
            </>
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-gray-800"
              >
                Dashboard
              </Link>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-gray-800"
              >
                Browse
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2 border-b border-gray-800"
              >
                Home
              </Link>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-gray-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-sm">
                    {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-gray-300 font-medium truncate max-w-[150px]">
                    {user.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-sm font-bold text-red-400 hover:text-red-300 p-2"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-transparent border border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-accent transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-primary text-accent font-bold py-3 rounded-xl hover:bg-white transition-all shadow-lg"
                >
                  Sign Up
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
