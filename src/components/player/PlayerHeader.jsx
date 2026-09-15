import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Layers } from "lucide-react";
import { Button } from "../common";

export const PlayerHeader = ({
  courseTitle = "Course",
  progressPercentage = 0,
  courseId,
  isSidebarOpen = true,
  onToggleSidebar,
  onDownloadCertificate,
  onClaimCertificate,
  downloadingCertificate = false,
}) => {
  const navigate = useNavigate();
  const handleCertClick = onDownloadCertificate || onClaimCertificate;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left: Back & Course Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
          title="Back to Course Overview"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {courseTitle}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              {Math.round(progressPercentage)}% completed
            </span>
          </div>
        </div>
      </div>

      {/* Right: Certificate & Course Roadmap Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {progressPercentage >= 100 && handleCertClick && (
          <Button
            type="button"
            variant="emerald"
            size="xs"
            onClick={handleCertClick}
            loading={downloadingCertificate}
            icon={Download}
          >
            Download Certificate
          </Button>
        )}

        {onToggleSidebar && (
          <Button
            type="button"
            variant={isSidebarOpen ? "primary" : "outline"}
            size="xs"
            onClick={onToggleSidebar}
            icon={Layers}
            className={
              isSidebarOpen
                ? "bg-[#1f3b45] text-white hover:bg-[#162b32] border-[#1f3b45]"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }
            title={isSidebarOpen ? "Hide Course Roadmap" : "Show Course Roadmap"}
          >
            <span className="hidden sm:inline">Course Roadmap</span>
            <span className="sm:hidden">Roadmap</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default PlayerHeader;


