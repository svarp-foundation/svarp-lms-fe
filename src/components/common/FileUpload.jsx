import React, { useRef, useState } from "react";
import { Upload, X, FileText, Loader2, Image as ImageIcon } from "lucide-react";

export const FileUpload = ({
  label,
  accept = "*",
  onFileSelect,
  previewUrl,
  fileName,
  loading = false,
  error,
  helperText,
  disabled = false,
  className = "",
  type = "image", // "image" | "file"
}) => {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !loading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || loading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
          isDragOver
            ? "border-[#1f3b45] bg-slate-50"
            : error
            ? "border-red-300 bg-red-50/30"
            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
        } ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || loading}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <Loader2 size={24} className="animate-spin text-[#1f3b45]" />
            <p className="text-xs text-slate-500 font-medium">Uploading file...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative group max-h-36 w-full flex items-center justify-center overflow-hidden rounded-lg">
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="max-h-36 object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold rounded-lg">
              Click or drop to replace
            </div>
          </div>
        ) : fileName ? (
          <div className="flex items-center gap-2 py-2 text-slate-700">
            <FileText size={18} className="text-[#1f3b45]" />
            <span className="text-xs font-semibold truncate max-w-[200px]">
              {fileName}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center shadow-2xs">
              {type === "image" ? <ImageIcon size={18} /> : <Upload size={18} />}
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              Click to upload <span className="text-slate-400 font-normal">or drag & drop</span>
            </p>
            {helperText && (
              <p className="text-[11px] text-slate-400">{helperText}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default FileUpload;
