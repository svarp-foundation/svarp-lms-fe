import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";

export const AppSidebar = ({
  open = false,
  setOpen,
  brandTitle = "SVARP",
  brandSubtitle = "GLOBAL",
  brandLink = "/",
  roleBadge = "",
  navLinks = [],
  footerActions,
  className = "",
}) => {
  const location = useLocation();

  const handleNavLinkClick = () => {
    if (setOpen && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const isActiveLink = (link) => {
    if (link.end) {
      return location.pathname === link.to;
    }
    return location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setOpen && setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 h-screen bg-[#1f3b45] text-white flex flex-col flex-shrink-0 z-50 transition-all duration-300 ${
          open ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0 w-64"
        } ${className}`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <Link
            to={brandLink}
            onClick={handleNavLinkClick}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <img
              src="/company/svarp-logo.webp"
              alt="SVARP"
              className="h-7 w-auto object-contain"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-black text-sm text-white tracking-tight">
                  {brandTitle}
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  {brandSubtitle}
                </span>
              </div>
              {roleBadge && (
                <span className="text-[10px] text-slate-300/80 font-medium mt-0.5">
                  {roleBadge}
                </span>
              )}
            </div>
          </Link>

          {setOpen && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="md:hidden p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActiveLink(link);
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={handleNavLinkClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <span
                      className={`flex-shrink-0 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    >
                      {React.isValidElement(Icon) ? Icon : <Icon size={16} />}
                    </span>
                  )}
                  <span className="truncate">{link.label || link.name}</span>
                </div>

                {link.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      active ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {footerActions && (
          <div className="p-3 border-t border-white/10 flex-shrink-0">
            {footerActions}
          </div>
        )}
      </aside>
    </>
  );
};

export default AppSidebar;
