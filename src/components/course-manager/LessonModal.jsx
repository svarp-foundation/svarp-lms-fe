import React from "react";
import { Modal, FormInput, FormSelect, FormTextarea, FileUpload, Button } from "../common";
import QuizEditor from "./QuizEditor";
import AssignmentEditor from "./AssignmentEditor";
import { Video, FileText, HelpCircle, ClipboardList } from "lucide-react";

const LESSON_TYPES = [
  { value: "video", label: "Video Lesson", icon: Video },
  { value: "text", label: "Reading / Article (Markdown)", icon: FileText },
  { value: "quiz", label: "MCQ Assessment / Quiz", icon: HelpCircle },
  { value: "assignment", label: "Subjective / Project Assignment", icon: ClipboardList },
];

export const LessonModal = ({
  isOpen,
  onClose,
  lessonForm,
  onChange,
  onQuestionsChange,
  onVideoUpload,
  uploadingVideo = false,
  onSubmit,
  isEditing = false,
  saving = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Lesson Content" : "Create New Lesson"}
      subtitle="Select the content format and configure lesson materials"
      size="3xl"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormInput
              label="Lesson Title"
              name="title"
              value={lessonForm.title || ""}
              onChange={onChange}
              placeholder="e.g. 1.1 Introduction to Reactive Architecture"
              required
            />
          </div>

          <FormSelect
            label="Lesson Type"
            name="lesson_type"
            value={lessonForm.lesson_type || "video"}
            onChange={onChange}
            options={LESSON_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
          />
        </div>

        {/* Video Lesson Type Form */}
        {lessonForm.lesson_type === "video" && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <FormInput
              label="Video Stream URL (Direct MP4, YouTube, Vimeo, or Hosted S3)"
              name="video_url"
              value={lessonForm.video_url || ""}
              onChange={onChange}
              placeholder="https://www.youtube.com/watch?v=... or https://..."
            />

            {onVideoUpload && (
              <FileUpload
                label="Or Upload Video File Directly"
                accept="video/*"
                onFileSelect={onVideoUpload}
                fileName={lessonForm.video_url?.split("/").pop()}
                loading={uploadingVideo}
                type="file"
                helperText="Supported formats: MP4, WebM, MOV. Max 500MB."
              />
            )}

            <FormTextarea
              label="Accompanying Lesson Notes / Resources (Optional)"
              name="content"
              value={lessonForm.content || ""}
              onChange={onChange}
              rows={4}
              placeholder="Provide supplementary notes, code snippets, or reference links..."
            />
          </div>
        )}

        {/* Text Article Lesson Type */}
        {lessonForm.lesson_type === "text" && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <FormTextarea
              label="Article / Reading Content (Markdown Supported)"
              name="content"
              value={lessonForm.content || ""}
              onChange={onChange}
              rows={8}
              placeholder="Write the full lesson text here. Supports standard Markdown syntax for headings, bold, code blocks, lists, and links."
              required
            />
          </div>
        )}

        {/* Quiz MCQ Assessment Type */}
        {lessonForm.lesson_type === "quiz" && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <QuizEditor
              questions={lessonForm.questions || []}
              onChange={onQuestionsChange}
            />
          </div>
        )}

        {/* Assignment Subjective Project Type */}
        {lessonForm.lesson_type === "assignment" && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <AssignmentEditor
              lessonForm={lessonForm}
              onChange={onChange}
            />
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
          >
            {isEditing ? "Update Lesson" : "Add Lesson"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LessonModal;
