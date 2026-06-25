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
  const defaultProfileImg = "/company/svarp-logo.png";
  const displayImg = profilePictureUrl || defaultProfileImg;

  return (
    <div className="relative w-full aspect-[1.414] max-w-4xl mx-auto">
      {/* Container with shadow and rounded corners */}
      <div className="relative z-10 bg-white p-8 shadow-2xl rounded-lg border-2 border-gray-100 overflow-hidden h-full flex flex-col justify-between">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-2xl font-serif font-bold text-accent">
              Certificate of Achievement
            </h3>
            <p className="text-[10px] text-gray-500 tracking-[0.3em] font-bold mt-1 uppercase">
              SVARP GLOBAL ACADEMY
            </p>
          </div>
          <div className="w-16 h-16 bg-muted border border-gray-100 rounded-xl flex flex-col items-center justify-center p-1.5 text-center overflow-hidden">
            {/* Real QR code or placeholder */}
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Verification QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5 leading-none text-center">
                  QR CODE
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <Globe className="text-gray-400 w-6 h-6" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Body */}
        <div className="text-center flex-grow flex flex-col justify-center items-center py-2">
          <p className="text-gray-500 font-medium mb-2 italic text-base">
            This is to certify that
          </p>
          <h4 className="text-3xl font-bold text-accent mb-3 leading-tight">
            {learnerName}
          </h4>
          <div className="w-28 h-28 mx-auto rounded-full bg-muted border-4 border-primary/20 mb-3 overflow-hidden shadow-inner flex items-center justify-center">
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
          <p className="text-gray-500 mb-1 font-medium text-sm">
            has successfully completed the course
          </p>
          <h5 className="text-xl font-bold text-primary mb-2">
            {courseName}
          </h5>
          {isHonour && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-primary/10 text-primary font-bold rounded-full text-xs border border-primary/20 animate-pulse mt-0.5">
              <Award className="w-3.5 h-3.5" />
              <span>Pass With Honour</span>
            </div>
          )}
        </div>

        {/* Footer Section (Signatures and IDs) */}
        <div className="flex flex-row justify-between items-end border-t border-gray-100 pt-4 mt-2">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>ID: {certificateId}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
              <span>DATE: {date}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-signature italic text-2xl text-accent mb-1 px-4 border-b border-gray-300 pb-1 inline-block">
              Mr. Vikash Kumar
            </div>
            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em]">
              Authorized Signatory
            </p>
          </div>
        </div>

        {/* Dynamic Watermark Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5">
          <Award size={400} className="text-primary rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default Certificate;
