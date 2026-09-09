import React from "react";
import InstructorLayout from "../../components/InstructorLayout";
import { CourseStudio } from "../../components/course-manager";

const InstructorCourseManager = () => {
  return (
    <InstructorLayout>
      <CourseStudio
        apiPrefix="/instructor"
        title="Instructor Course Studio"
        subtitle="Design rich curricula, author video lessons, and manage student assessments"
      />
    </InstructorLayout>
  );
};

export default InstructorCourseManager;
