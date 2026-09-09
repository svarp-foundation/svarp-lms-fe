import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import { useAuth } from "../../context/AuthContext";
import { Award, Download, Eye, X, GraduationCap, Sparkles } from "lucide-react";
import { CertificatesSkeleton } from "../../components/Skeletons";
import Certificate from "../../components/Certificate";
import CertificateModalPreview from "../../components/CertificateModalPreview";
import API_URL from "../../config";

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/learner/certificates`);
      setCertificates(res.data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const getSecureVideoUrl = (url) => {
    if (!url) return "";
    const token = localStorage.getItem("token") || "";
    let secureUrl = url.replace("/static/uploads/", "/media/");

    if (secureUrl.startsWith("/")) {
      secureUrl = `${API_URL}${secureUrl}`;
    } else if (!secureUrl.startsWith("http")) {
      secureUrl = `${API_URL}/${secureUrl}`;
    }

    return `${secureUrl}${secureUrl.includes("?") ? "&" : "?"}token=${token}`;
  };

  const handleViewCertificate = (cert) => {
    setSelectedCert(cert);
    setShowCertificate(true);
  };

  const secureProfilePicUrl = getSecureVideoUrl("/media/profile-picture");

  return (
    <LearnerLayout>
      {/* Page header banner */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#172e38] via-[#1f3b45] to-[#0f172a] text-white border-b border-white/10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="page-padding py-8 md:py-10 max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-400/30 mb-3">
              <Sparkles size={12} />
              Credentials & Diplomas
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Award size={28} className="text-amber-400 flex-shrink-0" />
              My Certificates
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              View and download your earned certificates of completion and honors credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="page-padding py-8 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <CertificatesSkeleton />
        ) : certificates.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 sm:p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 mb-4 text-amber-600">
              <Award size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              No Certificates Earned Yet
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-md">
              Once you complete all modules in a course and finalize your SVARP profile registration, your official certificate will appear here.
            </p>
            <Link
              to="/courses-catalog"
              className="inline-flex items-center gap-2 bg-accent hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <GraduationCap size={16} />
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="responsive-grid">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 hover:border-amber-300/80 overflow-hidden flex flex-col transition-all duration-200"
              >
                {/* Header/Card Background */}
                <div className="p-5 pb-4 bg-gradient-to-br from-amber-50/70 to-yellow-50/20 border-b border-amber-100/60 flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200/60 flex-shrink-0">
                    <Award className="text-amber-700 w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Issued on {new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow gap-4">
                  {/* Code */}
                  <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-0.5 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Certificate ID</span>
                    <span className="font-mono text-xs font-bold text-slate-700 truncate">{cert.certificate_code}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCertificate(cert)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition text-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} /> View
                    </button>
                    {cert.pdf_url && (
                      <a
                        href={`${getSecureVideoUrl(cert.pdf_url)}&download=true`}
                        download={`Certificate-${cert.certificate_code}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-accent hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold transition text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download size={14} /> Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      {showCertificate && selectedCert && selectedCert.pdf_url && createPortal(
        <div className="fixed inset-0 z-[10000] flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900">Your Course Certificate</h2>
            <div className="flex items-center gap-3">
              <a
                href={`${getSecureVideoUrl(selectedCert.pdf_url)}&download=true`}
                download={`Certificate-${selectedCert.certificate_code}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-accent hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition"
              >
                <Download size={14} /> Download PDF
              </a>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <CertificateModalPreview>
            <Certificate
              learnerName={user?.full_name || user?.username || "SVARP Learner"}
              courseName={selectedCert.course_title}
              certificateId={selectedCert.certificate_code}
              date={new Date(selectedCert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              isHonour={true}
              qrImageUrl={getSecureVideoUrl(selectedCert.pdf_url.replace(".pdf", ".png"))}
              profilePictureUrl={secureProfilePicUrl}
            />
          </CertificateModalPreview>
        </div>,
        document.body
      )}
    </LearnerLayout>
  );
};

export default Certificates;
