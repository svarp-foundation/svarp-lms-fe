import React, { useState } from "react";
import { Modal, FileUpload, Button } from "../common";
import { Upload, Download, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";

export const CsvUserImporter = ({
  isOpen,
  onClose,
  onImport,
  importing = false,
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,full_name,email,password,role\nJane Doe,jane@example.com,Password123!,learner\nJohn Smith,john@example.com,Password123!,instructor";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV file (.csv)");
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a CSV file to upload");
      return;
    }
    onImport(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Users (CSV)"
      subtitle="Upload a CSV spreadsheet with user details to enroll learners or instructors in bulk"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-700" />
            <span className="text-xs font-semibold text-slate-800">
              Need the spreadsheet format?
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <Download size={13} />
            <span>Download Template</span>
          </button>
        </div>

        <FileUpload
          label="Select CSV Spreadsheet"
          accept=".csv,text/csv"
          onFileSelect={handleFileSelect}
          fileName={file?.name}
          error={error}
          type="file"
          helperText="Columns: full_name, email, password, role"
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
            type="submit"
            variant="primary"
            size="sm"
            loading={importing}
            icon={Upload}
          >
            Upload & Process Users
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CsvUserImporter;
