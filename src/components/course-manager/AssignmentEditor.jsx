import React from "react";
import { FormInput, FormTextarea } from "../common";

export const AssignmentEditor = ({ lessonForm, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Assignment Assessment Details
        </h4>
        <p className="text-[11px] text-slate-500">
          Define coding or essay prompts that learners must submit for instructor review
        </p>
      </div>

      <FormInput
        label="Assignment Subtitle / Prompt Header"
        name="assignment_title"
        value={lessonForm.assignment_title || ""}
        onChange={onChange}
        placeholder="e.g. Project Phase 1: Build the Database Schema"
      />

      <FormTextarea
        label="Assignment Problem Statement & Guidelines"
        name="assignment_description"
        value={lessonForm.assignment_description || ""}
        onChange={onChange}
        rows={5}
        placeholder="Provide complete assignment guidelines, expected outcomes, criteria, and submission specifications..."
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Due Date (Optional)"
          name="due_date"
          type="date"
          value={lessonForm.due_date || ""}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default AssignmentEditor;
