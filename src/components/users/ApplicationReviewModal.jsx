import React from "react";
import { Modal, FormTextarea, Button } from "../common";
import { ExternalLink, CheckCircle2, XCircle, FileText } from "lucide-react";

export const ApplicationReviewModal = ({
  isOpen,
  onClose,
  application,
  feedback,
  onFeedbackChange,
  onApprove,
  onReject,
  loading = false,
}) => {
  if (!application) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instructor Application Review"
      subtitle={`Applicant: ${application.full_name || application.user?.full_name || "Applicant"}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Applicant Overview Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Full Name & Email
            </span>
            <p className="font-bold text-slate-900 mt-0.5">
              {application.full_name || application.user?.full_name}
            </p>
            <p className="text-slate-500">
              {application.email || application.user?.email}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Domain Expertise
            </span>
            <p className="font-bold text-slate-900 mt-0.5">
              {application.domain || application.specialty}
            </p>
            {application.sub_specialty && (
              <p className="text-slate-500">{application.sub_specialty}</p>
            )}
          </div>
        </div>

        {/* Bio / Motivation */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Professional Bio & Experience
          </span>
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {application.bio || "No biography provided."}
          </div>
        </div>

        {/* Resume or Portfolio Link if available */}
        {application.portfolio_url && (
          <div>
            <a
              href={application.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <ExternalLink size={14} />
              <span>View Portfolio / Resume Profile</span>
            </a>
          </div>
        )}

        {/* Feedback Input */}
        <div className="pt-2 border-t border-slate-100">
          <FormTextarea
            label="Reviewer Feedback / Comments"
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            rows={3}
            placeholder="Add approval notes or constructive feedback on the application..."
          />
        </div>

        {/* Decision Actions */}
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
            type="button"
            variant="danger"
            size="sm"
            onClick={onReject}
            loading={loading}
            icon={XCircle}
          >
            Reject Application
          </Button>
          <Button
            type="button"
            variant="emerald"
            size="sm"
            onClick={onApprove}
            loading={loading}
            icon={CheckCircle2}
          >
            Approve & Promote to Instructor
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationReviewModal;
