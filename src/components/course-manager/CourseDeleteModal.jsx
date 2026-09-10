import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { AlertTriangle, Trash2, Archive, ShieldAlert } from "lucide-react";

export const CourseDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  isAdmin = false,
  loading = false,
}) => {
  const [deleteMode, setDeleteMode] = useState("soft"); // "soft" | "force"
  const [confirmPurgeCheck, setConfirmPurgeCheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeleteMode("soft");
      setConfirmPurgeCheck(false);
    }
  }, [isOpen, course]);

  if (!course) return null;

  const isAlreadyDeleted = Boolean(course.is_deleted);
  const learnerCount = course.enrolled_count ?? course.student_count ?? course.students_count ?? 0;
  const hasLearners = learnerCount > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAlreadyDeleted) {
      if (hasLearners && !confirmPurgeCheck) return;
      onConfirm({ force: true });
    } else if (isAdmin && hasLearners && deleteMode === "force") {
      if (!confirmPurgeCheck) return;
      onConfirm({ force: true });
    } else {
      onConfirm({ force: false });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      size={isAdmin && (hasLearners || isAlreadyDeleted) ? "md" : "sm"}
      showClose={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Case 0: Course is ALREADY in Trash / Soft-Deleted -> Direct Hard Delete / Purge */}
        {isAlreadyDeleted && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Permanently Hard Delete Course</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Permanently purge <span className="font-semibold text-slate-800">"{course.title}"</span> from trash.
                </p>
              </div>
            </div>

            {hasLearners ? (
              <div className="p-3.5 bg-red-50 rounded-lg border border-red-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-medium leading-relaxed">
                    Critical Warning: This course has <strong className="text-red-950 font-bold">{learnerCount} learner enrollment(s)</strong> or payment records. Hard deleting will permanently wipe all student progress, submissions, certificates, payments, modules, and uploaded video files.
                  </p>
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmPurgeCheck}
                    onChange={(e) => setConfirmPurgeCheck(e.target.checked)}
                    className="rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-red-900">
                    I understand this will permanently purge all student and course data
                  </span>
                </label>
              </div>
            ) : (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                This empty course will be permanently wiped from the database along with all modules, lessons, and physical files. This action cannot be undone.
              </p>
            )}
          </div>
        )}

        {/* Case 1: Active Empty Course (0 Learners) - Hard delete for both Admin & Instructor */}
        {!isAlreadyDeleted && !hasLearners && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">Delete Course</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-slate-800">"{course.title}"</span>?
              </p>
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Since this course has no enrolled learners, it will be completely removed along with all modules, lessons, assignments, and media files.
              </p>
            </div>
          </div>
        )}

        {/* Case 2: Active Course with learners - Instructor View (Soft Delete / Archive only) */}
        {!isAlreadyDeleted && hasLearners && !isAdmin && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Archive size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">Archive Course</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                <span className="font-semibold text-slate-800">"{course.title}"</span> currently has{" "}
                <span className="font-semibold text-slate-900">{learnerCount} enrolled learner(s)</span>.
              </p>
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Deleting will safely <strong>archive</strong> the course and hide it from catalogs while preserving student progress, submissions, and certificates.
              </p>
            </div>
          </div>
        )}

        {/* Case 3: Active Course with learners - Admin View (Choice between Soft Archive vs Hard Purge) */}
        {!isAlreadyDeleted && hasLearners && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Manage Course Deletion</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  <span className="font-semibold text-slate-800">"{course.title}"</span> has{" "}
                  <span className="font-semibold text-slate-900">{learnerCount} enrolled learner(s)</span> or payment records.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option A: Soft Delete / Archive */}
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  deleteMode === "soft"
                    ? "border-[#1f3b45] bg-slate-50/80 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="deleteMode"
                  value="soft"
                  checked={deleteMode === "soft"}
                  onChange={() => setDeleteMode("soft")}
                  className="mt-0.5 text-[#1f3b45] focus:ring-[#1f3b45]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900">
                      Archive Course (Safe & Recommended)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Hides the course from catalogs. Learner progress, certificates, submissions, and payment invoices remain completely preserved.
                  </p>
                </div>
              </label>

              {/* Option B: Force Hard Delete / Permanent Purge */}
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  deleteMode === "force"
                    ? "border-red-400 bg-red-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="deleteMode"
                  value="force"
                  checked={deleteMode === "force"}
                  onChange={() => setDeleteMode("force")}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-red-700">
                      Force Hard Delete (Permanent Purge)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Completely wipes all learner enrollments, quiz/assignment submissions, certificates, payments, modules, and media files from the database and disk.
                  </p>
                </div>
              </label>
            </div>

            {/* Danger Confirmation Checkbox for Admin Purge */}
            {deleteMode === "force" && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                    Warning: This action is permanent and irreversible. All student progress and credentials will be lost.
                  </p>
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmPurgeCheck}
                    onChange={(e) => setConfirmPurgeCheck(e.target.checked)}
                    className="rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-[11px] font-semibold text-red-900">
                    I understand this will permanently destroy all course data
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          {/* Already in trash */}
          {isAlreadyDeleted && (
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={loading}
              disabled={hasLearners && !confirmPurgeCheck}
              icon={Trash2}
            >
              Permanently Purge
            </Button>
          )}

          {/* Active empty course */}
          {!isAlreadyDeleted && !hasLearners && (
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={loading}
              icon={Trash2}
            >
              Delete Permanently
            </Button>
          )}

          {/* Active course with learners (Instructor) */}
          {!isAlreadyDeleted && hasLearners && !isAdmin && (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              icon={Archive}
            >
              Archive Course
            </Button>
          )}

          {/* Active course with learners (Admin - Soft) */}
          {!isAlreadyDeleted && hasLearners && isAdmin && deleteMode === "soft" && (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              icon={Archive}
            >
              Archive Course
            </Button>
          )}

          {/* Active course with learners (Admin - Force) */}
          {!isAlreadyDeleted && hasLearners && isAdmin && deleteMode === "force" && (
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={loading}
              disabled={!confirmPurgeCheck}
              icon={Trash2}
            >
              Purge Permanently
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default CourseDeleteModal;
