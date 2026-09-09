import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import { PageHeader, DataTable, SearchBar, StatusBadge } from "../../components/common";
import { IndianRupee } from "lucide-react";

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
      setPayments(response.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.user_email?.toLowerCase().includes(searchLower) ||
      payment.course_title?.toLowerCase().includes(searchLower) ||
      payment.payment_id?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      key: "transaction",
      label: "Transaction ID",
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 font-semibold">
          {row.payment_id || `TXN-${row.id}`}
        </span>
      ),
    },
    {
      key: "user",
      label: "Learner Email",
      render: (row) => (
        <span className="font-bold text-slate-900">{row.user_email}</span>
      ),
    },
    {
      key: "course",
      label: "Course Title",
      render: (row) => (
        <span className="text-slate-700 font-medium line-clamp-1">
          {row.course_title}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => (
        <span className="font-extrabold text-emerald-700">
          ₹{row.amount?.toLocaleString("en-IN") || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Payment Status",
      render: (row) => <StatusBadge status={row.status || "success"} />,
    },
    {
      key: "date",
      label: "Date",
      align: "right",
      render: (row) => (
        <span className="text-slate-500 whitespace-nowrap">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Recent"}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payment Transactions"
          subtitle="Track and audit platform payment records, checkout transactions, and revenue"
          actions={
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email, course, or ID..."
              className="w-full sm:w-72"
            />
          }
        />

        <DataTable
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyTitle="No payment records found"
          emptyDescription="No transactions match your search query."
        />
      </div>
    </AdminLayout>
  );
};

export default Payments;
