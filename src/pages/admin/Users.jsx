import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../lib/api";
import { PageHeader, FilterTabs, SearchBar, Button } from "../../components/common";
import {
  UserTable,
  InstructorApplicationTable,
  ApplicationReviewModal,
  CsvUserImporter,
} from "../../components/users";
import { Upload, Users as UsersIcon, Briefcase } from "lucide-react";

const Users = () => {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "applications"
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // CSV Importer Modal State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchApplications();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users`);
      setUsers(response.data || []);
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
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching instructor applications:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRoleId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      await fetchApplications();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(error.response?.data?.detail || "Failed to update user role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setReviewFeedback(app.admin_feedback || "");
  };

  const handleApproveApp = async () => {
    if (!selectedApp) return;
    setSubmittingReview(true);
    try {
      await api.put(`/admin/instructor-applications/${selectedApp.id}/review`, {
        status: "approved",
        admin_feedback: reviewFeedback,
      });
      setSelectedApp(null);
      await fetchApplications();
      await fetchUsers();
    } catch (error) {
      console.error("Error approving application:", error);
      alert(error.response?.data?.detail || "Failed to approve application.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRejectApp = async () => {
    if (!selectedApp) return;
    setSubmittingReview(true);
    try {
      await api.put(`/admin/instructor-applications/${selectedApp.id}/review`, {
        status: "rejected",
        admin_feedback: reviewFeedback,
      });
      setSelectedApp(null);
      await fetchApplications();
      await fetchUsers();
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert(error.response?.data?.detail || "Failed to reject application.");
    } finally {
      setSubmittingReview(false);
    }
  };


  const handleCsvImport = async (file) => {
    setImportingCsv(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/admin/users/batch-import`, formData);
      alert(
        `Batch import completed: ${res.data?.created ?? "users"} created successfully.`
      );
      setShowCsvModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert(error.response?.data?.detail || "Failed to import users from CSV.");
    } finally {
      setImportingCsv(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      (u.full_name || "")?.toLowerCase().includes(s) ||
      (u.email || "")?.toLowerCase().includes(s) ||
      u.id?.toString().includes(s)
    );
  });

  const pendingAppsCount = applications.filter((a) => a.status === "pending").length;

  const tabOptions = [
    {
      id: "users",
      label: "User Accounts",
      icon: UsersIcon,
      count: users.length,
    },
    {
      id: "applications",
      label: "Instructor Applications",
      icon: Briefcase,
      count: pendingAppsCount > 0 ? pendingAppsCount : undefined,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="User Accounts & Permissions"
          subtitle="Manage platform learners, instructors, permissions, and applicant reviews"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCsvModal(true)}
              icon={Upload}
            >
              Import CSV
            </Button>
          }
        />

        {/* Tab switcher + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <FilterTabs
            tabs={tabOptions}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "users" && (
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or ID..."
              className="w-full sm:w-72"
            />
          )}
        </div>

        {/* Tab View 1: Users Table */}
        {activeTab === "users" && (
          <UserTable
            users={filteredUsers}
            loading={loading}
            onRoleChange={handleRoleChange}
            updatingRoleId={updatingRoleId}
          />
        )}

        {/* Tab View 2: Applications Table */}
        {activeTab === "applications" && (
          <InstructorApplicationTable
            applications={applications}
            loading={loadingApps}
            onReview={handleOpenReview}
          />
        )}

        {/* Application Review Modal */}
        <ApplicationReviewModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
          feedback={reviewFeedback}
          onFeedbackChange={setReviewFeedback}
          onApprove={handleApproveApp}
          onReject={handleRejectApp}
          loading={submittingReview}
        />

        {/* CSV User Importer Modal */}
        <CsvUserImporter
          isOpen={showCsvModal}
          onClose={() => setShowCsvModal(false)}
          onImport={handleCsvImport}
          importing={importingCsv}
        />
      </div>
    </AdminLayout>
  );
};

export default Users;
