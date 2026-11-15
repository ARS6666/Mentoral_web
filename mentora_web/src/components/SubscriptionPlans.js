import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronDown,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Gift,
  BookOpen,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";
import PublicNavbar from "./PublicNavbar";

const baseMonthlyPrice = 400000;

const plansData = [
  {
    id: 1,
    name: "اشتراک ۱ ماهه",
    subtitle: "مناسب شروع و آشنایی با سیستم",
    months: 1,
    price: baseMonthlyPrice,
    highlight: false,
    discountBadge: null,
  },
  {
    id: 2,
    name: "اشتراک ۳ ماهه",
    subtitle: "مناسب یک فصل آزمونی منسجم",
    months: 3,
    price: Math.round(baseMonthlyPrice * 3 * 0.97),
    highlight: false,
    discountBadge: "۳٪ تخفیف",
  },
  {
    id: 3,
    name: "اشتراک ۶ ماهه",
    subtitle: "محبوب‌ترین پلن برای تثبیت و جمع‌بندی",
    months: 6,
    price: Math.round(baseMonthlyPrice * 6 * 0.95),
    highlight: true,
    badgeText: "پیشنهاد ویژه ✦ محبوب‌ترین",
    discountBadge: "۵٪ تخفیف",
  },
  {
    id: 4,
    name: "اشتراک ۱ ساله",
    subtitle: "جامع کنکور تا روز آزمون سراسری",
    months: 12,
    price: Math.round(baseMonthlyPrice * 12 * 0.90),
    highlight: false,
    badgeText: "بیشترین صرفه‌جویی",
    discountBadge: "۱۰٪ تخفیف",
  },
];

const planFeatures = [
  "برنامه مطالعاتی هوشمند شخصی‌سازی‌شده با هوش مصنوعی",
  "مشاور و مربی هوشمند اختصاصی بدون محدودیت زمانی",
  "تحلیل تسلط مباحث و پیش‌بینی رتبه آزمون",
  "تایمر فوکوس حرفه‌ای و پایش ساعت مطالعه روزانه",
  "گزارش‌های جامع تحلیلی، بازدهی و نمودارهای پیشرفت",
  "ذخیره دائم تاریخچه مطالعه و همگام‌سازی ابری",
  "دسترسی کامل بدون هیچ‌گونه تبلیغات",
];

const faqs = [
  {
    q: "آیا پس از فعال‌سازی اشتراک، دسترسی به امکانات بلافاصله باز می‌شود؟",
    a: "بله، به محض فعال‌سازی با کد اشتراک، تمام بخش‌های هوش مصنوعی، مشاور، برنامه‌ریزی روزانه و تحلیل تسلط بدون کوچک‌ترین تأخیری در حسابتان فعال می‌شوند.",
  },
  {
    q: "اگر اکنون اشتراک فعال داشته باشم و پلن جدیدی فعال کنم، روزهای باقی‌مانده چه می‌شود؟",
    a: "هیچ روزی از بین نمی‌رود! مدت زمان پلن جدید دقیقاً به ادامه روزهای باقی‌مانده اشتراک فعلی شما اضافه خواهد شد.",
  },
  {
    q: "تفاوت پلن‌های مختلف در چیست؟",
    a: "از نظر دسترسی به هوش مصنوعی و امکانات پلتفرم هیچ تفاوتی بین پلن‌ها وجود ندارد و همه کاربران دسترسی کامل دارند. پلن‌های بلندمدت‌تر هزینه ماهانه بسیار کمتر و تخفیف اقتصادی بیشتری دارند.",
  },
  {
    q: "آیا می‌توانم روی چند دستگاه (گوشی، تبلت و لپ‌تاپ) از حسابم استفاده کنم؟",
    a: "بله، کافی است با شماره موبایل خود روی هر دستگاهی وارد شوید؛ اطلاعات و تاریخچه برنامه‌ریزی شما به صورت ابری همگام‌سازی می‌شود.",
  },
  {
    q: "کد فعال‌سازی را از کجا دریافت کنم؟",
    a: "کدهای فعال‌سازی از طریق کمپین‌های آموزشی، مدارس همکار، مشاوران تحصیلی و خرید مستقیم ارائه می‌شوند. کافی است کد دریافتی را در کادر فعال‌سازی هر پلن وارد کنید.",
  },
];

