import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getToken } from "../utils/api";

export function useAdsHidden(isPremium = false) {
  const { profile, loading } = useApp();
  return loading || isPremium || Boolean(profile?.subscriptionActive) || Boolean(getToken() && !profile);
}

export function loadAds() {
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
  if (!window.yektanet) {
    window.yektanetAnalyticsObject = "yektanet";
    window.yektanet = function () { window.yektanet.q.push(arguments); };
    window.yektanet.q = [];
    const date = new Date();
    const script = document.createElement("script");
    script.async = true;
    script.dataset.mentoraOptional = "true";
    script.src = "https://cdn.yektanet.com/superscript/cty2n1lV/native-mentoralearn.ir-47233/yn_pub.js?v=" +
      date.getFullYear() + "0" + date.getMonth() + "0" + date.getDate() + "0" + date.getHours();
    document.head.appendChild(script);
  }
  try { window.yektanet("load"); } catch (error) { console.error("Yektanet load error:", error); }
}

const AdSlot = ({
  id = "ynpos-19122",
  isPremium = false,
  className = "",
  index,
}) => {
  const location = useLocation();
  const hideAds = useAdsHidden(isPremium);
  const adContainerRef = useRef(null);
  const adId = index !== undefined ? `ynpos-1912${index}` : id;

  useEffect(() => {
    if (hideAds) return;

    const timer = setTimeout(() => {
      if (!adContainerRef.current) return;

      adContainerRef.current.innerHTML = "";

      loadAds();
    }, 180);

    return () => clearTimeout(timer);
  }, [hideAds, location.pathname, adId]);

  if (hideAds) return null;

  return (
    <div className={className}>
      <style>{`
        #${adId}, #${adId} * {
          font-family: Vazir, Tahoma, Arial, sans-serif !important;
        }
      `}</style>

      <section
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "transparent",
          marginBottom: "25px",
        }}
      >
        <div className="yn-bnr" id={adId} ref={adContainerRef}></div>
      </section>
    </div>
  );
};

export default AdSlot;
