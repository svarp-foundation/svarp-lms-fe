import React, { useState } from "react";
import { Users, UserCheck, UserX, TrendingUp, Calendar } from "lucide-react";

export const StudentRegistrationChart = ({
  trends = [],
  learnerGrowth = {},
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState("monthly"); // "monthly" | "daily"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs h-80 animate-pulse" />
    );
  }

  const {
    daily_registrations = [],
    active_learners = 0,
    suspended_learners = 0,
    total_learners = 0,
  } = learnerGrowth;

  const monthlyData = trends.length > 0 ? trends : [
    { month: "Jan", new_learners: 0, cumulative_learners: 0 },
    { month: "Feb", new_learners: 0, cumulative_learners: 0 },
    { month: "Mar", new_learners: 0, cumulative_learners: 0 },
    { month: "Apr", new_learners: 0, cumulative_learners: 0 },
    { month: "May", new_learners: 0, cumulative_learners: 0 },
    { month: "Jun", new_learners: 0, cumulative_learners: 0 },
  ];

  const activeData = viewMode === "monthly" ? monthlyData : daily_registrations;
  const isMonthly = viewMode === "monthly";

  // Chart setup
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const values = activeData.map((d) => (isMonthly ? d.new_learners || 0 : d.count || 0));
  const maxVal = Math.max(...values, 5);

  const totalPeriodNew = values.reduce((a, b) => a + b, 0);
  const activeRate = total_learners > 0 ? Math.round((active_learners / total_learners) * 100) : 100;

  // Bar calculations
  const barCount = activeData.length;
  const slotWidth = innerWidth / (barCount || 1);
  const barWidth = Math.max(Math.min(slotWidth * 0.5, 32), 12);

  const points = activeData.map((d, index) => {
    const val = isMonthly ? d.new_learners || 0 : d.count || 0;
    const x = paddingX + index * slotWidth + slotWidth / 2;
    const barH = (val / maxVal) * innerHeight;
    const y = paddingTop + innerHeight - barH;
    const label = isMonthly ? d.month : d.label;
    const cumulative = isMonthly ? d.cumulative_learners : null;
    return { x, y, barH, val, label, cumulative, raw: d };
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
      {/* Header & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <Users size={14} className="text-emerald-700" />
              Student Registration & Growth
            </h3>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {isMonthly ? "(6-Month Overview)" : "(14-Day Velocity)"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Track student signup volume, active user rates, and learner onboarding trends
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setViewMode("monthly");
              setHoveredPoint(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "monthly"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar size={13} className={viewMode === "monthly" ? "text-emerald-700" : ""} />
            <span>Monthly Trend</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("daily");
              setHoveredPoint(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "daily"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp size={13} className={viewMode === "daily" ? "text-emerald-700" : ""} />
            <span>14-Day Velocity</span>
          </button>
        </div>
      </div>


      {/* Metric Quick Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-3.5 my-3 bg-slate-50/70 border border-slate-100 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">Total Learners</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{total_learners.toLocaleString()} accounts</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">New in Period</span>
          <span className="font-bold text-emerald-700 mt-0.5 block">+{totalPeriodNew.toLocaleString()} students</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">Active Learners</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{active_learners.toLocaleString()} ({activeRate}%)</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">Suspended / Inactive</span>
          <span className="font-bold text-rose-600 mt-0.5 block">{suspended_learners.toLocaleString()} accounts</span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-[220px] overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bar-gradient-emerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="bar-gradient-hover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f3b45" stopOpacity="1" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingTop + innerHeight * (1 - pct);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {Math.round(maxVal * pct).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint?.label === pt.label;
            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Hit area */}
                <rect
                  x={pt.x - slotWidth / 2}
                  y={paddingTop}
                  width={slotWidth}
                  height={innerHeight}
                  fill="transparent"
                />
                {/* Visual Bar */}
                <rect
                  x={pt.x - barWidth / 2}
                  y={pt.y}
                  width={barWidth}
                  height={Math.max(pt.barH, 3)}
                  rx="4"
                  ry="4"
                  fill={isHovered ? "url(#bar-gradient-hover)" : "url(#bar-gradient-emerald)"}
                  className="transition-all duration-150"
                />
                {/* Value on top of bar if space */}
                {pt.val > 0 && (
                  <text
                    x={pt.x}
                    y={pt.y - 4}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {pt.val}
                  </text>
                )}
                {/* X Axis Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize={isMonthly ? "10" : "8"}
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100}%`,
            }}
          >
            <p className="font-bold text-white/80 text-[10px] uppercase tracking-wider">{hoveredPoint.label}</p>
            <p className="font-semibold text-emerald-400 mt-0.5">
              {hoveredPoint.val} new {hoveredPoint.val === 1 ? "student" : "students"} registered
            </p>
            {hoveredPoint.cumulative != null && (
              <p className="text-[10px] text-slate-300">
                Total base: {hoveredPoint.cumulative.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegistrationChart;
