import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Crown,
  CalendarDays,
  BadgeCheck,
  Clock3,
  ArrowLeft,
} from "lucide-react";
import { apiJson } from "../utils/api";
import { Helmet } from "react-helmet-async";

export default function Subscription() {
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadSubscription = async () => {
      try {
        const { response, data } = await apiJson("/api/subscription");
        if (response.ok && active) {
          setSubscription(data.subscription);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSubscription();
    return () => {
      active = false;
    };
  }, []);

  const safeSubscription = subscription || {
    active: false,
    planName: "بدون اشتراک فعال",
    totalDays: 0,
    remainingDays: 0,
    usedDays: 0,
    startDate: "-",
    endDate: "-",
    priceLabel: "۰ تومان",
  };

  const usedDays =
    safeSubscription.usedDays ??
    Math.max(0, safeSubscription.totalDays - safeSubscription.remainingDays);
  const usedPercent =
    safeSubscription.totalDays > 0
      ? Math.min(100, Math.round((usedDays / safeSubscription.totalDays) * 100))
      : 0;
  const remainingPercent =
    safeSubscription.totalDays > 0 ? 100 - usedPercent : 0;

  return (
    <>
      <Helmet>
        <title>اشتراک | منتورا</title>
        <meta
          name="description"
          content="جدیدترین مقالات درباره روش‌های مطالعه رتبه‌های برتر، معرفی تکنیک‌های تندخوانی و کاربرد هوش مصنوعی در آموزش."
        />
        <link rel="canonical" href="https://mentoralearn.ir/blog" />
      </Helmet>

      <div
        style={{
          minHeight: "100vh",
          direction: "rtl",
          fontFamily: "Vazir, Tahoma, sans-serif",
          maxWidth: "1200px",
        }}
      >
        <div className="container">
          {searchParams.get("payment") === "success" && (
            <div className="alert alert-success mb-3">پرداخت تایید شد و اشتراک شما فعال است.</div>
          )}
          {searchParams.get("payment") === "failed" && (
            <div className="alert-danger-ds mb-3">پرداخت تایید نشد. اگر مبلغ از حساب کم شده، پیش از تلاش دوباره با پشتیبانی تماس بگیر.</div>
          )}
          <div
            className="mb-4"
            style={{
              background: "linear-gradient(135deg, var(--primary, #3A8778), var(--primary-hover, #2F7063))",
              borderRadius: "28px",
              padding: "28px",
              color: "#fff",
            }}
          >
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-md-between gap-3">
              <div className="text-center text-md-end">
                <div
                  style={{
                    opacity: 0.9,
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  وضعیت اشتراک شما
                </div>
                <h2 style={{ margin: 0, fontWeight: 900 }}>
                  {loading ? "در حال دریافت..." : safeSubscription.planName}
                </h2>
                <div
                  style={{ marginTop: "10px", fontSize: "14px", opacity: 0.92 }}
                >
                  مدیریت وضعیت، زمان باقی‌مانده و جزئیات پلن
                </div>
              </div>

              <div className="mx-auto mx-md-0">
                <div
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "20px",
                    padding: "14px 42px",
                    minWidth: "180px",
                    textAlign: "center",
                    width: "fit-content",
                  }}
                >
                  <div style={{ fontSize: "13px", opacity: 0.9 }}>
                    باقی‌مانده اشتراک
                  </div>
                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: 900,
                      marginTop: "6px",
                    }}
                  >
                    {safeSubscription.remainingDays} روز
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div
                style={{
                  background: "#fff",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid #DCEBEA",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Crown size={20} color="var(--primary, #3A8778)" />
                  <h5 style={{ margin: 0, fontWeight: 800, color: "#2a1f68" }}>
                    جزئیات مصرف اشتراک
                  </h5>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "#14201E", fontWeight: 800 }}>
                      {usedPercent}%
                    </span>
                    <span style={{ color: "#7C8683", fontSize: "14px" }}>
                      درصد مصرف‌شده
                    </span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "14px",
                      background: "#DCEBEA",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${usedPercent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--primary, #3A8778), var(--primary, #3A8778))",
                        borderRadius: "999px",
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-sm-6">
                    <div
                      style={{
                        background: "#F7F6F1",
                        border: "1px solid #DCEBEA",
                        borderRadius: "18px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ color: "#7C8683", fontSize: "13px" }}>
                        روزهای استفاده‌شده
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "24px",
                          fontWeight: 900,
                          color: "#14201E",
                        }}
                      >
                        {usedDays} روز
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div
                      style={{
                        background: "#F7F6F1",
                        border: "1px solid #DCEBEA",
                        borderRadius: "18px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ color: "#7C8683", fontSize: "13px" }}>
                        روزهای باقی‌مانده
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "24px",
                          fontWeight: 900,
                          color: "var(--primary, #3A8778)",
                        }}
                      >
                        {safeSubscription.remainingDays} روز
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-sm-6">
                    <div
                      style={{
                        background: "#F7F6F1",
                        border: "1px solid #DCEBEA",
                        borderRadius: "18px",
                        padding: "16px",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <CalendarDays size={16} color="var(--primary, #3A8778)" />
                        <span style={{ fontSize: "13px", color: "#7C8683" }}>
                          تاریخ شروع
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, color: "#14201E" }}>
                        {safeSubscription.startDate}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div
                      style={{
                        background: "#F7F6F1",
                        border: "1px solid #DCEBEA",
                        borderRadius: "18px",
                        padding: "16px",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Clock3 size={16} color="var(--primary, #3A8778)" />
                        <span style={{ fontSize: "13px", color: "#7C8683" }}>
                          تاریخ پایان
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, color: "#14201E" }}>
                        {safeSubscription.endDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div
                style={{
                  background: "#fff",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid #DCEBEA",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                  height: "100%",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <BadgeCheck size={20} color="#16a34a" />
                  <h5 style={{ margin: 0, fontWeight: 800, color: "#2a1f68" }}>
                    وضعیت پلن
                  </h5>
                </div>

                <div
                  style={{
                    background: "#DFF0E6",
                    color: "#15803d",
                    border: "1px solid #CBE7D6",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontWeight: 800,
                    textAlign: "center",
                    marginBottom: "16px",
                  }}
                >
                  {safeSubscription.active
                    ? "اشتراک فعال است"
                    : "اشتراک فعالی ندارید"}
                </div>

                <div className="d-flex flex-column gap-3">
                  <div
                    style={{
                      background: "#F7F6F1",
                      borderRadius: "16px",
                      padding: "14px",
                      border: "1px solid #DCEBEA",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#7C8683" }}>
                      نام پلن
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontWeight: 900,
                        color: "#14201E",
                      }}
                    >
                      {safeSubscription.planName}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#F7F6F1",
                      borderRadius: "16px",
                      padding: "14px",
                      border: "1px solid #DCEBEA",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#7C8683" }}>
                      هزینه پلن
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontWeight: 900,
                        color: "#14201E",
                      }}
                    >
                      {safeSubscription.priceLabel}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#F7F6F1",
                      borderRadius: "16px",
                      padding: "14px",
                      border: "1px solid #DCEBEA",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#7C8683" }}>
                      درصد باقی‌مانده
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontWeight: 900,
                        color: "var(--primary, #3A8778)",
                      }}
                    >
                      {remainingPercent}%
                    </div>
                  </div>
                </div>

                <Link
                  to="/subscriptionplans"
                  className="d-inline-flex align-items-center justify-content-center gap-2 mt-4"
                  style={{
                    width: "100%",
                    textDecoration: "none",
                    background: "linear-gradient(90deg, var(--primary, #3A8778), var(--primary-hover, #2F7063))",
                    color: "#fff",
                    padding: "14px",
                    borderRadius: "16px",
                    fontWeight: 800,
                  }}
                >
                  تمدید یا ارتقای اشتراک
                  <ArrowLeft size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
