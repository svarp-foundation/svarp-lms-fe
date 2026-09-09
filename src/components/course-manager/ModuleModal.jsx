import React from "react";
import { Modal, FormInput, FormTextarea, Button } from "../common";

export const ModuleModal = ({
  isOpen,
  onClose,
  moduleForm,
  onChange,
  onSubmit,
  isEditing = false,
  saving = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Course Module" : "Add New Course Module"}
      subtitle="Modules organize lessons, assignments, and assessments sequentially"
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Module Title"
          name="title"
          value={moduleForm.title || ""}
          onChange={onChange}
          placeholder="e.g. Module 1: Core Fundamentals & Setup"
          required
        />

        <FormTextarea
          label="Module Description (Optional)"
          name="description"
          value={moduleForm.description || ""}
          onChange={onChange}
          rows={3}
          placeholder="Brief summary of the topics covered in this module..."
        />

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
            {isEditing ? "Update Module" : "Add Module"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModuleModal;
