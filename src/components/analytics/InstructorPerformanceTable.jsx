import React, { useState, useMemo } from "react";
import { DataTable, SearchBar, StatusBadge, Button } from "../common";
import { useDebounce } from "../../hooks/useDebounce";
import { Download, Users, IndianRupee, BookOpen, Award } from "lucide-react";

export const InstructorPerformanceTable = ({ instructors = [], loading = false }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const filteredInstructors = useMemo(() => {
    if (!debouncedSearch) return instructors;
    const q = debouncedSearch.toLowerCase();
    return instructors.filter(
      (inst) =>
        inst.name?.toLowerCase().includes(q) ||
        inst.email?.toLowerCase().includes(q) ||
        inst.specialty?.toLowerCase().includes(q)
    );
  }, [instructors, debouncedSearch]);

  const handleExportCSV = () => {
    if (!filteredInstructors.length) return;
    const headers = [
      "Instructor ID",
      "Name",
      "Email",
      "Specialty",
      "Total Courses",
      "Published Courses",
      "Total Students",
      "Revenue (INR)",
      "Certificates Earned",
      "Submissions Reviewed",
    ];

    const rows = filteredInstructors.map((inst) => [
      inst.id,
      `"${(inst.name || "").replace(/"/g, '""')}"`,
      inst.email,
      `"${(inst.specialty || "").replace(/"/g, '""')}"`,
      inst.total_courses || 0,
      inst.published_courses || 0,
      inst.total_students || 0,
      inst.total_revenue || 0,
      inst.certificates_earned || 0,
      inst.total_submissions || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `instructor_performance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: "name",
      label: "Instructor",
      render: (inst) => (
        <div className="min-w-0 py-1">
          <span className="font-bold text-slate-900 text-xs truncate block">
            {inst.name}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            {inst.email}
          </span>
        </div>
      ),
    },
    {
      key: "specialty",
      label: "Specialization",
      render: (inst) => (
        <span className="text-xs font-medium text-slate-600 block truncate max-w-[180px]">
          {inst.specialty || "General Instructor"}
        </span>
      ),
    },
    {
      key: "total_courses",
      label: "Courses",
      render: (inst) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900">
            {inst.published_courses} published
          </span>
          <span className="text-[11px] text-slate-400 block">
            {inst.total_courses} total
          </span>
        </div>
      ),
    },
    {
      key: "total_students",
      label: "Students Enrolled",
      render: (inst) => (
        <span className="text-xs font-semibold text-slate-900">
          {(inst.total_students || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "total_revenue",
      label: "Revenue Generated",
      render: (inst) => (
        <span className="text-xs font-bold text-emerald-700">
          ₹{(inst.total_revenue || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "certificates_earned",
      label: "Certificates",
      render: (inst) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900">
            {(inst.certificates_earned || 0).toLocaleString()} earned
          </span>
          <span className="text-[10px] text-slate-400 block">
            {inst.total_submissions || 0} submissions
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Instructor Performance & Reach
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Overview of instructor course catalogs, student reach, and revenue contribution
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
          disabled={!filteredInstructors.length}
        >
          Export CSV
        </Button>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search instructor or domain..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredInstructors}
        loading={loading}
        emptyMessage="No instructor performance data available."
      />
    </div>
  );
};

export default InstructorPerformanceTable;
