import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import {
  PageHeader,
  Button,
  FormInput,
  ToggleSwitch,
} from "../../components/common";
import {
  FileCheck,
  Download,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const PRESET_CERTIFICATIONS = [
  "Full-Stack Web Development Bootcamp",
  "Enterprise Cloud Architecture & DevOps Masterclass",
  "Artificial Intelligence & Machine Learning Specialization",
  "Certified Cybersecurity & Ethical Hacking Professional",
  "Executive Leadership & Product Management",
];

const CertificateCreator = () => {
  const [courseTitle, setCourseTitle] = useState(PRESET_CERTIFICATIONS[0]);
  const [studentName, setStudentName] = useState("Vikash Kumar");
  const [signatoryName, setSignatoryName] = useState("Mr. Vikash Kumar");
  const [progress, setProgress] = useState(100);
  const [includeSyllabus, setIncludeSyllabus] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingCourses, setExistingCourses] = useState([]);

  const activeBlobUrlRef = useRef(null);

  // Fetch actual course titles for quick-selection convenience
  useEffect(() => {
    let isMounted = true;
    api
      .get("/courses-catalog")
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          const titles = res.data.map((c) => c.title).filter(Boolean);
          if (titles.length > 0) {
            setExistingCourses(titles);
          }
        }
      })
      .catch(() => {
        // Fallback to presets silently
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const generateCertificate = useCallback(async () => {
    if (!courseTitle.trim()) {
      setError("Please enter a certification or course title.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        "/admin/certificates/sample",
        {
          course_title: courseTitle.trim(),
          student_name: studentName.trim() || "John Doe",
          signatory_name: signatoryName.trim() || "Mr. Vikash Kumar",
          progress: Number(progress) || 100,
          include_syllabus: Boolean(includeSyllabus),
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Clean up previous blob URL to prevent memory leaks
      if (activeBlobUrlRef.current) {
        window.URL.revokeObjectURL(activeBlobUrlRef.current);
      }
      activeBlobUrlRef.current = url;
      setPreviewUrl(url);
    } catch (err) {
      console.error("Failed to generate sample certificate:", err);
      setError("Failed to generate certificate preview. Please check backend logs.");
    } finally {
      setLoading(false);
    }
  }, [courseTitle, studentName, signatoryName, progress, includeSyllabus]);

  // Generate on initial mount
  useEffect(() => {
    generateCertificate();
    return () => {
      if (activeBlobUrlRef.current) {
        window.URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    if (!previewUrl) return;
    const cleanName = (courseTitle || "sample_certificate")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const link = document.createElement("a");
    link.href = previewUrl;
    link.setAttribute("download", `sample_cert_${cleanName}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpenNewTab = () => {
    if (!previewUrl) return;
    window.open(previewUrl, "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Certificate Studio"
          subtitle="Generate, test, and preview sample certificates with custom course titles and verified accreditations"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                disabled={!previewUrl || loading}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                disabled={!previewUrl || loading}
                onClick={handleOpenNewTab}
              >
                Open in Tab
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck size={18} className="text-[#1f3b45]" />
                Certificate Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live sandbox for the certificate generator engine
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateCertificate();
              }}
              className="space-y-4"
            >
              <div>
                <FormInput
                  label="Certification / Course Title"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Web Development Bootcamp"
                />

                {/* Quick Presets */}
                <div className="mt-2 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {(existingCourses.length > 0 ? existingCourses : PRESET_CERTIFICATIONS).map(
                      (preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCourseTitle(preset)}
                          className={`text-[11px] px-2 py-0.5 rounded border transition-colors text-left truncate max-w-full ${
                            courseTitle === preset
                              ? "bg-[#1f3b45] text-white border-[#1f3b45]"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                          title={preset}
                        >
                          {preset}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <FormInput
                label="Student / Recipient Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
              />

              <FormInput
                label="Authorized Signatory Name"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="e.g. Mr. Vikash Kumar"
              />

              <FormInput
                label="Passing Progress (%)"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                helperText="Progress ≥75% displays the 'Pass with Honour' badge"
              />

              <div className="pt-1">
                <ToggleSwitch
                  id="include-syllabus"
                  label="Include Course Syllabus"
                  description="Appends curriculum syllabus pages to verify multi-page rendering"
                  checked={includeSyllabus}
                  onChange={(e) => setIncludeSyllabus(e.target.checked)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={RefreshCw}
                className="w-full mt-2"
              >
                {loading ? "Generating..." : "Generate Sample"}
              </Button>
            </form>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[680px]">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Live PDF Preview
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Landscape Letter • Top Accreditation Header
              </span>
            </div>

            <div className="flex-1 p-4 bg-slate-100 flex items-center justify-center">
              {loading && !previewUrl ? (
                <div className="flex flex-col items-center gap-3 text-slate-500 py-20">
                  <RefreshCw size={28} className="animate-spin text-[#1f3b45]" />
                  <span className="text-xs font-medium">Generating certificate PDF...</span>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0`}
                  title="Certificate PDF Preview"
                  className="w-full h-full min-h-[620px] rounded-xl border border-slate-300 shadow bg-white"
                />
              ) : (
                <div className="text-center text-slate-400 py-20">
                  <FileCheck size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No preview available. Click Generate Sample.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CertificateCreator;
