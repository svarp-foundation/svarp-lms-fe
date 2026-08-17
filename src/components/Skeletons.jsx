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
  <div className="h-screen flex flex-col md:flex-row bg-white overflow-hidden">
    {/* Sidebar Skeleton */}
    <div className="w-80 bg-white border-r border-gray-100 p-4 space-y-4 hidden md:block flex-shrink-0 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-36 mb-6" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-2 bg-gray-100 rounded-full w-full my-4" />
      <div className="space-y-3 pt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl w-full" />
        ))}
      </div>
    </div>

    {/* Main Player Content Skeleton */}
    <div className="flex-1 p-6 space-y-6 overflow-y-auto animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-2xl w-full max-w-4xl mx-auto" />
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="h-7 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
      </div>
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
