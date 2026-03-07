import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import {
  IndianRupee,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
      case "completed":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "failed":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "failed":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                <IndianRupee size={24} className="stroke-[2.5]" />
              </span>
              Payments History
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              View and manage all course transaction records on the platform.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by email, course, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Learner</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/80">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <IndianRupee size={40} className="text-gray-200" />
                        <p className="font-medium">No payments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">
                          {payment.payment_id || "—"}
                        </p>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />{" "}
                          {formatDate(payment.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">
                          {payment.user_email}
                        </p>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {payment.course_title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(payment.status)}`}
                        >
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">
                            {payment.status.replace("_", " ")}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {payment.currency === "INR"
                            ? "₹"
                            : payment.currency + " "}
                          {payment.amount.toLocaleString("en-IN")}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Payments;
