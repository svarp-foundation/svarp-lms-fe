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
        <h2 className="text-2xl font-bold text-accent">
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
    <div className="min-h-screen bg-muted py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-accent font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to SVARP Global Academy
        </Link>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row transition-all hover:shadow-primary/10">
          {/* Left Side: Status & Badge */}
          <div className="bg-[#1f3b45] p-12 flex flex-col items-center justify-center text-center text-white md:w-1/3">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-4 border-primary/30">
                <ShieldCheck className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-accent p-2 rounded-full shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Authenticated</h2>
            <div className="px-4 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold tracking-widest uppercase">
              {verification.status}
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="p-12 flex-1 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Award className="w-48 h-48 text-accent" />
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  Certificate of Achievement
                </p>
                <h1 className="text-3xl font-bold text-accent leading-tight">
                  Authentic Credential Verified
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-8 mb-12">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-gray-50">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1 tracking-wider">
                      Learner Name
                    </p>
                    <p className="text-xl font-bold text-accent">
                      {verification.student_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-gray-50">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1 tracking-wider">
                      Course Completed
                    </p>
                    <p className="text-xl font-bold text-accent">
                      {verification.course_title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-gray-50">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1 tracking-wider">
                        Issue Date
                      </p>
                      <p className="font-bold text-accent">
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

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-gray-50">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1 tracking-wider">
                        Certificate ID
                      </p>
                      <p className="font-bold text-accent">
                        {verification.certificate_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                <CheckCircle2 className="w-10 h-10 text-primary flex-shrink-0" />
                <p className="text-sm text-accent font-medium leading-relaxed">
                  This certificate has been issued by{" "}
                  <strong>SVARP Global Academy</strong> after successful
                  completion of all required assessments and identity
                  verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-12 italic">
          © 2026 SVARP Global Academy. All rights reserved. Secure registry
          blockchain-backed certification.
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate;
