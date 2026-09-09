import React from "react";
import { FormInput, FormTextarea, FormSelect, ToggleSwitch, FileUpload, Button } from "../common";
import { getMediaUrl } from "../../config";

export const CourseInfoForm = ({
  formData,
  onChange,
  onThumbnailUpload,
  uploadingThumbnail = false,
  onSubmit,
  saving = false,
  isEditing = false,
}) => {
  const handleToggle = (name) => {
    onChange({
      target: {
        name,
        value: !formData[name],
      },
    });
  };

  const thumbnailPreview = formData.thumbnail_url
    ? getMediaUrl(formData.thumbnail_url)
    : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          General Information
        </h3>

        <FormInput
          label="Course Title"
          name="title"
          value={formData.title || ""}
          onChange={onChange}
          placeholder="e.g. Full-Stack Modern Web Development"
          required
        />

        <FormTextarea
          label="Course Description"
          name="description"
          value={formData.description || ""}
          onChange={onChange}
          rows={4}
          placeholder="Provide a comprehensive summary of what learners will master in this course..."
        />

        <FileUpload
          label="Course Thumbnail"
          accept="image/*"
          onFileSelect={onThumbnailUpload}
          previewUrl={thumbnailPreview}
          loading={uploadingThumbnail}
          type="image"
          helperText="Recommended size: 1280x720 (16:9). Max 5MB."
        />
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Publishing & Pricing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Publication Status"
            name="status"
            value={formData.status || "draft"}
            onChange={onChange}
            options={[
              { value: "draft", label: "Draft (Hidden from Catalog)" },
              { value: "published", label: "Published (Visible in Catalog)" },
            ]}
          />

          <div>
            <div className="mb-2">
              <ToggleSwitch
                id="is_paid"
                name="is_paid"
                checked={!!formData.is_paid}
                onChange={() => handleToggle("is_paid")}
                label="Paid Course"
                description="Charge students for access"
              />
            </div>

            {formData.is_paid && (
              <FormInput
                label="Course Price (₹)"
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price ?? 0}
                onChange={onChange}
                placeholder="e.g. 999"
                required
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Completion & Certification Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Passing Score (%)"
            name="passing_score"
            type="number"
            min="0"
            max="100"
            value={formData.passing_score ?? 70}
            onChange={onChange}
            helperText="Minimum score required for quizzes and assignments"
          />

          <div className="space-y-3 pt-2">
            <ToggleSwitch
              id="require_all_lessons_completed"
              name="require_all_lessons_completed"
              checked={formData.require_all_lessons_completed ?? true}
              onChange={() => handleToggle("require_all_lessons_completed")}
              label="Require All Lessons"
              description="Learner must view all modules before certificate unlock"
            />

            <ToggleSwitch
              id="require_assignment_approval"
              name="require_assignment_approval"
              checked={!!formData.require_assignment_approval}
              onChange={() => handleToggle("require_assignment_approval")}
              label="Require Instructor Assignment Review"
              description="Assignments must be manually evaluated before certification"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
        >
          {isEditing ? "Save Course Details" : "Create Course & Continue"}
        </Button>
      </div>
    </form>
  );
};

export default CourseInfoForm;
