import React, { useState } from "react";
import { Modal, FormTextarea, Button } from "../common";
import { Sparkles, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const CourseTextImporterModal = ({
  isOpen,
  onClose,
  onImport,
  importing = false,
}) => {
  const [text, setText] = useState("");
  const [parseError, setParseError] = useState("");

  const sampleTemplate = `---COURSE---
Title: Modern Full-Stack Python & React
Description: Learn modern web development from ground up.
Passing Score: 75
Price: 1499

---MODULE---
Title: Module 1: Architecture & Foundations
Description: Setting up environment and tools.

---LESSON---
Title: 1.1 Development Environment & Tooling
Type: video
Video URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Content: Setting up Node.js, Python, and VS Code.

---LESSON---
Title: 1.2 Introduction to React Principles
Type: text
Content: React is a component-driven declarative UI library.

---QUIZ---
Title: Module 1 Assessment Quiz
Question: What is JSX in React?
Options: JavaScript XML | Java Syntax Extension | JSON Schema XML | Just Simple XML
Correct: 0
Points: 10
Explanation: JSX stands for JavaScript XML.

---ASSIGNMENT---
Title: Project 1: Component Library
Description: Build a set of 3 reusable UI components with props.
`;

  const handleInsertSample = () => {
    setText(sampleTemplate);
    setParseError("");
  };

  const handleImportClick = () => {
    if (!text.trim()) {
      setParseError("Please provide course plain text content.");
      return;
    }
    setParseError("");
    onImport(text);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Course Text Importer"
      subtitle="Paste structured course curriculum text to automatically generate modules, lessons, and assessments"
      size="3xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Use standard section delimiters (<code>---COURSE---</code>, <code>---MODULE---</code>, <code>---LESSON---</code>, <code>---QUIZ---</code>, <code>---ASSIGNMENT---</code>).
          </p>
          <button
            type="button"
            onClick={handleInsertSample}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Insert Sample Template
          </button>
        </div>

        <FormTextarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (parseError) setParseError("");
          }}
          rows={14}
          placeholder="Paste course markdown/plain text here..."
          textareaClassName="font-mono text-xs"
          error={parseError}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleImportClick}
            loading={importing}
            icon={Sparkles}
          >
            Parse & Generate Course
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CourseTextImporterModal;
