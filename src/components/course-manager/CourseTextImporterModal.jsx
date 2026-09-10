import React, { useState, useRef } from "react";
import { Modal, FilterTabs, FormTextarea, Button } from "../common";
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  BookOpen,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const SAMPLE_COURSE_TEMPLATE = `---COURSE---
Title: Sample Course: Understanding Course Structure
Description: This course acts as a live template for creating new course content in the SVARP LMS platform.
Price: 0
Is Paid: false
Passing Score: 70

---MODULE---
Title: Module 1: Anatomy of a Course File
Description: Learn how the parser interprets different sections of the course text files.

---LESSON---
Title: Metadata Section
Type: text
Content:
The course file begins with the ---COURSE--- marker.
It specifies global course attributes like Title, Price, and Description.
Always ensure fields like 'Is Paid' are correctly set to boolean values.
---END_LESSON---

---LESSON---
Title: Module and Lesson Markers
Type: video
Video URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Content:
Use ---MODULE--- to define a new chapter.
Use ---LESSON--- to define individual topics within that module.
The 'Content' field in a lesson can span multiple lines and continues until the ---END_LESSON--- marker is encountered.
---END_LESSON---

---MODULE---
Title: Module 2: Assessments and Knowledge Checks
Description: Tips for creating interactive quizzes and assignments.

---LESSON---
Title: Final Knowledge Check
Type: assignment
Content:
Please complete this assignment to verify your understanding of the course creation process.

---ASSIGNMENT---
Title: Course Creator Certification Quiz
Description: A short quiz to test your knowledge of the SVARP course format.

---QUESTION---
Type: mcq
Text: Which marker is used to start a new module?
Order: 1
Option: ---MODULE--- (is_correct=true)
Option: ---CHAPTER--- (is_correct=false)
Option: ---SECTION--- (is_correct=false)

---QUESTION---
Type: subjective
Text: Briefly explain the importance of the ---END_LESSON--- marker.
Order: 2

---END_ASSIGNMENT---
---END_LESSON---
`;

/**
 * Quick client-side summary parser for visual feedback
 */
const parsePreviewStats = (text) => {
  if (!text || !text.trim()) return null;

  const titleMatch = text.match(/---COURSE---[\s\S]*?Title:\s*([^\n\r]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled Course";

  const moduleCount = (text.match(/---MODULE---/g) || []).length;
  const lessonCount = (text.match(/---LESSON---/g) || []).length;
  const assignmentCount = (text.match(/---ASSIGNMENT---/g) || []).length;
  const questionCount = (text.match(/---QUESTION---/g) || []).length;

  return {
    title,
    moduleCount,
    lessonCount,
    assignmentCount,
    questionCount,
  };
};

export const CourseTextImporterModal = ({
  isOpen,
  onClose,
  onImport,
  importing = false,
  targetCourse = null,
}) => {
  const isUpdateMode = Boolean(targetCourse?.id);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "paste"
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setFileContent("");
    setPastedText("");
    setError("");
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (!importing) {
      resetState();
      onClose();
    }
  };

  const handleFileProcess = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Please select a valid plain text file (.txt).");
      return;
    }

    setError("");
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result || "";
      setFileContent(content);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!importing) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (importing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_COURSE_TEMPLATE], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_course.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInsertSampleToTextarea = () => {
    setPastedText(SAMPLE_COURSE_TEMPLATE);
    setError("");
  };

  const handleImportSubmit = () => {
    if (activeTab === "upload") {
      if (!selectedFile) {
        setError("Please select or drop a .txt course file to upload.");
        return;
      }
      setError("");
      onImport(selectedFile);
    } else {
      if (!pastedText.trim()) {
        setError("Please enter or paste course text content.");
        return;
      }
      setError("");
      // Convert plain text into a File object
      const file = new File([pastedText], "course_bundle.txt", {
        type: "text/plain",
      });
      onImport(file);
    }
  };

  const activeContent = activeTab === "upload" ? fileContent : pastedText;
  const previewStats = parsePreviewStats(activeContent);

  const tabs = [
    { id: "upload", label: "Upload .txt File" },
    { id: "paste", label: "Paste Plain Text" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isUpdateMode
          ? "Update Course Curriculum (.txt)"
          : "Upload & Parse Course File"
      }
      subtitle={
        isUpdateMode
          ? `Upload or paste a structured .txt course file to replace and update all modules, lessons, and assignments for "${targetCourse.title || "this course"}"`
          : "Upload a structured .txt course file to automatically create a new course, modules, lessons, and assignments"
      }
      size="3xl"
    >
      <div className="space-y-4">
        {/* Header Action Row: Tab switcher & Download template */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
          <FilterTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setError("");
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleDownloadTemplate}
            icon={Download}
          >
            Download Sample (.txt)
          </Button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === "upload" ? (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileInputChange}
              disabled={importing}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !importing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-[#1f3b45] bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                } ${importing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-[#1f3b45] flex items-center justify-center mb-3">
                  <Upload size={22} />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Click to select or drag & drop your course (.txt) file
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Supports SVARP structured course files containing <code>---COURSE---</code>, <code>---MODULE---</code>, and <code>---LESSON---</code> blocks.
                </p>
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    icon={FileText}
                    disabled={importing}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Plain Text File
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileContent("");
                      setError("");
                    }}
                    disabled={importing}
                    icon={Trash2}
                  >
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Paste Raw Text */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Paste structured course markdown or text directly below:
              </p>
              <button
                type="button"
                onClick={handleInsertSampleToTextarea}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Insert Sample Template
              </button>
            </div>

            <FormTextarea
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (error) setError("");
              }}
              rows={10}
              placeholder="Paste course plain text here..."
              textareaClassName="font-mono text-xs"
              error={error}
            />
          </div>
        )}

        {/* Live Parsed Preview Summary Card */}
        {previewStats && (
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Detected Course Structure</span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Ready to parse
              </span>
            </div>

            <div className="text-xs font-medium text-slate-900 truncate">
              {previewStats.title}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Layers size={13} className="text-slate-400" />
                <span>{previewStats.moduleCount} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-400" />
                <span>{previewStats.lessonCount} Lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle size={13} className="text-slate-400" />
                <span>{previewStats.assignmentCount} Assignments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-slate-400" />
                <span>{previewStats.questionCount} Questions</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleImportSubmit}
            loading={importing}
            icon={Upload}
          >
            {importing
              ? isUpdateMode
                ? "Parsing & Updating..."
                : "Parsing & Creating..."
              : isUpdateMode
              ? "Update Course Curriculum"
              : "Upload & Create Course"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CourseTextImporterModal;
