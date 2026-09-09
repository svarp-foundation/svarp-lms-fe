import React, { useState, useEffect } from "react";
import { Modal, Button } from "./common";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Download, AlertCircle, Loader2 } from "lucide-react";

export const CertificateModalPreview = ({
  courseId,
  courseTitle,
  cert: initialCert = null,
  onClose,
}) => {
  const { user } = useAuth();
  const [certData, setCertData] = useState(initialCert);
  const [loading, setLoading] = useState(!initialCert);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (initialCert) {
      setCertData(initialCert);
      setLoading(false);
      return;
    }

    if (!courseId) return;

    let isMounted = true;
    const fetchOrClaimCertificate = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try claim/fetch endpoint
        const res = await api.post(`/learner/courses/${courseId}/claim-certificate`);
        if (isMounted) {
          setCertData(res.data);
        }
      } catch (err) {
        console.error("Error claiming certificate:", err);
        // Fallback: check /learner/certificates
        try {
          const listRes = await api.get(`/learner/certificates`);
          const found = (listRes.data || []).find((c) => c.course_id === Number(courseId));
          if (found && isMounted) {
            setCertData(found);
            return;
          }
        } catch (e) {
          // ignore
        }
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Please complete all curriculum modules and assignments to unlock your certificate."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrClaimCertificate();
    return () => {
      isMounted = false;
    };
  }, [courseId, initialCert]);

  // Fetch official PDF document blob for exact in-modal preview
  useEffect(() => {
    if (!certData?.pdf_url) return;
    let isMounted = true;
    const loadPdfBlob = async () => {
      setPdfLoading(true);
      try {
        const token = localStorage.getItem("token");
        const url = `${certData.pdf_url}?download=false&token=${encodeURIComponent(token || "")}`;
        const res = await api.get(url, { responseType: "blob" });
        if (isMounted) {
          const blob = new Blob([res.data], { type: "application/pdf" });
          const objectUrl = window.URL.createObjectURL(blob);
          setPdfBlobUrl(objectUrl);
        }
      } catch (err) {
        console.error("Failed to load PDF preview:", err);
      } finally {
        if (isMounted) setPdfLoading(false);
      }
    };

    loadPdfBlob();
    return () => {
      isMounted = false;
    };
  }, [certData?.pdf_url]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const handleDownloadPdf = async () => {
    if (!certData?.pdf_url) return;
    setDownloading(true);
    try {
      if (pdfBlobUrl) {
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.setAttribute("download", `${certData.certificate_code || "certificate"}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const token = localStorage.getItem("token");
      const url = `${certData.pdf_url}?download=true&token=${encodeURIComponent(token || "")}`;
      const response = await api.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${certData.certificate_code || "certificate"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      const token = localStorage.getItem("token");
      window.open(`${certData.pdf_url}?download=true&token=${encodeURIComponent(token || "")}`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={courseTitle || certData?.course_title || "Course Certificate"}
      subtitle="Official Verified Graduation Credential"
      size="4xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Generating verified certificate preview...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-3 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Certificate Not Ready Yet</h4>
              <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
            </div>
            <div className="pt-2">
              <Button type="button" variant="primary" size="sm" onClick={onClose}>
                Back to Learning
              </Button>
            </div>
          </div>
        ) : certData ? (
          <div className="space-y-4">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Verification ID:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {certData.certificate_code}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="emerald"
                  size="xs"
                  onClick={handleDownloadPdf}
                  loading={downloading}
                  icon={Download}
                >
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Official PDF Document Viewer */}
            <div className="w-full h-[540px] sm:h-[620px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex flex-col justify-center items-center">
              {pdfBlobUrl ? (
                <iframe
                  src={`${pdfBlobUrl}#toolbar=0&navpanes=0&view=Fit`}
                  className="w-full h-full border-0 rounded-xl bg-white"
                  title="Official Certificate Document"
                />
              ) : pdfLoading ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <Loader2 size={28} className="animate-spin text-emerald-600" />
                  <p className="text-xs font-semibold">Loading official document preview...</p>
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <p className="text-xs text-slate-600 font-medium">Click below to download the official certificate PDF</p>
                  <Button type="button" variant="emerald" size="xs" onClick={handleDownloadPdf} icon={Download}>
                    Download Certificate PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default CertificateModalPreview;
