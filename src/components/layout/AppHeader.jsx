import React from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserMenu from "./UserMenu";

export const AppHeader = ({
  brandTitle = "SVARP",
  brandSubtitle = "GLOBAL",
  brandLink = "/",
  isSidebarOpen,
  onToggleSidebar,
  actions,
  className = "",
}) => {
  return (
    <header
      className={`h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 ${className}`}
    >
      {/* Left: Mobile hamburger + Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <Link to={brandLink} className="flex items-center gap-2">
          <img
            src="/company/svarp-logo.webp"
            alt="SVARP"
            className="h-7 w-auto object-contain"
          />
          <div className="flex items-center gap-1 leading-none">
            <span className="font-extrabold text-sm text-[#1f3b45] tracking-tight">
              {brandTitle}
            </span>
            {brandSubtitle && (
              <span className="text-[11px] font-bold text-emerald-700 uppercase">
                {brandSubtitle}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Right: Custom actions + User menu */}
      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        <UserMenu />
      </div>
    </header>
  );
};

export default AppHeader;
