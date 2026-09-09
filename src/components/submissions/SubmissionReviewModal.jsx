import React from "react";
import { Modal, FormInput, FormSelect, FormTextarea, Button } from "../common";
import { getMediaUrl } from "../../config";
import { FileText, ExternalLink, User, Calendar, Award } from "lucide-react";

export const SubmissionReviewModal = ({
  isOpen,
  onClose,
  submission,
  reviewForm,
  onChange,
  onSubmit,
  loading = false,
}) => {
  if (!submission) return null;

  const fileUrl = submission.file_url ? getMediaUrl(submission.file_url) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluate Student Submission"
      subtitle={`Review assignment for ${submission.user_name || submission.user?.full_name || "Student"}`}
      size="2xl"
    >
      <div className="space-y-5">
        {/* Student & Course Summary Banner */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Learner Details
            </span>
            <p className="font-bold text-slate-900">
              {submission.user_name || submission.user?.full_name || "Anonymous Learner"}
            </p>
            <p className="text-slate-500">
              {submission.user_email || submission.user?.email || "No email available"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Course & Module
            </span>
            <p className="font-bold text-slate-900 line-clamp-1">
              {submission.course_title || submission.course?.title || "Course"}
            </p>
            <p className="text-slate-500 line-clamp-1">
              {submission.module_title || submission.module?.title || "Module"}
            </p>
          </div>
        </div>

        {/* Submission Work / Content */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Submitted Work
          </h4>

          {submission.text_response || submission.submission_text || submission.content ? (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {submission.text_response || submission.submission_text || submission.content}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No text notes submitted.</p>
          )}

          {fileUrl && (
            <div className="pt-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
              >
                <FileText size={16} className="text-[#1f3b45]" />
                <span>View / Download Submitted Attachment</span>
                <ExternalLink size={13} className="text-slate-400" />
              </a>
            </div>
          )}
        </div>

        {/* Grading & Feedback Form */}
        <form onSubmit={onSubmit} className="space-y-4 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Grading & Feedback
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Evaluation Decision"
              name="status"
              value={reviewForm.status || "approved"}
              onChange={onChange}
              options={[
                { value: "approved", label: "Approve Submission (Pass)" },
                { value: "rejected", label: "Needs Revision / Reject" },
              ]}
              required
            />

            <FormInput
              label="Awarded Score (%)"
              name="grade"
              type="number"
              min="0"
              max="100"
              value={reviewForm.grade ?? 100}
              onChange={onChange}
              required
            />
          </div>

          <FormTextarea
            label="Feedback for Student"
            name="feedback"
            value={reviewForm.feedback || ""}
            onChange={onChange}
            rows={3}
            placeholder="Explain strengths or required improvements to guide the student..."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
            >
              Submit Evaluation
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SubmissionReviewModal;
