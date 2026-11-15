import React, { useState, useEffect } from "react";
import { loadAds, useAdsHidden } from "./AdSlot";

const AdSlot = ({
  id = "pos-article-text-120526",
  isPremium = false,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const hideAds = useAdsHidden(isPremium);

  useEffect(() => {
    if (!hideAds && isVisible) loadAds();
  }, [hideAds, isVisible]);

  const handleAdClick = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  if (hideAds || !isVisible) return null;

  return (
    <div
      className={className}
      style={{
        width: "100%",
      }}
    >
      <style>{`
        #${id}, #${id} * {
          font-family: Vazir, Tahoma, Arial, sans-serif !important;
        }
      `}</style>

      <article
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#fff",
          borderTop: "1px solid #EFEEE7",
          padding: "20px",
          paddingBottom: "0px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            fontFamily: "Vazir, Tahoma, Arial, sans-serif",
            marginBottom: "8px",
          }}
        >
          تبلیغ منتورا
        </div>

        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            id={id}
            onClick={handleAdClick}
            style={{
              display: "inline-block",
            }}
          ></div>
        </div>
      </article>
    </div>
  );
};

export default AdSlot;
