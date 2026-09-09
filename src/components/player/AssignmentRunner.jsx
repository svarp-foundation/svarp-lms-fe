import React, { useState } from "react";
import { FormTextarea, FileUpload, StatusBadge, Button } from "../common";
import { getMediaUrl } from "../../config";
import { ClipboardList, Upload, FileText, ExternalLink, Clock } from "lucide-react";

export const AssignmentRunner = ({
  lesson,
  submission,
  onSubmitAssignment,
  submitting = false,
}) => {
  const [textResponse, setTextResponse] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textResponse.trim() && !selectedFile) {
      alert("Please provide text answers or attach a submission file.");
      return;
    }
    onSubmitAssignment({
      textResponse,
      file: selectedFile,
    });
  };

  const isSubmitted = !!submission;
  const fileUrl = submission?.file_url ? getMediaUrl(submission.file_url) : null;

  return (
    <div className="space-y-6">
      {/* Assignment Brief */}
      <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Practical Assignment
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {lesson.assignment_title || lesson.title}
            </h3>
          </div>

          {lesson.due_date && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Clock size={13} />
              <span>Due: {new Date(lesson.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {lesson.assignment_description || lesson.content || "Follow assignment instructions and submit your response below."}
        </div>
      </div>

      {/* Existing Submission Status Card */}
      {isSubmitted && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Your Current Submission
            </h4>
            <StatusBadge status={submission.status || "pending"} />
          </div>

          {submission.grade !== null && typeof submission.grade !== "undefined" && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span>Awarded Score:</span>
              <span className="text-emerald-700">{submission.grade}%</span>
            </div>
          )}

          {submission.feedback && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">Instructor Feedback:</p>
              <p className="text-slate-600">{submission.feedback}</p>
            </div>
          )}

          {fileUrl && (
            <div className="pt-1">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <FileText size={14} />
                <span>View Submitted Attachment</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Submission Form (if not submitted or needs resubmission) */}
      {(!isSubmitted || submission.status === "rejected") && (
        <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            {isSubmitted ? "Resubmit Assignment" : "Submit Assignment Solution"}
          </h4>

          <FormTextarea
            label="Solution Text / Notes / Links"
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
            rows={5}
            placeholder="Write your explanation, code solution, or repository links here..."
          />

          <FileUpload
            label="Attach Solution Document or Archive (Optional)"
            accept=".pdf,.zip,.tar.gz,.doc,.docx,.png,.jpg"
            onFileSelect={setSelectedFile}
            fileName={selectedFile?.name}
            type="file"
            helperText="Supported formats: PDF, ZIP, DOCX, PNG (Max 50MB)"
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={Upload}
            >
              Submit Assignment
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignmentRunner;
