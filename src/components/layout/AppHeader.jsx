import React from "react";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

export const AppHeader = ({
  brandTitle = "SVARP",
  brandSubtitle = "GLOBAL",
  brandLink = "/",
  actions,
  className = "",
}) => {
  return (
    <header
      className={`h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 ${className}`}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
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
              <span className="text-sm font-bold text-emerald-700 uppercase">
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

