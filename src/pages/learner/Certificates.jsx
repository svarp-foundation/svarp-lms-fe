import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CertificateModalPreview from "../../components/CertificateModalPreview";
import { CertificatesSkeleton } from "../../components/Skeletons";
import { PageHeader, EmptyState, Button } from "../../components/common";
import { Award, Eye, GraduationCap } from "lucide-react";

const Certificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/learner/certificates`);
      setCertificates(res.data || []);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <LearnerLayout>
      <div className="space-y-6">
        <PageHeader
          title="Earned Certificates & Honors"
          subtitle="View and download verified graduation credentials for your completed programs"
        />

        {loading ? (
          <CertificatesSkeleton />
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates earned yet"
            description="Complete all curriculum modules, quizzes, and practical assignments in a course to unlock your certificate."
            actionLabel="Explore Available Courses"
            onAction={() => navigate("/courses-catalog")}
            actionIcon={GraduationCap}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center">
                    <Award size={22} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {cert.course_title || cert.course?.title || "Certificate of Completion"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Awarded to <strong>{cert.user_name || "Learner"}</strong>
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Issued on:{" "}
                    {cert.created_at
                      ? new Date(cert.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Verified"}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    onClick={() => setSelectedCert(cert)}
                    icon={Eye}
                  >
                    View & Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Modal Preview */}
        {selectedCert && (
          <CertificateModalPreview
            courseId={selectedCert.course_id || selectedCert.course?.id}
            courseTitle={selectedCert.course_title || selectedCert.course?.title}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </div>
    </LearnerLayout>
  );
};

export default Certificates;
