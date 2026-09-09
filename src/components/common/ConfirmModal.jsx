import React from "react";
import Modal from "./Modal";
import { AlertTriangle, Info } from "lucide-react";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "primary" | "warning"
  loading = false,
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500";
      case "primary":
      default:
        return "bg-[#1f3b45] hover:bg-[#152930] text-white focus:ring-[#1f3b45]";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
      case "primary":
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 text-[#1f3b45] flex items-center justify-center flex-shrink-0">
            <Info size={20} />
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      size="sm"
      showClose={!loading}
    >
      <div className="flex gap-4">
        {getIcon()}
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${getButtonStyles()}`}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
