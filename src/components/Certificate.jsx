import React from "react";
import { Award, ShieldCheck, Globe, Layout, CheckCircle } from "lucide-react";

/**
 * Dynamic Certificate Component
 * Designed to look like the premium certificate from Home.jsx
 */
const Certificate = ({
  learnerName = "Learner Name",
  courseName = "Course Name",
  certificateId = "CERT-XXXXX",
  date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  isHonour = false,
  qrValue = "https://svarp.com/verify",
  qrImageUrl = null,
  profilePictureUrl = null,
}) => {
  // Default profile image - using SVARP themed placeholder if none provided
  const defaultProfileImg = "https://www.svarp.org/company/svarp-logo.webp";
  const displayImg = profilePictureUrl || defaultProfileImg;

  return (
    <div className="relative group perspective-1000 max-w-4xl mx-auto my-8">
      {/* Container with shadow and rounded corners */}
      <div className="relative z-10 bg-white p-8 md:p-16 shadow-2xl rounded-lg border-2 border-gray-100 overflow-hidden min-h-[600px] flex flex-col justify-between">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-3xl font-serif font-bold text-accent">
              Certificate of Achievement
            </h3>
            <p className="text-xs text-gray-500 tracking-[0.3em] font-bold mt-2 uppercase">
              SVARP GLOBAL ACADEMY
            </p>
          </div>
          <div className="w-24 h-24 bg-muted border border-gray-100 rounded-xl flex flex-col items-center justify-center p-2 text-center overflow-hidden">
            {/* Real QR code or placeholder */}
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Verification QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1 leading-none text-center">
                  QR CODE
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Globe className="text-gray-400 w-8 h-8" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Body */}
        <div className="text-center flex-grow flex flex-col justify-center items-center py-10">
          <p className="text-gray-500 font-medium mb-6 italic text-lg">
            This is to certify that
          </p>
          <h4 className="text-4xl md:text-5xl font-bold text-accent mb-6 leading-tight">
            {learnerName}
          </h4>
          <div className="w-40 h-40 mx-auto rounded-full bg-muted border-4 border-primary/20 mb-8 overflow-hidden shadow-inner flex items-center justify-center">
            <img
              src={displayImg}
              alt="Verified Learner"
              className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfileImg;
              }}
            />
          </div>
          <p className="text-gray-500 mb-2 font-medium">
            has successfully completed the course
          </p>
          <h5 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            {courseName}
          </h5>
          {isHonour && (
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm border border-primary/20 animate-pulse mt-2">
              <Award className="w-4 h-4" />
              <span>Pass With Honour</span>
            </div>
          )}
        </div>

        {/* Footer Section (Signatures and IDs) */}
        <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-100 pt-10 mt-8">
          <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>ID: {certificateId}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>DATE: {date}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-signature italic text-3xl text-accent mb-2 px- border-b border-gray-300 pb-2 inline-block">
              Mr. Vikash Kumar
            </div>
            <p className="text-[10px] uppercase font-bold text-accent tracking-[0.2em]">
              Authorized Signatory
            </p>
          </div>
        </div>

        {/* Dynamic Watermark Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5">
          <Award size={400} className="text-primary rotate-12" />
        </div>
      </div>

      {/* Decorative Shadow Elements */}
      <div className="absolute top-4 left-4 w-full h-full bg-gray-200/50 -z-20 rounded-lg transform -rotate-1"></div>
    </div>
  );
};

export default Certificate;
