import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import {
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  ShieldCheck,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const VerifyCertificate = () => {
  const { certificateCode } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/public/certificates/verify/${certificateCode}`,
        );
        setVerification(response.data);
      } catch (err) {
        console.error("Verification error:", err);
        setError(
          err.response?.data?.detail || "Certificate not found or invalid.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (certificateCode) {
      fetchVerification();
    }
  }, [certificateCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="fluid-h2 font-bold text-accent">
          Verifying Certificate...
        </h2>
        <p className="text-gray-500 mt-2">
          Connecting to SVARP Secure Registry
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full border border-red-100 italic">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-accent mb-4">
            Verification Failed
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-accent font-bold mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to SVARP
        </Link>

        <div className="bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row transition-all hover:shadow-primary/10">
          {/* Left Side: Status & Badge */}
          <div className="bg-[#1f3b45] p-8 flex flex-col items-center justify-center text-center text-white md:w-1/4">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-4 border-primary/30 shadow-2xl">
                {verification.profile_picture_url ? (
                  <img
                    src={verification.profile_picture_url}
                    alt={verification.student_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ""; 
                    }}
                  />
                ) : (
                  <ShieldCheck className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-accent p-1.5 rounded-full shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1">Authenticated</h2>
            <div className="px-3 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold tracking-widest uppercase">
              {verification.status}
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="p-8 md:p-10 flex-1 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Award className="w-32 h-32 text-accent" />
            </div>

            <div className="relative z-10">
              <div className="mb-6">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                  Certificate of Achievement
                </p>
                <h1 className="text-2xl font-bold text-accent leading-tight">
                  Authentic Credential Verified
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50 border border-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5 tracking-wider">
                      Learner Name
                    </p>
                    <p className="text-lg font-bold text-accent">
                      {verification.student_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50 border border-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5 tracking-wider">
                      Course Completed
                    </p>
                    <p className="text-lg font-bold text-accent">
                      {verification.course_title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50 border border-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5 tracking-wider">
                        Issue Date
                      </p>
                      <p className="text-sm font-bold text-accent">
                        {new Date(verification.issue_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50 border border-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5 tracking-wider">
                        Certificate ID
                      </p>
                      <p className="text-sm font-bold text-accent font-mono truncate max-w-[150px]">
                        {verification.certificate_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
                <p className="text-xs text-accent font-medium leading-relaxed">
                  This certificate has been issued by{" "}
                  <strong>SVARP Global Academy</strong> after successful
                  completion of all required assessments and identity
                  verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-[10px] mt-8 italic">
          © 2026 SVARP Global Academy. All rights reserved. Secure registry
          blockchain-backed certification.
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate;
