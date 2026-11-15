import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { loadAds, useAdsHidden } from "./AdSlot";

const AdSlot = ({
  id = "ynpos-19120",
  isPremium = false,
  isSidebarOpen = false,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const hideAds = useAdsHidden(isPremium);
  const adContainerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    if (hideAds || !isVisible || isSidebarOpen) return;

    const timer = setTimeout(() => {
      if (!adContainerRef.current) return;

      adContainerRef.current.innerHTML = "";

      loadAds();
    }, 180); 

    return () => clearTimeout(timer);
  }, [hideAds, isVisible, isSidebarOpen, location.pathname]);
  const handleAdClick = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 992 : true,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (hideAds || !isVisible || isSidebarOpen || !isDesktop) return null;

  return (
    <div className={className}>
      <style>{`
        #${id}, #${id} * {
          font-family: Vazir, Tahoma, Arial, sans-serif !important;
        }
      `}</style>

      <article
        style={{
          position: "fixed",
          left: "24px",
          bottom: "88px", /* بالاتر از ویجت پشتیبانی تا همپوشانی نداشته باشند */
          background: "#fff",
          zIndex: 2500,
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          style={{
            position: "absolute",
            top: "-10px",
            left: "-10px",
            background: "#EFEEE7",
            border: "1px solid #e2e8f0",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "#7C8683",
            zIndex: 2501,
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
          aria-label="بستن تبلیغ"
        >
          ✕
        </button>

        <div onClick={handleAdClick} style={{ cursor: "pointer" }}>
          <div className="yn-bnr" id={id} ref={adContainerRef}></div>
        </div>
      </article>
    </div>
  );
};

export default AdSlot;
