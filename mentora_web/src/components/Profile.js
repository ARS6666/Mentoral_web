import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";
import { showToast } from "../utils/notify";
import {
  Camera,
  Save,
  Mail,
  Phone,
  School,
  ShieldCheck,
  Target,
  UserRound,
  Sparkles,
  CheckCircle2,
  Flame,
  Zap,
  Clock,
  MessageSquare,
  Award,
  Crown,
  LogOut,
  Layers,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import "./Profile.css";

export default function Profile() {
  const { profile, stats, updateProfile, logout } = useApp();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [chatMessageCount, setChatMessageCount] = useState(0);
  const [latestWeeklyPlan, setLatestWeeklyPlan] = useState(null);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    major: "",
    grade: "",
    targetRank: "",
    studyHours: 6,
    bio: "",
  });

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const { response, data } = await apiJson("/api/profile");

        if (response.ok) {
          const p = data.profile || {};

          if (active) {
            setFormData({
              name: p.name || "",
              email: p.email || "",
              phone: p.phone || "",
              major: p.major || "",
              grade: p.grade || "",
              targetRank: p.targetRank || "",
              studyHours: p.studyHours || 6,
              bio: p.bio || "",
            });
            if (typeof data.chatMessageCount === "number") {
              setChatMessageCount(data.chatMessageCount);
            }
            if (data.latestWeeklyPlan) {
              setLatestWeeklyPlan(data.latestWeeklyPlan);
            }
          }
        }
      } catch (err) {
        console.error("خطا در دریافت پروفایل:", err);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("لطفاً یک فایل تصویری انتخاب کنید.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.", "error");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    showToast("تصویر با موفقیت انتخاب شد", "success");
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const { response, data } = await apiJson("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(data.error || "خطا در ذخیره اطلاعات");
      }

      const p = data.profile || {};

      updateProfile({
        name: p.name,
        email: p.email,
        phone: p.phone,
        grade: p.grade,
        major: p.major,
        targetRank: p.targetRank,
        bio: p.bio,
        studyHours: p.studyHours,
        examYear: p.examYear,
      });

      showToast("اطلاعات پروفایل با موفقیت ذخیره شد", "success");
    } catch (err) {
      showToast(err.message || "خطا در ذخیره اطلاعات", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("آیا برای خروج از حساب کاربری اطمینان دارید؟")) {
      await logout();
      navigate("/login");
    }
  };

  const streakDays = stats?.streakCount || 0;
  const xpPoints = stats?.xpPoints || 0;
  const readiness = stats?.readinessScore || 75;
  const subDays = profile?.subscription_days ?? 0;
  const hasSub = profile?.subscriptionActive;

  // Motivational Badges
  const badges = [
    {
      id: "starter",
      title: "گام نخست",
      desc: "ورود به خانواده منتورا و تکمیل اولیه حساب کاربری",
      icon: "🚀",
      unlocked: true,
    },
    {
      id: "target_set",
      title: "هدف‌گذاری هوشمند",
      desc: "مشخص کردن رشته، پایه و هدف رتبه در کنکور",
      icon: "🎯",
      unlocked: Boolean(formData.major && formData.targetRank),
    },
    {
      id: "streak_3",
      title: "شعله تمرکز",
      desc: "حداقل ۳ روز استریک مداوم مطالعه و حضور",
      icon: "🔥",
      unlocked: streakDays >= 3,
    },
    {
      id: "xp_100",
      title: "جوینده دانش",
      desc: "کسب حداقل ۱۰۰ امتیاز تجربه (XP) در سیستم",
      icon: "⚡",
      unlocked: xpPoints >= 100,
    },
    {
      id: "mentor_ask",
      title: "پرسشگر کنجکاو",
      desc: "طرح حداقل ۵ پرسش تحصیلی از معلم هوشمند",
      icon: "💬",
      unlocked: chatMessageCount >= 5,
    },
    {
      id: "weekly_plan",
      title: "استراتژیست منظم",
      desc: "تولید و ثبت برنامه مطالعه تطبیقی هفتگی",
      icon: "📅",
      unlocked: Boolean(latestWeeklyPlan),
    },
  ];

  return (
    <>
      <Helmet>
        <title>پروفایل کاربری | منتورا</title>
        <meta
          name="description"
          content="مدیریت حساب کاربری، اطلاعات تحصیلی، هدف رتبه، وضعیت اشتراک و دستاوردها در منتورا."
        />
        <link rel="canonical" href="https://mentoralearn.ir/profile" />
      </Helmet>

      <div className="profile-page">
        <div className="profile-container">
          {/* Header */}
          <header className="profile-header">
            <div className="profile-header-title-wrap">
              <div className="profile-header-icon">
                <UserRound size={24} />
              </div>
              <div>
                <div className="profile-badge">
                  <span className="profile-badge-dot" />
                  حساب کاربری دانش‌آموز
                </div>
                <h1>پروفایل من</h1>
                <p>اطلاعات تحصیلی، اهداف کنکور و دستاوردهای یادگیری‌ات را مدیریت کن.</p>
              </div>
            </div>

            <div className="profile-header-actions">
              <button
                type="button"
                className="profile-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </header>

          {/* Hero Banner Card */}
          <section className="profile-hero-card">
            <div className="profile-hero-content">
              <div className="profile-hero-identity">
                <div className="profile-avatar-wrap">
                  <div
                    className="profile-avatar"
                    style={
                      profileImage
                        ? { backgroundImage: `url(${profileImage})` }
                        : undefined
                    }
                  >
                    {!profileImage && (formData.name || "؟").slice(0, 1)}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="profile-avatar-camera"
                    title="تغییر تصویر نمایه"
                  >
                    <Camera size={14} />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="profile-hero-info">
                  <h2>{formData.name || "دانش‌آموز منتورا"}</h2>
                  <div className="profile-hero-tags">
                    <span className="profile-hero-tag">
                      <School size={13} />
                      {formData.grade ? `پایه ${formData.grade}` : "پایه ثبت‌نشده"}
                    </span>
                    <span className="profile-hero-tag">
                      <Layers size={13} />
                      {formData.major ? `رشته ${formData.major}` : "رشته ثبت‌نشده"}
                    </span>
                    <span className="profile-hero-tag subscription-tag">
                      <Crown size={13} />
                      {hasSub
                        ? `${subDays} روز اشتراک فعال`
                        : "نسخه آزمایشی / پایه"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Link to="/subscriptionplans" className="profile-btn-secondary" style={{ color: "#fff", background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" }}>
                  <Crown size={15} style={{ color: "#8CF2CE" }} />
                  {hasSub ? "تمدید یا ارتقای اشتراک" : "خرید اشتراک ویژه"}
                </Link>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="profile-stats-bar">
              <div className="profile-stat-box streak">
                <div className="profile-stat-icon-wrap">
                  <Flame size={18} />
                </div>
                <div>
                  <span className="profile-stat-label">استریک مداوم</span>
                  <span className="profile-stat-value">{streakDays} روز</span>
                </div>
              </div>

              <div className="profile-stat-box xp">
                <div className="profile-stat-icon-wrap">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="profile-stat-label">امتیاز تجربه (XP)</span>
                  <span className="profile-stat-value">{xpPoints} XP</span>
                </div>
              </div>

              <div className="profile-stat-box rank">
                <div className="profile-stat-icon-wrap">
                  <Target size={18} />
                </div>
                <div>
                  <span className="profile-stat-label">هدف رتبه</span>
                  <span className="profile-stat-value">{formData.targetRank || "تعیین‌نشده"}</span>
                </div>
              </div>

              <div className="profile-stat-box hours">
                <div className="profile-stat-icon-wrap">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="profile-stat-label">هدف مطالعه روزانه</span>
                  <span className="profile-stat-value">{formData.studyHours || 6} ساعت</span>
                </div>
              </div>

              <div className="profile-stat-box chats">
                <div className="profile-stat-icon-wrap">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <span className="profile-stat-label">پرسش از معلم هوشمند</span>
                  <span className="profile-stat-value">{chatMessageCount} سوال</span>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation Tabs */}
          <nav className="profile-tabs-nav">
            <button
              type="button"
              className={`profile-tab-button ${activeTab === "info" ? "is-active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <UserRound size={16} />
              اطلاعات فردی و تحصیلی
            </button>

            <button
              type="button"
              className={`profile-tab-button ${activeTab === "subscription" ? "is-active" : ""}`}
              onClick={() => setActiveTab("subscription")}
            >
              <Crown size={16} />
              پلن و اشتراک من
            </button>

            <button
              type="button"
              className={`profile-tab-button ${activeTab === "achievements" ? "is-active" : ""}`}
              onClick={() => setActiveTab("achievements")}
            >
              <Award size={16} />
              مدال‌ها و دستاوردها
            </button>

            <button
              type="button"
              className={`profile-tab-button ${activeTab === "settings" ? "is-active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <ShieldCheck size={16} />
              تنظیمات و امنیت
            </button>
          </nav>

          {/* TAB 1: Personal & Academic Info */}
          {activeTab === "info" && (
            <section className="profile-panel">
              <div className="profile-panel-head">
                <div className="profile-panel-title">
                  <div className="profile-panel-icon">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <h2>مشخصات فردی و تحصیلی</h2>
                    <p>اطلاعات پایه برای شخصی‌سازی برنامه‌ریزی هوشمند و ارتباط با سیستم</p>
                  </div>
                </div>
                <span className="profile-badge">
                  <CheckCircle2 size={13} />
                  همگام با سرور
                </span>
              </div>

              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="pf-name">نام و نام خانوادگی</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><UserRound size={16} /></span>
                    <input
                      id="pf-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="نام کامل خود را وارد کنید"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-email">ایمیل</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><Mail size={16} /></span>
                    <input
                      id="pf-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-phone">شماره تلفن همراه</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><Phone size={16} /></span>
                    <input
                      id="pf-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-targetRank">هدف رتبه در کنکور</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><Target size={16} /></span>
                    <input
                      id="pf-targetRank"
                      type="text"
                      name="targetRank"
                      value={formData.targetRank}
                      onChange={handleChange}
                      placeholder="مثلاً: زیر ۱۰۰۰ یا دو رقمی"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-major">رشته تحصیلی</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><School size={16} /></span>
                    <select
                      id="pf-major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                    >
                      <option value="">انتخاب رشته تحصیلی</option>
                      <option value="تجربی">علوم تجربی</option>
                      <option value="ریاضی">ریاضی و فیزیک</option>
                    </select>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-grade">پایه تحصیلی</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><School size={16} /></span>
                    <select
                      id="pf-grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                    >
                      <option value="">انتخاب پایه تحصیلی</option>
                      <option value="یازدهم">پایه یازدهم</option>
                      <option value="دوازدهم">پایه دوازدهم / کنکوری</option>
                    </select>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-studyHours">هدف ساعت مطالعه روزانه (ساعت)</label>
                  <div className="profile-input-wrap">
                    <span className="profile-input-icon"><Clock size={16} /></span>
                    <input
                      id="pf-studyHours"
                      type="number"
                      name="studyHours"
                      min={1}
                      max={16}
                      value={formData.studyHours}
                      onChange={handleChange}
                      placeholder="مثلاً ۶ ساعت"
                    />
                  </div>
                  <span className="profile-field-hint">دستیار برنامه‌ریزی حجم دروس را متناسب با این عدد تنظیم می‌کند.</span>
                </div>

                <div className="profile-field field-full">
                  <label htmlFor="pf-bio">درباره من و انگیزه‌ها</label>
                  <textarea
                    id="pf-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="از اهدافت، انگیزه‌هات برای درس خوندن یا شرایط فعلی مطالعاتی‌ات بنویس..."
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            </section>
          )}

          {/* TAB 2: Subscription & Access */}
          {activeTab === "subscription" && (
            <section className="profile-panel">
              <div className="profile-panel-head">
                <div className="profile-panel-title">
                  <div className="profile-panel-icon">
                    <Crown size={18} />
                  </div>
                  <div>
                    <h2>وضعیت اشتراک و سطح دسترسی</h2>
                    <p>بررسی روزهای باقی‌مانده و میزان استفاده از قابلیت‌های ویژه هوش مصنوعی</p>
                  </div>
                </div>
              </div>

              <div className="profile-sub-grid">
                <div className="profile-sub-hero">
                  <div>
                    <div className="profile-sub-status-row">
                      <span className="profile-badge">
                        <CheckCircle2 size={13} />
                        {hasSub ? "اشتراک فعال" : "دوره پایه / آزمایشی"}
                      </span>
                      <Sparkles size={20} style={{ color: "#3A8778" }} />
                    </div>

                    <h3 style={{ margin: "0 0 6px", fontSize: "19px", fontWeight: 800 }}>
                      {hasSub ? "پلن پریمیوم منتورا" : "پلن استاندارد منتورا"}
                    </h3>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--pf-text-muted)", lineHeight: 1.8 }}>
                      دسترسی نامحدود به دستیار برنامه‌ریزی هوشمند، معلم هوش مصنوعی و آزمون‌های طبقه‌بندی شده.
                    </p>

                    <div className="profile-sub-days-remaining">
                      <strong>{subDays}</strong>
                      <span>روز باقی‌مانده تا پایان دوره</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link to="/subscriptionplans" className="profile-btn-primary w-100">
                      <Crown size={16} />
                      {hasSub ? "تمدید یا ارتقای اشتراک" : "فعال‌سازی اشتراک ویژه"}
                    </Link>
                  </div>
                </div>

                <div className="profile-usage-card">
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 800 }}>
                    میزان مصرف امکانات هوشمند
                  </h4>
                  <p style={{ margin: "0 0 10px", fontSize: "11.5px", color: "var(--pf-text-muted)" }}>
                    گزارش مصرف ابزارهای کمکی شما در این دوره
                  </p>

                  <div className="profile-usage-item">
                    <span>پرسش از معلم هوشمند</span>
                    <strong>{chatMessageCount} سوال</strong>
                  </div>
                  <div className="profile-usage-item">
                    <span>برنامه‌ریزی تطبیقی هفتگی</span>
                    <strong>{latestWeeklyPlan ? "۱ برنامه فعال" : "در انتظار ایجاد"}</strong>
                  </div>
                  <div className="profile-usage-item">
                    <span>پیش‌بینی هوشمند رتبه</span>
                    <strong>فعال در سیستم</strong>
                  </div>
                  <div className="profile-usage-item">
                    <span>بانک سوالات و تمرین</span>
                    <strong>دسترسی کامل</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: Achievements & Badges */}
          {activeTab === "achievements" && (
            <section className="profile-panel">
              <div className="profile-panel-head">
                <div className="profile-panel-title">
                  <div className="profile-panel-icon">
                    <Award size={18} />
                  </div>
                  <div>
                    <h2>مدال‌ها و دستاوردهای مطالعاتی</h2>
                    <p>نشان‌های انگیزشی که با نظم، پشتکار و پیشرفت در مطالعه آزاد می‌شوند</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="profile-badge">
                    <Zap size={13} />
                    شاخص آمادگی: {readiness}%
                  </span>
                </div>
              </div>

              <div className="profile-badges-grid">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`profile-badge-card ${b.unlocked ? "unlocked" : "locked"}`}
                  >
                    <div className="profile-badge-icon">
                      {b.icon}
                    </div>
                    <div className="profile-badge-text">
                      <h4>{b.title}</h4>
                      <p>{b.desc}</p>
                      <div className="mt-2">
                        {b.unlocked ? (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3A8778", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={12} /> کسب شده
                          </span>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#888" }}>
                            در حال پیشرفت...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 4: Settings & Security */}
          {activeTab === "settings" && (
            <section className="profile-panel">
              <div className="profile-panel-head">
                <div className="profile-panel-title">
                  <div className="profile-panel-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2>تنظیمات و امنیت حساب کاربری</h2>
                    <p>مدیریت اعلان‌ها، یادآورهای ریتم مطالعه و خروج امن</p>
                  </div>
                </div>
              </div>

              <div className="profile-settings-list">
                <div className="profile-setting-row">
                  <div className="profile-setting-info">
                    <h4>اعلان‌های یادآور برنامه روزانه</h4>
                    <p>ارسال یادآور و ناتیفیکیشن برای بازه‌های مطالعاتی برنامه‌ریزی‌شده</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyReminders}
                    onChange={(e) => setDailyReminders(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "#3A8778", cursor: "pointer" }}
                  />
                </div>

                <div className="profile-setting-row">
                  <div className="profile-setting-info">
                    <h4>پیشنهادات هوشمند بهبود ریتم مطالعه</h4>
                    <p>دریافت گزارش‌های تطبیقی بر اساس عملکرد واقعی و تست‌های هفتگی</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "#3A8778", cursor: "pointer" }}
                  />
                </div>

                <div className="profile-setting-row">
                  <div className="profile-setting-info">
                    <h4>امنیت و نشست کاربری</h4>
                    <p>پروتکل احراز هویت با شماره موبایل و توکن امن رمزنگاری‌شده</p>
                  </div>
                  <span className="profile-badge">
                    <CheckCircle2 size={13} />
                    حساب ایمن
                  </span>
                </div>

                <div className="profile-setting-row" style={{ borderColor: "#FCA5A5", background: "#FEF2F2" }}>
                  <div className="profile-setting-info">
                    <h4 style={{ color: "#991B1B" }}>خروج از حساب کاربری</h4>
                    <p style={{ color: "#B91C1C" }}>با خروج از حساب، برای ورود مجدد نیاز به دریافت کد پیامکی خواهید داشت.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "inherit",
                    }}
                  >
                    <LogOut size={15} />
                    خروج از حساب
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
