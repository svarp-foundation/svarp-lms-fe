import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import {
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { TableSkeleton } from "../../components/Skeletons";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get("/admin/payments");
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.user_email.toLowerCase().includes(searchLower) ||
      payment.course_title.toLowerCase().includes(searchLower) ||
      (payment.payment_id &&
        payment.payment_id.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "failed":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">
              Payments History
            </h1>
            <p className="text-xs text-slate-500">
              Track all course transaction records on the platform.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by email, course, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filteredPayments.length === 0 ? (
          <div className="text-center text-xs text-slate-400 italic py-8 bg-white border border-slate-200 rounded-lg shadow-xs">
            No transactions found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-md border border-slate-200 p-2 flex flex-col justify-between space-y-1.5 hover:border-slate-300 transition-colors shadow-xs animate-fadeIn"
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-100 uppercase tracking-wide">
                      #{p.payment_id || p.id.slice(0, 8)}
                    </span>
                    <h3 className="text-xs font-bold text-accent mt-1 truncate">
                      {p.user_email}
                    </h3>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5" title={p.course_title}>
                      {p.course_title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-accent block">
                      {p.currency === "INR" ? "₹" : p.currency + " "}
                      {p.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
                      {formatDate(p.created_at)}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center">
                  <span
                    className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusBadge(p.status)}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Payments;