const formatPrice = (price) =>
  Math.round(price).toLocaleString("fa-IR") + " تومان";

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(plansData);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activationCode, setActivationCode] = useState("");
  const [activatingPlanId, setActivatingPlanId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated, loadMe } = useApp();

  useEffect(() => {
    let active = true;
    const loadPlans = async () => {
      try {
        const { response, data } = await apiJson("/api/subscription/plans");
        if (response.ok && active && Array.isArray(data.plans) && data.plans.length > 0) {
          const merged = data.plans.map((p) => {
            const fallback = plansData.find((f) => f.id === p.id || f.months === p.months);
            return {
              ...fallback,
              ...p,
              name: p.name || fallback?.name || `پلن ${p.months || 1} ماهه`,
              months: p.months || fallback?.months || 1,
              price: p.price || fallback?.price || baseMonthlyPrice,
            };
          });
          setPlans(merged);
        }
      } catch (_) {
        // fallback to preset plans
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPlans();
    return () => {
      active = false;
    };
  }, []);

  const handleOnlineCheckout = async (plan) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: "/subscriptionplans", planId: plan.id },
      });
      return;
    }

    setActivatingPlanId(plan.id);
    setError("");
    setSuccessMsg("");

    try {
      const { response, data } = await apiJson("/api/payments/bitpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!response.ok) {
        throw new Error(data.error || "ساخت پرداخت با مشکل مواجه شد.");
      }

      if (!data.paymentUrl) {
        throw new Error("آدرس درگاه پرداخت دریافت نشد.");
      }

      window.location.assign(data.paymentUrl);
    } catch (err) {
      setError(err.message || "اتصال به درگاه پرداخت با مشکل مواجه شد.");
      setActivatingPlanId(null);
    }
  };

  const handleCodeActivation = async (plan) => {
    const code = activationCode.trim();
    if (!code) {
      setSelectedPlanId(plan.id);
      setError("لطفاً کد فعال‌سازی یا بن هدیه را وارد کنید.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: "/subscriptionplans", activationCode: code, planId: plan.id },
      });
      return;
    }

    setActivatingPlanId(plan.id);
    setError("");
    setSuccessMsg("");

    try {
      const { response, data } = await apiJson("/api/subscription/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, activationCode: code }),
      });

      if (!response.ok) {
        throw new Error(data.error || "فعال‌سازی اشتراک با مشکل مواجه شد.");
      }

      setSuccessMsg("اشتراک شما با موفقیت فعال شد! در حال هدایت...");
      if (loadMe) await loadMe();

      setTimeout(() => {
        navigate("/subscription?payment=success");
      }, 1500);
    } catch (err) {
      setError(err.message || "کد واردشده معتبر نیست یا منقضی شده است.");
    } finally {
      setActivatingPlanId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>تعرفه‌ها و اشتراک هوشمند | منتورا</title>
        <meta
          name="description"
          content="پلن‌های شفاف اشتراک پلتفرم آموزشی منتورا با مشاور هوش مصنوعی و برنامه‌ریزی شخصی‌سازی‌شده کنکور."
        />
      </Helmet>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F5F6F3",
          color: "#182523",
          direction: "rtl",
          fontFamily: "Vazirmatn, Vazir, Tahoma, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ================= Standalone Header ================= */}
        <PublicNavbar />

        {/* ================= Main Content Container ================= */}
        <main style={{ flex: 1, paddingBottom: "70px" }}>
          {/* ================= Hero Section ================= */}
          <section
            style={{
              padding: "50px 20px 30px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "#FFFFFF",
                  border: "1px solid #E3E7E4",
                  borderRadius: "999px",
                  padding: "6px 18px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#3A8778",
                  marginBottom: "20px",
                  boxShadow: "0 2px 8px rgba(24, 37, 35, 0.04)",
                }}
              >
                <Sparkles size={14} />
                <span>تعرفه‌های شفاف و سرمایه‌گذاری هوشمند</span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 900,
                  lineHeight: "1.35",
                  letterSpacing: "-0.8px",
                  color: "#182523",
                  marginBottom: "16px",
                }}
              >
                یک مشاور و دستیار هوشمند،
                <br />
                همراه همیشگی مسیر کنکور و تحصیلی‌ات
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "15.5px",
                  color: "#63726F",
                  lineHeight: "1.8",
                  maxWidth: "620px",
                  margin: "0 auto 28px",
                  fontWeight: 500,
                }}
              >
                بدون هزینه‌های نجومی کلاس و مشاوره‌های سنتی؛ پلنی متناسب با برنامه درسی‌ات
                انتخاب کن و از برنامه شخصی‌سازی‌شده و مربی هوشمند ۲۴ ساعته بهره‌مند شو.
              </p>

              {/* Trust Badges */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px 24px",
                  fontSize: "13px",
                  color: "#182523",
                  fontWeight: 700,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={17} color="#3A8778" />
                  <span>۳ روز ضمانت بازگشت وجه</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={17} color="#3A8778" />
                  <span>فعال‌سازی فوری و آنی</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={17} color="#3A8778" />
                  <span>بدون تمدید خودکار اجباری</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={17} color="#3A8778" />
                  <span>قابل استفاده در تمام دستگاه‌ها</span>
                </div>
              </div>

              {/* Alerts: Error & Success */}
              {error && (
                <div
                  className="mx-auto mt-4"
                  style={{
                    maxWidth: "560px",
                    background: "#FEE2E2",
                    color: "#991B1B",
                    border: "1px solid #FCA5A5",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    textAlign: "right",
                  }}
                >
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div
                  className="mx-auto mt-4"
                  style={{
                    maxWidth: "560px",
                    background: "#E8F3F1",
                    color: "#24594E",
                    border: "1px solid #A8D1C7",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    textAlign: "right",
                  }}
                >
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          </section>

          {/* ================= Plans Grid Section ================= */}
          <section style={{ padding: "10px 20px 60px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div className="row g-4 justify-content-center align-items-stretch">
                {plans.map((plan) => {
                  const isHovered = hoveredCard === plan.id;
                  const isSelected = selectedPlanId === plan.id;
                  const isFeatured = Boolean(plan.highlight);
                  const priceLabel = plan.priceLabel || formatPrice(plan.price);
                  const monthlyPrice =
                    plan.monthlyPriceLabel || formatPrice(plan.price / plan.months);

                  return (
                    <div
                      key={plan.id}
                      className="col-12 col-md-6 col-lg-3 d-flex"
                      style={{ position: "relative" }}
                    >
                      <div
                        onMouseEnter={() => setHoveredCard(plan.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        style={{
                          width: "100%",
                          borderRadius: "22px",
                          backgroundColor: isFeatured ? "#FFFFFF" : "#FFFFFF",
                          border: isFeatured
                            ? "2px solid #3A8778"
                            : isSelected
                            ? "2px solid #182523"
                            : "1px solid #E3E7E4",
                          boxShadow: isFeatured
                            ? "0 14px 40px rgba(58, 135, 120, 0.18)"
                            : isHovered
                            ? "0 12px 32px rgba(24, 37, 35, 0.08)"
                            : "0 4px 16px rgba(24, 37, 35, 0.03)",
                          transform: isHovered
                            ? "translateY(-6px)"
                            : isFeatured
                            ? "scale(1.02)"
                            : "none",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          padding: "26px 20px 22px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Featured / Special Ribbon */}
                        {isFeatured && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(90deg, #3A8778, #2F7063)",
                              color: "#FFFFFF",
                              padding: "5px 0",
                              textAlign: "center",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              letterSpacing: "0.2px",
                            }}
                          >
                            <Crown size={14} />
                            <span>{plan.badgeText || "پیشنهاد ویژه ✦ محبوب‌ترین"}</span>
                          </div>
                        )}

                        {/* Best value tag for annual */}
                        {!isFeatured && plan.badgeText && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              background: "#182523",
                              color: "#FFFFFF",
                              padding: "4px 0",
                              textAlign: "center",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            {plan.badgeText}
                          </div>
                        )}

                        <div
                          style={{
                            paddingTop: isFeatured || plan.badgeText ? "14px" : "4px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Plan Header */}
                          <div style={{ marginBottom: "16px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                marginBottom: "6px",
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: "18px",
                                  fontWeight: 900,
                                  margin: 0,
                                  color: "#182523",
                                }}
                              >
                                {plan.name}
                              </h3>
                              {plan.discountBadge && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    background: "#E8F3F1",
                                    color: "#3A8778",
                                    padding: "2px 7px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  {plan.discountBadge}
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#63726F",
                                margin: 0,
                                minHeight: "34px",
                                lineHeight: "1.5",
                              }}
                            >
                              {plan.subtitle || "دسترسی کامل به تمام ابزارهای هوش مصنوعی"}
                            </p>
                          </div>

                          {/* Price Tag */}
                          <div
                            style={{
                              background: isFeatured ? "#F4F9F8" : "#F7F8F6",
                              borderRadius: "16px",
                              padding: "14px 10px",
                              textAlign: "center",
                              marginBottom: "20px",
                              border: isFeatured
                                ? "1px solid #D2E7E2"
                                : "1px solid #ECEEE9",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "22px",
                                fontWeight: 900,
                                color: isFeatured ? "#3A8778" : "#182523",
                                lineHeight: "1.2",
                              }}
                            >
                              {priceLabel}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#63726F",
                                marginTop: "4px",
                                fontWeight: 600,
                              }}
                            >
                              {plan.months === 1
                                ? "ماه اول بدون تعهد"
                                : `معادل ${monthlyPrice} در ماه`}
                            </div>
                          </div>

                          {/* Features List */}
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              margin: "0 0 24px 0",
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            {planFeatures.map((feat, idx) => (
                              <li
                                key={idx}
                                style={{
                                  fontSize: "12.5px",
                                  color: "#33413E",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "8px",
                                  lineHeight: "1.5",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    backgroundColor: isFeatured ? "#E8F3F1" : "#EDF1EE",
                                    color: "#3A8778",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "1px",
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA Actions */}
                          <div>
                            {/* Primary Button: Online Payment */}
                            <button
                              type="button"
                              disabled={loading || activatingPlanId === plan.id}
                              onClick={() => handleOnlineCheckout(plan)}
                              style={{
                                width: "100%",
                                padding: "13px 14px",
                                borderRadius: "14px",
                                border: isFeatured
                                  ? "none"
                                  : "1.5px solid #182523",
                                background: isFeatured
                                  ? "linear-gradient(90deg, #3A8778, #2F7063)"
                                  : "#182523",
                                color: "#FFFFFF",
                                fontSize: "13.5px",
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                boxShadow: isFeatured
                                  ? "0 4px 14px rgba(58, 135, 120, 0.25)"
                                  : "none",
                              }}
                            >
                              {activatingPlanId === plan.id ? (
                                <span>در حال اتصال به درگاه پرداخت...</span>
                              ) : (
                                <>
                                  <CreditCard size={16} />
                                  <span>پرداخت آنلاین و شروع اشتراک</span>
                                </>
                              )}
                            </button>

                            {/* Secondary Toggle: Voucher / Activation Code */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPlanId(null);
                                  setError("");
                                } else {
                                  setSelectedPlanId(plan.id);
                                  setError("");
                                  setSuccessMsg("");
                                }
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#63726F",
                                fontSize: "12px",
                                fontWeight: 700,
                                marginTop: "10px",
                                cursor: "pointer",
                                width: "100%",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "5px",
                                padding: "4px 0",
                              }}
                            >
                              <Gift size={13} color="#3A8778" />
                              <span>{isSelected ? "بستن کادر کد هدیه" : "کد فعال‌سازی یا بن هدیه داری؟"}</span>
                            </button>

                            {/* Activation Box */}
                            {isSelected && (
                              <div
                                style={{
                                  marginTop: "12px",
                                  padding: "14px",
                                  background: "#F7F8F5",
                                  border: "1px solid #DCE3DE",
                                  borderRadius: "14px",
                                }}
                              >
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#182523",
                                    marginBottom: "8px",
                                  }}
                                >
                                  کد فعال‌سازی یا بن اشتراک:
                                </label>
                                <input
                                  type="text"
                                  value={activationCode}
                                  onChange={(e) => setActivationCode(e.target.value)}
                                  placeholder="مثلاً MENTORA-1403"
                                  autoFocus
                                  disabled={activatingPlanId === plan.id}
                                  style={{
                                    width: "100%",
                                    padding: "9px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid #C4D3CE",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    textAlign: "center",
                                    direction: "ltr",
                                    color: "#182523",
                                    outline: "none",
                                    backgroundColor: "#FFFFFF",
                                    marginBottom: "10px",
                                  }}
                                />

                                <button
                                  type="button"
                                  disabled={activatingPlanId === plan.id}
                                  onClick={() => handleCodeActivation(plan)}
                                  style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "10px",
                                    background: "#3A8778",
                                    color: "#FFFFFF",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                  }}
                                >
                                  {activatingPlanId === plan.id ? (
                                    <span>در حال بررسی...</span>
                                  ) : (
                                    <>
                                      <Zap size={15} />
                                      <span>تایید و فعال‌سازی با کد</span>
                                    </>
                                  )}
                                </button>

                                {!isAuthenticated && (
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#63726F",
                                      textAlign: "center",
                                      marginTop: "8px",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    برای ثبت اشتراک به صفحه ورود هدایت می‌شوید.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= Comparison / Value Grid ================= */}
          <section
            style={{
              padding: "50px 20px",
              backgroundColor: "#FFFFFF",
              borderTop: "1px solid #E3E7E4",
              borderBottom: "1px solid #E3E7E4",
            }}
          >
            <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 800,
                    color: "#3A8778",
                    display: "inline-block",
                    marginBottom: "8px",
                  }}
                >
                  ارزش واقعی منتورا
                </span>
                <h2
                  style={{
                    fontSize: "clamp(22px, 3vw, 30px)",
                    fontWeight: 900,
                    color: "#182523",
                    margin: 0,
                  }}
                >
                  چرا منتورا جایگزین هوشمندانه‌تری برای روش‌های قدیمی است؟
                </h2>
              </div>

              <div className="row g-4">
                <div className="col-12 col-md-6 col-lg-3">
                  <div
                    style={{
                      background: "#F9FAF8",
                      borderRadius: "18px",
                      padding: "24px 20px",
                      height: "100%",
                      border: "1px solid #E7EAE5",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#E8F3F1",
                        color: "#3A8778",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <Zap size={22} />
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#182523",
                        marginBottom: "8px",
                      }}
                    >
                      برنامه‌ریزی هوشمند لحظه‌ای
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#63726F",
                        lineHeight: "1.7",
                        margin: 0,
                      }}
                    >
                      برخلاف برنامه‌های کاغذی و صلب، برنامه امروز شما هر زمان با توجه به
                      میزان خستگی، آزمون پیش‌رو و نقاط ضعف تطبیق داده می‌شود.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <div
                    style={{
                      background: "#F9FAF8",
                      borderRadius: "18px",
                      padding: "24px 20px",
                      height: "100%",
                      border: "1px solid #E7EAE5",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#E8F3F1",
                        color: "#3A8778",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <BookOpen size={22} />
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#182523",
                        marginBottom: "8px",
                      }}
                    >
                      مربی هوشمند و حل اشکال ۲۴/۷
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#63726F",
                        lineHeight: "1.7",
                        margin: 0,
                      }}
                    >
                      لازم نیست تا جلسه بعد صبر کنی؛ هر ساعت شبانه‌روز که تست سختی دیدی،
                      مفهوم درس را بپرس و گام‌به‌گام یاد بگیر.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <div
                    style={{
                      background: "#F9FAF8",
                      borderRadius: "18px",
                      padding: "24px 20px",
                      height: "100%",
                      border: "1px solid #E7EAE5",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#E8F3F1",
                        color: "#3A8778",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <TrendingUp size={22} />
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#182523",
                        marginBottom: "8px",
                      }}
                    >
                      پیش‌بینی علمی رتبه و تراز
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#63726F",
                        lineHeight: "1.7",
                        margin: 0,
                      }}
                    >
                      میزان تسلط مبحثی شما پایش می‌شود تا دقیقاً بدانی در کدام فصل‌ها
                      آماده آزمونی و کجاها نیاز به تست پوششی داری.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <div
                    style={{
                      background: "#F9FAF8",
                      borderRadius: "18px",
                      padding: "24px 20px",
                      height: "100%",
                      border: "1px solid #E7EAE5",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#E8F3F1",
                        color: "#3A8778",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <Gift size={22} />
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#182523",
                        marginBottom: "8px",
                      }}
                    >
                      صرفه‌جویی چشمگیر اقتصادی
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#63726F",
                        lineHeight: "1.7",
                        margin: 0,
                      }}
                    >
                      به جای پرداخت میلیون‌ها تومان هزینه مشاوره سنتی، با کسری از آن
                      هزینه بالاترین کیفیت ابزارهای تحصیلی روز را در اختیار داری.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= FAQs Section ================= */}
          <section style={{ padding: "60px 20px 20px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 800,
                    color: "#3A8778",
                    display: "inline-block",
                    marginBottom: "8px",
                  }}
                >
                  پاسخ به سوالات متداول
                </span>
                <h3
                  style={{
                    fontSize: "clamp(22px, 3vw, 28px)",
                    fontWeight: 900,
                    color: "#182523",
                    margin: 0,
                  }}
                >
                  پرسش‌هایی که دانش‌آموزان و اولیا معمولاً می‌پرسند
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      style={{
                        background: "#FFFFFF",
                        borderRadius: "16px",
                        border: "1px solid #E3E7E4",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        style={{
                          width: "100%",
                          padding: "18px 20px",
                          background: "none",
                          border: "none",
                          textAlign: "right",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          color: "#182523",
                          fontSize: "14.5px",
                          fontWeight: 800,
                        }}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={18}
                          style={{
                            transform: isOpen ? "rotate(180deg)" : "none",
                            transition: "transform 0.25s ease",
                            color: isOpen ? "#3A8778" : "#8A9491",
                            flexShrink: 0,
                            marginRight: "10px",
                          }}
                        />
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: "0 20px 18px",
                            fontSize: "13.5px",
                            color: "#576663",
                            lineHeight: "1.8",
                            borderTop: "1px solid #F0F2EF",
                            paddingTop: "12px",
                          }}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        {/* ================= Standalone Footer ================= */}
        <footer
          style={{
            backgroundColor: "#182523",
            color: "#FFFFFF",
            padding: "40px 20px 30px",
            borderTop: "1px solid #233431",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src="/logo-mark.png"
                  alt="Mentora"
                  style={{ width: "32px", height: "32px", objectFit: "contain" }}
                />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#FFFFFF" }}>
                    منتورا | پلتفرم هوشمند یادگیری کنکور
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                    برنامه‌ریزی، مشاور هوش مصنوعی و تحلیل تسلط مباحث
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <Link
                  to="/"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  صفحه اصلی
                </Link>
                <Link
                  to="/aboutus"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  درباره ما
                </Link>
                <Link
                  to="/support"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  پشتیبانی
                </Link>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "18px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              <span>تمامی حقوق مادی و معنوی برای پلتفرم منتورا محفوظ است.</span>
              <span>طراحی‌شده برای تمرکز، آرامش و موفقیت دانش‌آموزان</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
