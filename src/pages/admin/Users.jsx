import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

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
      document.getElementById("csvInput").value = "";
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
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>

        {/* Bulk Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Bulk Add Users (CSV)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Format: email, full_name, password
          </p>
          <div className="flex gap-4 items-center">
            <input
              id="csvInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="border p-2 rounded"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`px-4 py-2 rounded text-white ${
                uploading || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-opacity-90"
              }`}
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>
          {message && (
            <div
              className={`mt-4 p-2 rounded ${
                message.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
          {errors.length > 0 && (
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-700 rounded">
              <p className="font-bold">Warnings/Errors:</p>
              <ul className="list-disc pl-5">
                {errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600">
                  ID
                </th>
                <th className="p-4 text-left font-semibold text-gray-600">
                  Full Name
                </th>
                <th className="p-4 text-left font-semibold text-gray-600">
                  Email
                </th>
                <th className="p-4 text-left font-semibold text-gray-600">
                  Role
                </th>
                <th className="p-4 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-4 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4">{user.full_name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_suspended
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.is_suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="p-4 relative">
                      {user.role !== "admin" && (
                        <div className="flex items-center gap-2">
                          {confirmingId === user.id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleSuspend(user.id, !user.is_suspended)
                                }
                                className={`px-3 py-1 rounded text-sm text-white ${
                                  user.is_suspended
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`}
                              >
                                Confirm{" "}
                                {user.is_suspended ? "Unsuspend" : "Suspend"}
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmingId(user.id)}
                              className={`px-3 py-1 rounded text-sm text-white ${
                                user.is_suspended
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                            >
                              {user.is_suspended ? "Unsuspend" : "Suspend"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
