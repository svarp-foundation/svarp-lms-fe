import React, { useState, useEffect } from "react";
import { usePwa } from "../context/PwaContext";
import { Download, X } from "lucide-react";

const PwaInstallBanner = () => {
  const { isInstallable, installApp } = usePwa();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("pwa-dismissed");
    if (isInstallable && !isDismissed) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-[9999] animate-bounce-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-150 flex flex-col gap-3 relative overflow-hidden transition-all duration-300">
        {/* Background Subtle Accent Pattern */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />

        {/* Header/Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
          aria-label="Dismiss install banner"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 items-start pr-6">
          <div className="w-12 h-12 rounded-xl bg-accent p-1 flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-primary/10">
            <img
              src="/company/svarp-logo-192.webp"
              alt="SVARP Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-extrabold text-accent leading-tight">
              SVARP Global Academy
            </h4>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-0.5">
              Install App
            </p>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              Access your courses offline, receive instant reminders, and learn on the go!
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 mt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="flex-[2] bg-accent hover:bg-accent/90 text-white px-4 py-2 text-xs font-extrabold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 flex items-center justify-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download size={14} />
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
