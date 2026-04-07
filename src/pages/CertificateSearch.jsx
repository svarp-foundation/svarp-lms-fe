import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Search, 
  ChevronLeft, 
  Award, 
  Globe, 
  CheckCircle 
} from "lucide-react";

const CertificateSearch = () => {
  const [certificateId, setCertificateId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    const code = certificateId.trim();
    if (code) {
      navigate(`/verify/${code}`);
    }
  };

  return (
    <div className="min-h-[80vh] bg-muted flex items-center justify-center section-padding px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context & Trust */}
        <div className="reveal">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold mb-8 transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} />
            Secure Verification
          </div>
          
          <h1 className="fluid-h2 font-bold text-accent mb-6 leading-tight">
            Verify Excellence with Global Standards.
          </h1>
          
          <p className="fluid-p text-gray-600 mb-8 max-w-md">
            Enter a unique Certificate ID to instantly validate the authenticity of credentials issued by SVARP Foundation.
          </p>

          <div className="space-y-4">
            {[
              "Real-time Registry Access",
              "Tamper-proof Digital IDs",
              "Globally Recognized Accreditation"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-primary flex-shrink-0" />
                <span className="font-medium text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Search Interface */}
        <div className="reveal reveal-delay-200">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-8 text-primary shadow-inner">
                <Award size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-accent mb-2">
                Validator Portal
              </h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Please enter the 12-character ID found on the bottom-left of the certificate.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="relative">
                  <Search 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" 
                    size={20} 
                  />
                  <input
                    type="text"
                    placeholder="e.g. SV-2024-8849"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono placeholder:font-sans"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary hover:text-accent transition-luxury shadow-xl shadow-accent/20 flex items-center justify-center gap-2 group/btn"
                >
                  Verify Now
                  <Globe size={18} className="group-hover/btn:rotate-12 transition-transform" />
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} />
                  GDPR Compliant
                </span>
                <span>•</span>
                <span>Encrypted Audit Trail</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateSearch;
