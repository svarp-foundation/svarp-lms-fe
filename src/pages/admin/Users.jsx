import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Shield,
  UserMinus,
  UserCheck,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Track inline confirmation state: { [userId]: true | false }
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.id?.toString().includes(s)
    );
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setErrors([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await api.post(`/admin/users/bulk`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
      setErrors(response.data.errors || []);
      setFile(null);
      // Reset file input
      const input = document.getElementById("csvInput");
      if (input) input.value = "";
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
      if (error.response?.data?.detail) {
        setMessage(`Error: ${error.response.data.detail}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSuspend = async (userId, suspendStatus) => {
    try {
      await api.post(`/admin/users/${userId}/suspend?suspend=${suspendStatus}`);
      setConfirmingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating suspension status:", error);
      alert(error.response?.data?.detail || "Failed to update user status");
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="p-2.5 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                <UsersIcon size={24} className="stroke-[2.5]" />
              </span>
              User Management
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Manage your community, bulk import learners, and control access.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search learners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Bulk Action & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Stats */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <UsersIcon size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Shield size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </div>

          {/* Bulk Upload Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <FileText size={120} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <UserPlus size={20} className="text-primary" />
              Bulk Add Users (CSV)
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex-1 relative">
                  <input
                    id="csvInput"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 font-sans"
                  />
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {file ? file.name : "Choose CSV file..."}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className={`px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                    uploading || !file
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-opacity-90 hover:shadow-primary/20"
                  }`}
                >
                  {uploading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Upload size={18} /> Upload CSV
                    </>
                  )}
                </button>
              </div>

              {message && (
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
                    message.includes("Error")
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-green-50 text-green-600 border border-green-100"
                  }`}
                >
                  <AlertCircle size={16} />
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User List Table */}
        <div className="bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/80">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="h-8 bg-gray-200 rounded-lg w-24 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-20 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
                          <UsersIcon size={40} />
                        </div>
                        <p className="font-medium text-gray-500">
                          No learners found matching your search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const initials = user.full_name
                      ? user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : user.email[0].toUpperCase();
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {user.full_name || "—"}
                              </p>
                              <p className="text-xs text-gray-400 font-medium font-mono">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <Shield size={12} />
                            ) : (
                              <UsersIcon size={12} />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              user.is_suspended
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-green-50 text-green-700 border-green-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${user.is_suspended ? "bg-red-500" : "bg-green-500 animate-pulse"}`}
                            />
                            {user.is_suspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.role !== "admin" && (
                            <div className="flex items-center justify-end gap-2">
                              {confirmingId === user.id ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleSuspend(user.id, !user.is_suspended)
                                    }
                                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                                      user.is_suspended
                                        ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                                        : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                    }`}
                                  >
                                    Confirm{" "}
                                    {user.is_suspended
                                      ? "Unsuspend"
                                      : "Suspend"}
                                  </button>
                                  <button
                                    onClick={() => setConfirmingId(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setConfirmingId(user.id)}
                                  className={`p-2 rounded-xl transition-all shadow-sm border ${
                                    user.is_suspended
                                      ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                                      : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                  }`}
                                  title={
                                    user.is_suspended ? "Unsuspend" : "Suspend"
                                  }
                                >
                                  {user.is_suspended ? (
                                    <UserCheck size={18} />
                                  ) : (
                                    <UserMinus size={18} />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
