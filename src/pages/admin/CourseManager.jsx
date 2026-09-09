import React from "react";
import AdminLayout from "../../components/AdminLayout";
import { CourseStudio } from "../../components/course-manager";

const AdminCourseManager = () => {
  return (
    <AdminLayout>
      <CourseStudio
        apiPrefix="/admin"
        title="Course Management"
        subtitle="Manage all platform courses, curriculum structure, pricing, and assessments"
      />
    </AdminLayout>
  );
};

export default AdminCourseManager;
