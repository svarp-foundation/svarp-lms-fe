import React from "react";

export const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`}
    {...props}
  />
);

export const CourseCardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col h-full animate-pulse">
    {/* Thumbnail Skeleton */}
    <div className="aspect-video w-full bg-gray-200 relative overflow-hidden" />

    {/* Body Skeleton */}
    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
      <div className="space-y-2.5">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        <div className="h-4 bg-gray-100 rounded-md w-1/2" />

        {/* Description */}
        <div className="space-y-1.5 pt-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
        </div>
      </div>

      {/* Progress / Price & Button */}
      <div className="pt-3 border-t border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded-full w-12" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  </div>
);

export const CourseGridSkeleton = ({ count = 6 }) => (
  <div className="responsive-grid">
    {[...Array(count)].map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);

export const BannerCarouselSkeleton = () => (
  <div className="w-full min-h-[220px] bg-gradient-to-br from-[#1f3b45] to-[#111827] border-b border-white/5 p-8 flex flex-col justify-center animate-pulse">
    <div className="max-w-7xl mx-auto w-full space-y-3">
      <div className="h-7 bg-white/20 rounded-lg w-2/3 md:w-1/3" />
      <div className="h-4 bg-white/10 rounded-md w-full md:w-1/2" />
      <div className="h-4 bg-white/10 rounded-md w-4/5 md:w-2/5" />
      <div className="pt-2 flex items-center gap-4">
        <div className="h-10 bg-primary/40 rounded-xl w-32" />
        <div className="h-4 bg-white/20 rounded w-16" />
      </div>
    </div>
  </div>
);

export const LearnerDashboardSkeleton = () => (
  <div className="space-y-8 page-padding max-w-7xl mx-auto mt-6">
    {/* Section 1: In Progress */}
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse" />
      <CourseGridSkeleton count={3} />
    </div>

    {/* Section 2: Recommended */}
    <div className="space-y-4 pt-4">
      <div className="h-6 bg-gray-200 rounded-md w-56 animate-pulse" />
      <CourseGridSkeleton count={3} />
    </div>
  </div>
);

export const CourseOverviewSkeleton = () => (
  <div className="bg-gray-50 min-h-screen">
    {/* Hero Header Skeleton */}
    <div className="bg-accent text-white page-padding animate-pulse">
      <div className="max-w-4xl mx-auto space-y-4 py-4">
        <div className="h-8 bg-white/20 rounded-lg w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-3 bg-white/20 rounded w-32" />
          <div className="h-3 bg-white/20 rounded w-24" />
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="max-w-4xl mx-auto page-padding responsive-layout-flex gap-8">
      {/* Left Column: Modules */}
      <div className="flex-1 space-y-4">
        <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-xl bg-white p-4 space-y-3 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/2" />
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Enrollment Card */}
      <div className="responsive-layout-sidebar">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded-lg w-1/2 mx-auto" />
          <div className="h-12 bg-primary/30 rounded-xl w-full" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const CoursePlayerSkeleton = () => (
  <div className="h-screen w-full flex flex-col bg-[#f8fafc] overflow-hidden select-none animate-pulse">
    {/* Top Player Header Skeleton */}
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left: Back Arrow & Course Title / Progress */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <div className="h-4 bg-slate-200 rounded w-44 sm:w-64" />
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 bg-slate-200 h-1.5 rounded-full" />
            <div className="h-2.5 bg-slate-200 rounded w-12" />
          </div>
        </div>
      </div>

      {/* Right: Certificate / Sidebar Toggle Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="h-8 bg-slate-200 rounded-lg w-28 hidden sm:block" />
        <div className="w-8 h-8 rounded-lg bg-slate-200 md:hidden" />
      </div>
    </header>

    {/* Main Workspace (Player Content + Sidebar) */}
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 w-full">
        {/* Lesson Title & Action Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-6 sm:h-7 bg-slate-200 rounded w-3/4 max-w-md" />
          </div>
          <div className="h-9 bg-slate-200 rounded-xl w-36 flex-shrink-0" />
        </div>

        {/* Player Media / Text Card Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="aspect-video w-full bg-slate-200" />
        </div>

        {/* Discussion / Comments Card Skeleton */}
        <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-4 h-4 rounded bg-slate-200" />
            <div className="h-3.5 bg-slate-200 rounded w-48" />
          </div>

          <div className="h-20 bg-slate-100 rounded-xl w-full border border-slate-200/60" />

          <div className="flex justify-end">
            <div className="h-8 bg-slate-200 rounded-lg w-28" />
          </div>

          {/* Comment items placeholder */}
          <div className="space-y-3 pt-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-slate-200 rounded w-32" />
                  <div className="h-2.5 bg-slate-200 rounded w-16" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right Sidebar Skeleton (visible on md/desktop) */}
      <aside className="bg-white border-l border-slate-200 w-80 h-full hidden md:flex flex-col flex-shrink-0 overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-3.5 bg-slate-200 rounded w-28" />
        </div>

        {/* Modules Tree Skeleton */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
          {[...Array(4)].map((_, mIdx) => (
            <div key={mIdx} className="rounded-lg overflow-hidden border border-slate-100">
              <div className="p-3 bg-slate-50 flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="h-2.5 bg-slate-200 rounded w-16" />
                  <div className="h-3.5 bg-slate-200 rounded w-36" />
                </div>
                <div className="w-4 h-4 rounded bg-slate-200" />
              </div>
              <div className="p-2 space-y-1.5 bg-white">
                {[...Array(3)].map((_, lIdx) => (
                  <div key={lIdx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="h-3 bg-slate-200 rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  </div>
);

export const CertificatesSkeleton = () => (
  <div className="responsive-grid">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
        <div className="flex gap-4 items-center border-b border-gray-100 pb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="h-12 bg-gray-50 rounded-2xl border border-gray-100" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 bg-gray-100 rounded-xl flex-1" />
          <div className="h-10 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    ))}
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="space-y-5 font-sans animate-pulse">
    {/* Stat Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 h-[84px] rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="h-3 bg-slate-200 rounded w-20" />
          <div className="h-6 bg-slate-200 rounded w-12" />
        </div>
      ))}
    </div>

    {/* Quick Action Tiles */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 h-16" />
      ))}
    </div>

    {/* Activity Feeds */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white p-4 h-64 rounded-xl border border-slate-200" />
      <div className="bg-white p-4 h-64 rounded-xl border border-slate-200" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
    <div className="h-10 bg-slate-100 rounded-lg w-full mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="h-3 bg-slate-100 rounded w-full pt-2" />
        </div>
      ))}
    </div>
  </div>
);
