import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { apiJson } from "../utils/api";
import "./Reports.css";

const toFa = (value, digits = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString("fa-IR", {
    maximumFractionDigits: digits,
  });
};

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(Math.max(number, min), max);
};

const getLevelMeta = (level, percent) => {
  if (level === "عالی" || Number(percent) >= 75) {
    return {
      label: "عالی",
      statusClass: "success",
      barColor: "var(--rp-success)",
    };
  }

  if (level === "ضعف جدی" || Number(percent) < 50) {
    return {
      label: "ضعف جدی",
      statusClass: "danger",
      barColor: "var(--rp-danger)",
    };
  }

  return {
    label: "نیاز به مرور",
    statusClass: "warning",
    barColor: "var(--rp-warning)",
  };
};

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const { response, data } = await apiJson("/api/reports");

      if (response.ok) {
        setReport(data || {});
      } else {
        setError(data?.error || "دریافت گزارش با مشکل مواجه شد.");
      }
    } catch {
      setError("ارتباط با سرور گزارش‌ها برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { response, data } = await apiJson("/api/reports");

        if (!active) return;

        if (response.ok) {
          setReport(data || {});
        } else {
          setError(data?.error || "دریافت گزارش با مشکل مواجه شد.");
        }
      } catch {
        if (active) {
          setError("ارتباط با سرور گزارش‌ها برقرار نشد.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const topics = useMemo(() => {
    if (!Array.isArray(report?.topics)) {
      return [];
    }
    return report.topics.filter(Boolean);
  }, [report]);

  const primaryWeakness = useMemo(() => {
    if (report?.primaryWeakness) {
      return report.primaryWeakness;
    }
    return (
      topics.find((topic) => topic.level === "ضعف جدی")?.name ||
      topics.find((topic) => Number(topic.percent) < 50)?.name ||
      ""
    );
  }, [report, topics]);

  const averageAccuracy =
    report?.averageAccuracy !== undefined && report?.averageAccuracy !== null
      ? Number(report.averageAccuracy)
      : null;

  const accuracyGrowth =
    report?.accuracyGrowth !== undefined && report?.accuracyGrowth !== null
      ? Number(report.accuracyGrowth)
      : null;

  const weeklyStudyHours = Number(report?.weeklyStudyHours ?? 0);
  const plannedStudyHours = Number(report?.plannedStudyHours ?? 0);

  const strongCount = topics.filter((topic) => {
    const percent = Number(topic?.percent ?? 0);
    return topic?.level === "عالی" || percent >= 75;
  }).length;

  const growthIsPositive = accuracyGrowth !== null && accuracyGrowth >= 0;

  return (
    <>
      <Helmet>
        <title>گزارش عملکرد | منتورا</title>
        <meta
          name="description"
          content="گزارش عملکرد هفتگی، وضعیت مباحث، میزان پیشرفت و پیشنهادهای مطالعاتی منتورا."
        />
        <link rel="canonical" href="https://mentoralearn.ir/reports" />
      </Helmet>

      <main className="reports-page">
        <div className="reports-container">
          {error && (
            <div className="reports-error">
              <div className="reports-error-text">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                className="reports-retry"
                onClick={fetchReports}
                disabled={loading}
              >
                <RefreshCw
                  size={14}
                  className={loading ? "reports-spin" : ""}
                />
                تلاش مجدد
              </button>
            </div>
          )}

          {/* Header */}
          <div className="reports-header">
            <div>
              <div className="reports-badge">
                <span className="reports-badge-dot" />
                تحلیل هوشمند هفتگی
              </div>
              <h1>گزارش عملکرد تحصیلی</h1>
              <p>
                ارزیابی دقیق وضعیت تست‌زنی، تسلط بر مباحث و اجرای برنامه مطالعه.
              </p>
            </div>

            <button
              type="button"
              className="reports-refresh-btn"
              onClick={fetchReports}
              disabled={loading}
              title="به‌روزرسانی داده‌ها"
            >
              <RefreshCw
                size={14}
                className={loading ? "reports-spin" : ""}
              />
              به‌روزرسانی داده‌ها
            </button>
          </div>

          {/* 4 Clean KPIs */}
          <section className="reports-kpis-grid" aria-label="شاخص‌های کلیدی عملکرد">
            {/* KPI 1: Accuracy */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-header">
                <span className="reports-kpi-label">میانگین صحت پاسخ</span>
                <div className="reports-kpi-icon mint">
                  <Target size={17} />
                </div>
              </div>
              <div className="reports-kpi-val">
                {loading ? (
                  <span className="reports-skeleton" />
                ) : averageAccuracy === null ? (
                  "—"
                ) : (
                  `${toFa(averageAccuracy, 1)}٪`
                )}
              </div>
              <div className="reports-kpi-sub">
                {accuracyGrowth === null ? (
                  "داده مقایسه‌ای کافی نیست"
                ) : (
                  <span
                    className={
                      growthIsPositive ? "reports-growth-pos" : "reports-growth-neg"
                    }
                  >
                    {growthIsPositive ? (
                      <TrendingUp size={12} style={{ verticalAlign: "-2px", marginLeft: 3 }} />
                    ) : (
                      <TrendingDown size={12} style={{ verticalAlign: "-2px", marginLeft: 3 }} />
                    )}
                    {toFa(Math.abs(accuracyGrowth), 1)}٪ نسبت به هفته گذشته
                  </span>
                )}
              </div>
            </div>

            {/* KPI 2: Completed Study Hours */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-header">
                <span className="reports-kpi-label">ساعات مطالعه انجام‌شده</span>
                <div className="reports-kpi-icon amber">
                  <Clock3 size={17} />
                </div>
              </div>
              <div className="reports-kpi-val">
                {loading ? (
                  <span className="reports-skeleton" />
                ) : (
                  `${toFa(weeklyStudyHours, 1)} ساعت`
                )}
              </div>
              <div className="reports-kpi-sub">
                {plannedStudyHours > 0
                  ? `از ${toFa(plannedStudyHours, 1)} ساعت برنامه‌ریزی‌شده`
                  : "طبق برنامه هفتگی"}
              </div>
            </div>

            {/* KPI 3: Mastered Topics */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-header">
                <span className="reports-kpi-label">مباحث مسلط (عالی)</span>
                <div className="reports-kpi-icon green">
                  <CheckCircle2 size={17} />
                </div>
              </div>
              <div className="reports-kpi-val">
                {loading ? (
                  <span className="reports-skeleton" />
                ) : (
                  toFa(strongCount)
                )}
              </div>
              <div className="reports-kpi-sub">
                {topics.length > 0
                  ? `از مجموع ${toFa(topics.length)} مبحث بررسی‌شده`
                  : "در جلسات تمرینی"}
              </div>
            </div>

            {/* KPI 4: Priority Topic */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-header">
                <span className="reports-kpi-label">نقطه تمرکز بعدی</span>
                <div className="reports-kpi-icon blue">
                  <AlertTriangle size={17} />
                </div>
              </div>
              <div
                className="reports-kpi-val"
                style={{ fontSize: "17px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={primaryWeakness || "موردی ثبت نشده"}
              >
                {loading ? (
                  <span className="reports-skeleton" />
                ) : (
                  primaryWeakness || "مورد بحرانی وجود ندارد"
                )}
              </div>
              <div className="reports-kpi-sub">
                {primaryWeakness
                  ? "نیازمند تمرین و مرور هدفمند"
                  : "وضعیت یادگیری متعادل است"}
              </div>
            </div>
          </section>

          {report?.finalExams && <section className="reports-panel" style={{ marginBottom: 24 }}>
            <div className="reports-panel-head"><h2>تمرین تشریحی نهایی</h2><Link to="/exams">رفتن به نهایی</Link></div>
            <div style={{ padding: 24 }}>
              <p>{toFa(report.finalExams.answered)} پاسخ ثبت‌شده · {toFa(report.finalExams.graded)} پاسخ خودارزیابی‌شده · {toFa(Math.round(report.finalExams.durationSeconds / 60))} دقیقه تمرین</p>
              {report.finalExams.graded > 0 && <p>امتیاز خودارزیابی: {toFa(report.finalExams.earnedPoints, 2)} از {toFa(report.finalExams.maxPoints, 2)}. این نتیجه نمرهٔ رسمی امتحان نیست.</p>}
              {report.finalExams.weakLessons.map(l => <p key={l.lessonId}>نیاز به مرور: {l.subject}، {l.title}</p>)}
            </div>
          </section>}

          {/* Main 2-Column Content */}
          <div className="reports-grid">
            {/* Column 1: Topics Mastery List */}
            <section className="reports-panel">
              <div className="reports-panel-head">
                <div className="reports-panel-title">
                  <div className="reports-panel-icon">
                    <Target size={18} />
                  </div>
                  <h2>وضعیت تسلط بر مباحث</h2>
                </div>
                <span style={{ fontSize: "12px", color: "var(--rp-text-muted)" }}>
                  {toFa(topics.length)} مبحث
                </span>
              </div>

              {topics.length === 0 ? (
                <div className="reports-empty">
                  <div className="reports-empty-icon">
                    <Target size={24} />
                  </div>
                  <h3>هنوز داده‌ای ثبت نشده است</h3>
                  <p>
                    با ثبت مطالعه و انجام تست در بخش تمرین، میزان تسلط مباحث در این بخش تحلیل خواهد شد.
                  </p>
                </div>
              ) : (
                <div className="reports-topics-list">
                  {topics.map((topic, index) => {
                    const percent =
                      topic?.percent === null || topic?.percent === undefined
                        ? null
                        : clamp(topic.percent);

                    const level = getLevelMeta(topic?.level, topic?.percent);

                    return (
                      <div
                        className="reports-topic-row"
                        key={topic?.id ?? topic?.name ?? index}
                      >
                        <span className="reports-topic-title" title={topic?.name || ""}>
                          {topic?.name || "مبحث بدون عنوان"}
                        </span>

                        <div className="reports-topic-bar-wrap">
                          <div className="reports-bar-track">
                            <div
                              className="reports-bar-fill"
                              style={{
                                width: `${percent ?? 0}%`,
                                background: level.barColor,
                              }}
                            />
                          </div>
                          <span className="reports-topic-pct">
                            {percent === null ? "—" : `${toFa(percent, 0)}٪`}
                          </span>
                        </div>

                        <span className={`reports-topic-badge ${level.statusClass}`}>
                          {level.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Column 2: Mentora Smart Insight */}
            <section className="reports-insight-card">
              <div>
                <div className="reports-insight-tag">
                  <Sparkles size={12} />
                  پیشنهاد هوشمند منتورا
                </div>

                <h3>
                  {primaryWeakness
                    ? `تقویت مبحث «${primaryWeakness}»`
                    : "حفظ ریتم پایدار مطالعه"}
                </h3>

                <p>
                  {primaryWeakness
                    ? `بر اساس تحلیل آخرین تمرین‌ها و تست‌های شما، رفع اشکال روی مبحث «${primaryWeakness}» بالاترین اولویت را برای رشد درصد و تراز شما دارد.`
                    : "روند مطالعه و یادگیری شما در سطح مطلوبی قرار دارد. با ادامه تست‌زنی و مرورهای منظم در زمان مقرر، این آمادگی را حفظ کنید."}
                </p>
              </div>

              <Link
                to={primaryWeakness ? "/tutor" : "/today"}
                className="reports-insight-btn"
              >
                <span>{primaryWeakness ? "رفع اشکال با مربی هوشمند" : "مشاهده برنامه امروز"}</span>
                <ArrowLeft size={16} />
              </Link>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
