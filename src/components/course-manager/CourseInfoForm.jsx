import React, { useState } from "react";
import {
  FormInput,
  FormTextarea,
  FormSelect,
  ToggleSwitch,
  FileUpload,
  FilterTabs,
  Button,
} from "../common";
import { getMediaUrl } from "../../config";
import { Trash2, AlertCircle, Image as ImageIcon, Upload, Link as LinkIcon } from "lucide-react";

export const CourseInfoForm = ({
  formData,
  onChange,
  onThumbnailUpload,
  uploadingThumbnail = false,
  onSubmit,
  saving = false,
  isEditing = false,
}) => {
  const [thumbnailMode, setThumbnailMode] = useState(
    formData.thumbnail_url?.startsWith("http") ? "url" : "upload"
  );
  const [imageLoadError, setImageLoadError] = useState(false);

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

  const thumbnailTabs = [
    { id: "upload", label: "Upload Image" },
    { id: "url", label: "Image URL / Link" },
  ];

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

        {/* Course Thumbnail Selector (Upload or Link) */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Course Thumbnail
              </label>
              <p className="text-[11px] text-slate-400">
                Upload an image or paste a direct web image link (16:9 ratio recommended)
              </p>
            </div>
            <FilterTabs
              tabs={thumbnailTabs}
              activeTab={thumbnailMode}
              onChange={(tab) => {
                setThumbnailMode(tab);
                setImageLoadError(false);
              }}
            />
          </div>

          {thumbnailMode === "upload" ? (
            <div className="space-y-2">
              <FileUpload
                accept="image/*"
                onFileSelect={onThumbnailUpload}
                previewUrl={thumbnailPreview}
                loading={uploadingThumbnail}
                type="image"
                helperText="Recommended size: 1280×720 (16:9). Max 5MB."
              />
              {formData.thumbnail_url && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      onChange({
                        target: { name: "thumbnail_url", value: "" },
                      });
                      setImageLoadError(false);
                    }}
                    icon={Trash2}
                  >
                    Remove Thumbnail
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <FormInput
                label="Image URL"
                name="thumbnail_url"
                value={formData.thumbnail_url || ""}
                onChange={(e) => {
                  setImageLoadError(false);
                  onChange(e);
                }}
                placeholder="https://images.unsplash.com/... or https://example.com/cover.jpg"
                helperText="Paste direct public image link (JPG, PNG, WebP) from web, CDN or cloud storage"
              />

              {formData.thumbnail_url && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Thumbnail Preview
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        onChange({
                          target: { name: "thumbnail_url", value: "" },
                        });
                        setImageLoadError(false);
                      }}
                      icon={Trash2}
                    >
                      Clear Link
                    </Button>
                  </div>

                  <div className="relative w-full max-w-sm h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {!imageLoadError ? (
                      <img
                        src={getMediaUrl(formData.thumbnail_url)}
                        alt="Course thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageLoadError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 p-4 text-center text-red-500">
                        <AlertCircle size={20} />
                        <span className="text-xs font-semibold">Unable to load image preview</span>
                        <span className="text-[11px] text-slate-400">
                          Please verify that the URL is a valid, publicly accessible image link
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
