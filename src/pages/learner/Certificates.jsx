import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import { useAuth } from "../../context/AuthContext";
import { Award, Download, Eye, X, GraduationCap } from "lucide-react";
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
      <div className="w-full bg-accent text-white page-padding relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Award size={28} className="text-yellow-400" />
            My Certificates
          </h1>
          <p className="text-gray-300 text-sm mt-2 max-w-md">
            View and download all your earned certificates of completion.
          </p>
        </div>
      </div>

      <div className="page-padding max-w-7xl mx-auto">
        {loading ? (
          <CertificatesSkeleton />
        ) : certificates.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-[2rem] shadow-md border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-50 flex items-center justify-center border border-yellow-100 mb-6">
              <Award size={36} className="text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No Certificates Earned Yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Once you complete all modules in a course and finalize your SVARP profile registration, your official certificate will appear here.
            </p>
            <Link
              to="/courses-catalog"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition shadow-md"
            >
              <GraduationCap size={18} />
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="responsive-grid">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header/Card Background */}
                <div className="p-6 pb-4 bg-gradient-to-br from-yellow-50/60 to-amber-50/20 border-b border-gray-50 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-100/80 flex items-center justify-center border border-yellow-200/50 flex-shrink-0">
                    <Award className="text-yellow-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-snug line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      Issued on {new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow gap-6">
                  {/* Code */}
                  <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Certificate ID</span>
                    <span className="font-mono text-xs font-bold text-gray-700">{cert.certificate_code}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewCertificate(cert)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} /> View
                    </button>
                    {cert.pdf_url && (
                      <a
                        href={`${getSecureVideoUrl(cert.pdf_url)}&download=true`}
                        download={`Certificate-${cert.certificate_code}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:bg-opacity-95 transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent/10"
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
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-accent">Your Course Certificate</h2>
            <div className="flex items-center gap-4">
              <a
                href={`${getSecureVideoUrl(selectedCert.pdf_url)}&download=true`}
                download={`Certificate-${selectedCert.certificate_code}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-opacity-95 transition whitespace-nowrap flex-shrink-0"
              >
                <Download size={14} /> Download PDF
              </a>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
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
