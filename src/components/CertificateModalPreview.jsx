import React, { useState, useEffect, useRef } from "react";

const CertificateModalPreview = ({ children }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !wrapperRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Bounding dimensions for standard landscape A4 certificate preview:
      // Width: 896px (max-w-4xl is 896px), Height: 634px.
      const naturalWidth = 896;
      const naturalHeight = 634;
      
      // Calculate scaling factors for both width and height, leaving a 24px safety margin
      const scaleX = (containerWidth - 24) / naturalWidth;
      const scaleY = (containerHeight - 24) / naturalHeight;
      
      // Fit to container without stretching/growing beyond 100% size
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale > 0.1 ? newScale : 0.1);
    };

    handleResize();
    
    // Add small delay to ensure DOM is fully rendered before measuring
    const timeoutId = setTimeout(handleResize, 100);
    
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [children]);

  return (
    <div 
      ref={containerRef} 
      className="flex-grow w-full h-full flex items-center justify-center overflow-hidden bg-gray-50 min-h-0 relative select-none"
    >
      <div 
        ref={wrapperRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          width: "896px",
          height: "634px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "transform 0.15s ease-out"
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CertificateModalPreview;
