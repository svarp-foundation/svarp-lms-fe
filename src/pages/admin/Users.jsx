import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import {
  Users as UsersIcon,
  Search,
  Upload,
  FileText,
  AlertCircle,
  Download,
  Shield,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { TableSkeleton } from "../../components/Skeletons";

const Users = () => {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "applications"
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  // Review modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reviewAction, setReviewAction] = useState(null); // "approved" | "rejected"
  const [submittingReview, setSubmittingReview] = useState(false);

  const [csvPreview, setCsvPreview] = useState([]);
  const [previewError, setPreviewError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchApplications();
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

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const response = await api.get(`/admin/instructor-applications`);
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching instructor applications:", error);
    } finally {
      setLoadingApps(false);
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

  const pendingAppsCount = applications.filter((a) => a.status === "pending").length;

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRoleId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      await fetchApplications();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(error.response?.data?.detail || "Failed to update user role");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleOpenReview = (app, action) => {
    setSelectedApp(app);
    setReviewAction(action);
    setFeedback(
      action === "approved"
        ? "Welcome to the instructor team! You now have full studio access."
        : "Thank you for applying. Currently, we require further credentials."
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedApp || !reviewAction) return;
    setSubmittingReview(true);
    try {
      await api.put(`/admin/instructor-applications/${selectedApp.id}/review`, {
        status: reviewAction,
        admin_feedback: feedback,
      });
      setSelectedApp(null);
      setReviewAction(null);
      setFeedback("");
      await fetchApplications();
      await fetchUsers();
    } catch (error) {
      console.error("Error reviewing application:", error);
      alert(error.response?.data?.detail || "Failed to process review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) {
      return { error: "CSV file is empty." };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const emailIdx = headers.indexOf("email");
    const nameIdx = headers.indexOf("full_name");
    const passwordIdx = headers.indexOf("password");

    if (emailIdx === -1 || passwordIdx === -1) {
      return { error: "CSV must contain at least 'email' and 'password' headers." };
    }

    const parsedData = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length < Math.max(emailIdx, passwordIdx) + 1) continue;

      parsedData.push({
        email: cols[emailIdx] || "",
        full_name: nameIdx !== -1 ? cols[nameIdx] || "" : "",
        password: cols[passwordIdx] || "",
      });
    }

    return { data: parsedData };
  };

  const processSelectedFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      setPreviewError("Only CSV files are allowed.");
      setFile(null);
      setCsvPreview([]);
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setErrors([]);
    setPreviewError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      if (parsed.error) {
        setPreviewError(parsed.error);
        setCsvPreview([]);
      } else {
        setCsvPreview(parsed.data);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processSelectedFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setCsvPreview([]);
    setPreviewError("");
    setMessage("");
    setErrors([]);
    const input = document.getElementById("csvInput");
    if (input) input.value = "";
  };

  const handleDownloadSample = () => {
    const csvContent =
      "email,full_name,password\n" +
      "learner1@example.com,John Doe,SecurePass123\n" +
      "learner2@example.com,Jane Smith,SecurePass456\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "svarp_bulk_users_sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      setCsvPreview([]);
      const input = document.getElementById("csvInput");
      if (input) input.value = "";
      fetchUsers();
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

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user from LMS? All course progress, enrollments, and certificates will be removed."
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user from LMS:", error);
      alert(error.response?.data?.detail || "Failed to delete user from LMS");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-accent">User & Instructor Management</h1>
            <p className="text-xs text-slate-500">
              Manage member roles, permissions, bulk additions, and review instructor applications.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-white text-accent font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-accent"
              }`}
            >
              <UsersIcon size={14} />
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "applications"
                  ? "bg-white text-accent font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-accent"
              }`}
            >
              <Briefcase size={14} />
              Instructor Applications
              {pendingAppsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold animate-pulse">
                  {pendingAppsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: All Users */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-3 py-1.5 outline-none focus:border-accent text-xs font-semibold"
                />
              </div>
            </div>

            {/* Stats Row & Bulk Upload Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Summary Stats */}
              <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0">
                    <UsersIcon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Total Users
                    </p>
                    <p className="text-lg font-extrabold text-accent mt-0.5">{users.length}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Instructors
                    </p>
                    <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                      {users.filter((u) => u.role === "instructor").length}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-accent flex items-center justify-center flex-shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Admins
                    </p>
                    <p className="text-lg font-extrabold text-accent mt-0.5">
                      {users.filter((u) => u.role === "admin").length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bulk Upload Section */}
              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <h2 className="text-xs font-bold text-accent flex items-center gap-1.5 mb-2">
                    <Upload size={14} />
                    Bulk Add Users (CSV)
                  </h2>

                  <div className="space-y-3">
                    {/* Dropzone */}
                    {!file ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all flex flex-col items-center justify-center min-h-[120px] relative ${
                          isDragOver
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <input
                          id="csvInput"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-accent flex items-center justify-center mb-2">
                          <Upload size={16} />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          Drag and drop your CSV file here, or{" "}
                          <span className="text-primary hover:underline">browse</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Supports .csv files with headers (email, full_name, password)
                        </p>
                      </div>
                    ) : (
                      /* Selected File */
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-accent flex items-center justify-center flex-shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-accent truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {(file.size / 1024).toFixed(2)} KB • {csvPreview.length} records found
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleCancelFile}
                            className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-all text-[10px] font-bold"
                          >
                            Change
                          </button>
                          <button
                            onClick={handleUpload}
                            disabled={uploading || csvPreview.length === 0}
                            className="px-3 py-1.5 rounded bg-primary text-white hover:bg-opacity-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all text-[10px] font-bold"
                          >
                            {uploading ? "Uploading..." : "Import Users"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview Error */}
                    {previewError && (
                      <div className="flex items-center gap-2.5 p-2 rounded border border-red-100 bg-red-50 text-[10px] font-semibold text-red-600">
                        <AlertCircle size={12} />
                        {previewError}
                      </div>
                    )}

                    {/* Upload Status Message */}
                    {message && (
                      <div
                        className={`flex flex-col gap-1.5 p-3 rounded border text-xs font-semibold ${
                          message.toLowerCase().includes("error") || errors.length > 0
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <AlertCircle size={14} />
                          {message}
                        </div>
                        {errors.length > 0 && (
                          <ul className="mt-1 text-[10px] space-y-0.5 pl-5 list-disc opacity-90 max-h-20 overflow-y-auto">
                            {errors.map((err, idx) => (
                              <li key={idx} className="font-mono">
                                {err}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* CSV Preview */}
                    {!previewError && csvPreview.length > 0 && (
                      <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                        <div className="px-3 py-1.5 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            Previewing learners ({csvPreview.length})
                          </span>
                          <span className="text-[8px] text-slate-400 font-medium italic">
                            First 5 rows displayed
                          </span>
                        </div>
                        <div className="max-h-28 overflow-y-auto">
                          <table className="w-full text-left text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                                <th className="px-3 py-1.5">Full Name</th>
                                <th className="px-3 py-1.5">Email</th>
                                <th className="px-3 py-1.5">Password</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {csvPreview.slice(0, 5).map((row, idx) => (
                                <tr key={idx} className="hover:bg-white transition-colors">
                                  <td className="px-3 py-1.5 text-slate-700 font-semibold truncate max-w-[100px]">
                                    {row.full_name || (
                                      <span className="text-slate-300 italic">None</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-1.5 text-slate-600 font-mono truncate max-w-[130px]">
                                    {row.email}
                                  </td>
                                  <td className="px-3 py-1.5 text-slate-400 font-mono truncate max-w-[100px]">
                                    {row.password ? (
                                      "••••••••"
                                    ) : (
                                      <span className="text-red-400 font-sans italic">Missing</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {csvPreview.length > 5 && (
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="px-3 py-1.5 text-center text-[9px] text-slate-400 font-medium italic"
                                  >
                                    ...and {csvPreview.length - 5} more rows
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CSV template download link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-medium text-slate-400">
                    Required headers:{" "}
                    <code className="bg-slate-50 text-slate-600 px-1 py-0.5 rounded border border-slate-100 font-mono">
                      email
                    </code>
                    ,{" "}
                    <code className="bg-slate-50 text-slate-600 px-1 py-0.5 rounded border border-slate-100 font-mono">
                      password
                    </code>
                    ,{" "}
                    <code className="bg-slate-50 text-slate-600 px-1 py-0.5 rounded border border-slate-100 font-mono">
                      full_name
                    </code>
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                  >
                    <Download size={12} /> Download CSV Sample
                  </button>
                </div>
              </div>
            </div>

            {/* User Card Grid */}
            {loading ? (
              <TableSkeleton rows={6} />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-xs text-slate-400 italic py-8 bg-white border border-slate-200 rounded-lg shadow-xs">
                No members found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredUsers.map((user) => {
                  const initials = user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : user.email[0].toUpperCase();
                  return (
                    <div
                      key={user.id}
                      className="bg-white rounded-md border border-slate-200 p-2.5 flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors shadow-xs animate-fadeIn"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-accent truncate">
                              {user.full_name || "—"}
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium truncate font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${
                            user.is_suspended
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {user.is_suspended ? "Suspended" : "Active"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 gap-2">
                        {/* Role Selector */}
                        <div className="flex items-center gap-1">
                          <select
                            value={user.role}
                            disabled={updatingRoleId === user.id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 outline-none cursor-pointer capitalize"
                          >
                            <option value="learner">Learner</option>
                            <option value="instructor">Instructor</option>
                            <option value="instructor_pending">Instructor (Pending)</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updatingRoleId === user.id && (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>

                        {user.role !== "admin" && (
                          <div className="flex items-center gap-1.5">
                            {confirmingId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSuspend(user.id, !user.is_suspended)}
                                  className={`px-2 py-0.5 rounded text-[8px] font-bold text-white transition-all ${
                                    user.is_suspended
                                      ? "bg-emerald-600 hover:bg-emerald-700"
                                      : "bg-red-600 hover:bg-red-700"
                                  }`}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmingId(null)}
                                  className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmingId(user.id)}
                                  className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:border-accent hover:text-accent transition-all"
                                  title={user.is_suspended ? "Unsuspend" : "Suspend"}
                                >
                                  {user.is_suspended ? (
                                    <svg
                                      className="w-3.5 h-3.5 text-emerald-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                      />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1 rounded bg-slate-50 border border-slate-200 text-red-500 hover:border-red-400 hover:bg-red-50 transition-all"
                                  title="Delete User from LMS"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Instructor Applications */}
        {activeTab === "applications" && (
          <div className="space-y-4 animate-fadeIn">
            {loadingApps ? (
              <TableSkeleton rows={4} />
            ) : applications.length === 0 ? (
              <div className="text-center text-xs text-slate-400 italic py-12 bg-white border border-slate-200 rounded-xl shadow-xs">
                No instructor applications submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const applicant = app.user || {};
                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-accent">
                              {applicant.full_name || "Applicant"}
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">
                              ({applicant.email})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                app.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : app.status === "rejected"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Specialty / Domain
                              </span>
                              <p className="font-semibold text-slate-700 mt-0.5">
                                {app.specialty || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Applied Date
                              </span>
                              <p className="text-slate-500 font-mono mt-0.5">
                                {new Date(app.applied_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          {app.bio && (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Bio & Experience
                              </span>
                              <p className="whitespace-pre-line leading-relaxed">{app.bio}</p>
                            </div>
                          )}

                          {app.admin_feedback && (
                            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-xs text-blue-900">
                              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">
                                Admin Feedback
                              </span>
                              <p>{app.admin_feedback}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                          {app.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleOpenReview(app, "approved")}
                                className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 size={14} />
                                Approve Application
                              </button>
                              <button
                                onClick={() => handleOpenReview(app, "rejected")}
                                className="w-full sm:w-auto px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleOpenReview(
                                    app,
                                    app.status === "approved" ? "rejected" : "approved"
                                  )
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold transition-all"
                              >
                                Change Status
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-accent">
                  {reviewAction === "approved" ? "Approve Instructor" : "Reject Application"}
                </h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-accent font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  You are about to mark the application from{" "}
                  <strong>{selectedApp.user?.full_name || selectedApp.user?.email}</strong> as{" "}
                  <span
                    className={
                      reviewAction === "approved"
                        ? "text-emerald-600 font-bold"
                        : "text-rose-600 font-bold"
                    }
                  >
                    {reviewAction.toUpperCase()}
                  </span>
                  .
                </p>
                {reviewAction === "approved" && (
                  <p className="text-[11px] text-slate-500">
                    This will grant them immediate access to the Instructor Studio to create and manage courses.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Admin Feedback / Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Feedback sent to applicant..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all ${
                    reviewAction === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submittingReview ? "Processing..." : `Confirm ${reviewAction}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
