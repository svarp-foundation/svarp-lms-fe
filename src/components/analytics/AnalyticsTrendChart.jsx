import React, { useState } from "react";
import { TrendingUp, IndianRupee, GraduationCap, Award, Users } from "lucide-react";

export const AnalyticsTrendChart = ({ trends = [], loading = false }) => {
  const [activeMetric, setActiveMetric] = useState("revenue");
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const METRIC_CONFIG = {
    revenue: {
      label: "Revenue Growth",
      unit: "₹",
      format: (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`,
      color: "#059669", // emerald-600
      fillGradient: ["#059669", "transparent"],
      icon: IndianRupee,
      getValue: (d) => d.revenue || 0,
    },
    enrollments: {
      label: "Course Enrollments",
      unit: "",
      format: (val) => `${Number(val || 0).toLocaleString()} enrollments`,
      color: "#0284c7", // sky-600
      fillGradient: ["#0284c7", "transparent"],
      icon: GraduationCap,
      getValue: (d) => d.enrollments || 0,
    },
    certificates: {
      label: "Certificates Awarded",
      unit: "",
      format: (val) => `${Number(val || 0).toLocaleString()} certificates`,
      color: "#4f46e5", // indigo-600
      fillGradient: ["#4f46e5", "transparent"],
      icon: Award,
      getValue: (d) => d.certificates || 0,
    },
    new_learners: {
      label: "New Learner Signups",
      unit: "",
      format: (val) => `${Number(val || 0).toLocaleString()} learners`,
      color: "#1f3b45", // deep slate
      fillGradient: ["#1f3b45", "transparent"],
      icon: Users,
      getValue: (d) => d.new_learners || 0,
    },
  };

  const currentCfg = METRIC_CONFIG[activeMetric] || METRIC_CONFIG.revenue;

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs h-80 animate-pulse" />
    );
  }

  const dataPoints = trends.length > 0 ? trends : [
    { month: "Jan", revenue: 0, enrollments: 0, certificates: 0, new_learners: 0 },
    { month: "Feb", revenue: 0, enrollments: 0, certificates: 0, new_learners: 0 },
    { month: "Mar", revenue: 0, enrollments: 0, certificates: 0, new_learners: 0 },
    { month: "Apr", revenue: 0, enrollments: 0, certificates: 0, new_learners: 0 },
    { month: "May", revenue: 0, enrollments: 0, certificates: 0, new_learners: 0 },
    { month: "Jun", revenue: 0, enrollments: 0, certificates: 0, new_learners: 0 },
  ];

  const values = dataPoints.map(currentCfg.getValue);
  const maxValue = Math.max(...values, 10);
  const totalVal = values.reduce((a, b) => a + b, 0);
  const avgVal = (totalVal / values.length) || 0;
  const maxVal = Math.max(...values);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const points = dataPoints.map((d, index) => {
    const x = paddingX + (index / (dataPoints.length - 1 || 1)) * innerWidth;
    const val = currentCfg.getValue(d);
    const y = paddingTop + innerHeight - (val / maxValue) * innerHeight;
    return { x, y, val, month: d.month, raw: d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${paddingTop + innerHeight} L ${points[0]?.x || 0} ${paddingTop + innerHeight} Z`;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
      {/* Header & Metric Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider whitespace-nowrap">
              Growth & Activity Trends
            </h3>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              (Past 6 Months)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Longitudinal trend of financial and student engagement metrics
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg overflow-x-auto">
          {Object.entries(METRIC_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveMetric(key);
                  setHoveredPoint(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={13} className={isActive ? "text-emerald-700" : ""} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Metric Quick Summary */}
      <div className="grid grid-cols-3 gap-3 py-3 px-3.5 my-3 bg-slate-50/70 border border-slate-100 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">Total in Period</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{currentCfg.format(totalVal)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">Monthly Average</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{currentCfg.format(avgVal)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase block">Peak Month</span>
          <span className="font-bold text-emerald-700 mt-0.5 block">{currentCfg.format(maxVal)}</span>
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
            <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentCfg.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={currentCfg.color} stopOpacity="0.0" />
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
                  {Math.round(maxValue * pct).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path d={areaD} fill={`url(#grad-${activeMetric})`} />

          {/* Line curve */}
          <path
            d={pathD}
            fill="none"
            stroke={currentCfg.color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Hit area */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
              {/* Outer ring */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.month === pt.month ? "6" : "4"}
                fill="#ffffff"
                stroke={currentCfg.color}
                strokeWidth={hoveredPoint?.month === pt.month ? "3" : "2"}
                className="transition-all duration-150"
              />
              {/* X Axis label */}
              <text
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                {pt.month}
              </text>
            </g>
          ))}
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
            <p className="font-bold text-white/80 text-[10px] uppercase tracking-wider">{hoveredPoint.month}</p>
            <p className="font-semibold text-emerald-400 mt-0.5">{currentCfg.format(hoveredPoint.val)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTrendChart;
