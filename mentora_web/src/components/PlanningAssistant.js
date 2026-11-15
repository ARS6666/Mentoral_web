import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Clock,
  RotateCcw,
  Sparkles,
  TimerReset,
  Wand2,
  Clock10Icon,
  AlertCircle,
  CheckCircle2,
  Check,
  CalendarDays,
  Copy,
  GripVertical,
  Undo2,
  Wrench,
  X,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";
import StudyLoading from "./StudyLoading";
import { Helmet } from "react-helmet-async";
import "./PlanningAssistant.css";

const DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const persianDigits = (value) => String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const defaultCourseInput = () => ({
  student_weakness: 3,
  target_importance: 4,
  interest: 3,
  backlog_hours: 0,
  last_test_percent: 50,
  notes: "",
});

const clampNumber = (value, min, max, fallback = min) => {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return fallback;
  }

  return Math.min(Math.max(numeric, min), max);
};

export default function PlanningAssistant() {
  const {
    profile,
    latestWeeklyPlan,
    refresh,
    loadMe,
    loading: globalLoading,
  } = useApp();

  const [studentName, setStudentName] = useState("دانش‌آموز منتورا");
  const [grade, setGrade] = useState((profile && profile.grade) || "دوازدهم");
  const [major, setMajor] = useState((profile && profile.major) || "تجربی");
  const [examYear, setExamYear] = useState("۱۴۰۵");
  const [goal, setGoal] = useState(
    profile && profile.targetRank
      ? `رسیدن به رتبه ${profile.targetRank}`
      : "افزایش تراز و اجرای منظم برنامه",
  );

  const [dailyHours, setDailyHours] = useState(
    Object.fromEntries(
      DAYS.map((day) => [day, (profile && profile.studyHours) || 6]),
    ),
  );

  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState(90);
  const [restMinutes, setRestMinutes] = useState(15);
  const [constraints, setConstraints] = useState("جمعه سبک‌تر باشد");
  const [catalog, setCatalog] = useState([]);
  const [courses, setCourses] = useState({});
  const [plan, setPlan] = useState(null);

  const [creatingNewPlan, setCreatingNewPlan] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [examCalendar, setExamCalendar] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [examBusy, setExamBusy] = useState(false);
  const [customExam, setCustomExam] = useState({ title: "", examYear: "", examMonth: "", examDay: "", topics: "", subjects: "" });
  const currentJalaliYear = Number(new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", timeZone: "Asia/Tehran" }).formatToParts(new Date()).find((part) => part.type === "year")?.value);
  const [lifeProfile, setLifeProfile] = useState({
    wakeTime: "07:00",
    sleepTime: "23:00",
    chronotype: "neutral",
    commitments: [],
  });
  const [commitmentDraft, setCommitmentDraft] = useState({
    day: "شنبه",
    start: "08:00",
    end: "09:00",
    title: "",
  });
  const [examResult, setExamResult] = useState({ examEventId: "", course: "", percentage: "", percentages: {}, metricType: "score", metricValue: "" });
  const [examResults, setExamResults] = useState([]);
  const [resultSaved, setResultSaved] = useState(false);
  const selectedExam = (examCalendar?.events || []).find((exam) => String(exam.id) === examResult.examEventId);
  const examSubjects = selectedExam
    ? Object.keys(selectedExam.topics || {}).filter((name) => name !== "سرفصل‌ها")
    : [];
  const resultSubjects = selectedExam?.custom && !examSubjects.length ? catalog.map((item) => item.name) : examSubjects;

  const [initializedFromProfile, setInitializedFromProfile] = useState(false);
  const [initializedLatestPlan, setInitializedLatestPlan] = useState(false);

  const weeklyHours = useMemo(() => {
    return Object.values(dailyHours).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
  }, [dailyHours]);

  const averageDailyHours = useMemo(() => {
    return weeklyHours ? (weeklyHours / DAYS.length).toFixed(1) : 0;
  }, [weeklyHours]);

  const hasCourses = catalog.length > 0;

  useEffect(() => {
    if (!profile || initializedFromProfile) {
      return;
    }

    setStudentName(profile.name || "دانش‌آموز منتورا");
    setGrade(profile.grade || "دوازدهم");
    setMajor(profile.major || "تجربی");
    setExamYear(profile.examYear || "۱۴۰۵");
    setGoal(
      profile.targetRank
        ? `رسیدن به رتبه ${profile.targetRank}`
        : "افزایش تراز و اجرای منظم برنامه",
    );

    const defaultStudyHours = Number(profile.studyHours) || 6;

    setDailyHours(
      Object.fromEntries(DAYS.map((day) => [day, defaultStudyHours])),
    );

    setInitializedFromProfile(true);
  }, [profile, initializedFromProfile]);

  useEffect(() => {
    const loadLatestPlan = async () => {
      if (latestWeeklyPlan || initializedLatestPlan) {
        return;
      }

      if (loadMe) {
        await loadMe();
      }

      setInitializedLatestPlan(true);
    };

    loadLatestPlan();
  }, [latestWeeklyPlan, initializedLatestPlan, loadMe]);

  useEffect(() => {
    if (
      !latestWeeklyPlan ||
      plan ||
      creatingNewPlan ||
      !initializedFromProfile
    ) {
      return;
    }

    setPlan(latestWeeklyPlan);
  }, [latestWeeklyPlan, plan, creatingNewPlan, initializedFromProfile]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCatalog(true);
      setError("");

      try {
        const { response, data } = await apiJson(
          `/api/planner/courses?major=${encodeURIComponent(major)}`,
        );

        if (!response.ok) {
          throw new Error(
            data.error || "دریافت فهرست درس‌ها با مشکل مواجه شد.",
          );
        }

        const receivedCourses = data.courses || [];

        setCatalog(receivedCourses);
        setCourses((prev) => {
          const next = {};

          for (const item of receivedCourses) {
            next[item.name] = prev[item.name] || {
              ...defaultCourseInput(),
              backlog_hours: item.suggestedBacklogHours || 0,
              last_test_percent: item.suggestedAccuracy ?? 50,
              student_weakness: item.suggestedAccuracy == null
                ? 3
                : Math.max(1, Math.min(5, 5 - Math.floor(item.suggestedAccuracy / 20))),
              notes: Array.isArray(item.weakTopics) && item.weakTopics.length
                ? `مباحث نیازمند مرور: ${item.weakTopics.slice(0, 3).join("، ")}`
                : "",
            };
          }

          return next;
        });
      } catch (err) {
        setError(err.message || "ارتباط با سرور برنامه‌ریز برقرار نشد.");
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCourses();
  }, [major]);

  useEffect(() => {
    const loadPlanningProfile = async () => {
      const { response, data } = await apiJson("/api/planner/profile");
      if (response.ok && data.planningProfile) {
        setLifeProfile(data.planningProfile);
      }
    };
    loadPlanningProfile();
  }, []);

  const loadExamCalendar = async () => {
    try {
      const { response, data } = await apiJson("/api/planner/exams");
      if (!response.ok) return;
      setExamCalendar(data);
      setSelectedProvider(data.preference?.provider || "");
    } catch {
      // The planner still works without an exam calendar.
    }
  };

  useEffect(() => {
    loadExamCalendar();
    apiJson("/api/planner/exam-results").then(({ response, data }) => {
      if (response.ok) setExamResults(data.results || []);
    }).catch(() => {});
  }, []);

  const selectExamProvider = async (provider) => {
    setSelectedProvider(provider);
    setExamBusy(true);
    setError("");
    try {
      const { response, data } = await apiJson("/api/planner/exams/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, grade, major, academicYear: examCalendar?.academicYear }),
      });
      if (!response.ok) throw new Error(data.error || "برنامه آزمون ذخیره نشد.");
      setExamCalendar((previous) => ({ ...previous, preference: data.preference, upcoming: data.upcoming || [], events: data.events || [] }));
      setExamResult((value) => ({ ...value, examEventId: "", course: "", percentage: "", percentages: {} }));
    } catch (err) {
      setError(err.message || "برنامه آزمون ذخیره نشد.");
    } finally {
      setExamBusy(false);
    }
  };

  const addCustomExam = async () => {
    if (!customExam.title.trim() || !customExam.examYear || !customExam.examMonth || !customExam.examDay) {
      setError("نام و تاریخ آزمون را وارد کن.");
      return;
    }
    setExamBusy(true);
    setError("");
    try {
      const { response, data } = await apiJson("/api/planner/exams/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customExam.title,
          examDateJalali: `${customExam.examYear}/${customExam.examMonth}/${customExam.examDay}`,
          topics: customExam.topics,
          subjects: customExam.subjects.split(/[,،]/).map((value) => value.trim()).filter(Boolean),
          grade,
          major,
        }),
      });
      if (!response.ok) throw new Error(data.error || "آزمون اضافه نشد.");
      setSelectedProvider("custom");
      setCustomExam({ title: "", examYear: "", examMonth: "", examDay: "", topics: "", subjects: "" });
      await loadExamCalendar();
    } catch (err) {
      setError(err.message || "آزمون اضافه نشد.");
    } finally {
      setExamBusy(false);
    }
  };

  const deleteCustomExam = async (examId) => {
    const { response, data } = await apiJson(`/api/planner/exams/custom/${examId}`, { method: "DELETE" });
    if (!response.ok) {
      setError(data.error || "آزمون حذف نشد.");
      return;
    }
    await loadExamCalendar();
  };

  const updateDailyHour = (day, value) => {
    setDailyHours((prev) => ({
      ...prev,
      [day]: clampNumber(value, 1, 16, prev[day] || 6),
    }));
  };

  const updateCourse = (courseName, field, value) => {
    setCourses((prev) => ({
      ...prev,
      [courseName]: {
        ...(prev[courseName] || defaultCourseInput()),
        [field]: value,
      },
    }));
  };

  const buildPayload = () => ({
    student: {
      name: profile?.name || studentName || "دانش‌آموز منتورا",
      grade: profile?.grade || grade || "دوازدهم",
      major: profile?.major || major || "تجربی",
      exam_year: profile?.examYear || examYear,
      goal: profile?.targetRank ? `رسیدن به رتبه ${profile.targetRank}` : goal,
    },
    availability: {
      daily_hours: dailyHours,
      preferred_session_minutes: preferredSessionMinutes,
      rest_minutes_between_sessions: restMinutes,
      constraints: constraints
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    },
    courses,
  });

  const saveLifeProfile = async () => {
    const { response, data } = await apiJson("/api/planner/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lifeProfile),
    });
    if (!response.ok) throw new Error(data.error || "ذخیره محدودیت‌های زمانی انجام نشد.");
  };

  const addCommitment = () => {
    if (!commitmentDraft.title.trim() || commitmentDraft.end <= commitmentDraft.start) return;
    setLifeProfile((value) => ({
      ...value,
      commitments: [...(value.commitments || []), commitmentDraft],
    }));
    setCommitmentDraft((value) => ({ ...value, title: "" }));
  };

  const saveExamResult = async () => {
    setResultSaved(false);
    const percentages = Object.fromEntries(Object.entries(examResult.percentages).filter(([, value]) => value !== "").map(([name, value]) => [name, Number(value)]));
    if (examResult.course && examResult.percentage !== "") percentages[examResult.course] = Number(examResult.percentage);
    if (!selectedExam || !Object.keys(percentages).length || examResult.metricValue === "") {
      setError("آزمون، درصد دست‌کم یک درس و رتبه یا تراز را وارد کن.");
      return;
    }
    try {
      const { response, data } = await apiJson("/api/planner/exam-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examEventId: selectedExam.id,
          percentages,
          [examResult.metricType]: Number(examResult.metricValue),
        }),
      });
      if (!response.ok) {
        setError(data.error || "ثبت نتیجه آزمون انجام نشد.");
        return;
      }
      setError("");
      setResultSaved(true);
      setExamResults((items) => [data.result, ...items]);
      setExamResult((value) => ({ ...value, course: "", percentage: "", percentages: {}, metricValue: "" }));
    } catch {
      setError("ارتباط با سرور برقرار نشد؛ نتیجه ذخیره نشد.");
    }
  };

  const handleGenerate = async () => {
    if (generating || loadingCatalog) {
      return;
    }

    setGenerating(true);
    setError("");

    try {
      await saveLifeProfile();
      const { response, data } = await apiJson("/api/planner/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        throw new Error(data.error || "تولید برنامه با مشکل مواجه شد.");
      }

      setInitializedLatestPlan(true);
      await Promise.allSettled([
        refresh ? refresh({ silent: true }) : null,
        loadMe ? loadMe() : null,
      ]);
      setPlan(data);
      setCreatingNewPlan(false);
    } catch (err) {
      setError(err.message || "در فرآیند تولید برنامه خطایی رخ داد.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateNewPlan = () => {
    setCreatingNewPlan(true);
    setPlan(null);
    setError("");
    setCopied(false);
  };

  const handleCopyMarkdown = async () => {
    if (!plan?.markdown) {
      return;
    }

    try {
      await navigator.clipboard.writeText(plan.markdown);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  if (globalLoading) {
    return <StudyLoading />;
  }

  if (plan && !creatingNewPlan) {
    return (
      <>
        <Helmet>
          <title>برنامه هفتگی شخصی‌سازی‌شده | منتورا</title>
          <meta
            name="description"
            content="نمایش برنامه هفتگی شخصی‌سازی‌شده دانش‌آموز بر اساس وضعیت درس‌ها، ساعات آزاد و هدف تحصیلی."
          />
          <link
            rel="canonical"
            href="https://mentoralearn.ir/planningassistant"
          />
        </Helmet>
        <PlannerWorkspace
          plan={plan}
          copied={copied}
          onCopy={handleCopyMarkdown}
          onCreateNew={handleCreateNewPlan}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>برنامه‌ریزی تحصیلی هوشمند | مشاور درسی AI</title>
        <meta
          name="description"
          content="تنظیم خودکار جدول مطالعه هفتگی و روزانه متناسب با بودجه‌بندی آزمون‌ها و ساعت آزاد شما توسط هوش مصنوعی منتورا."
        />
        <link
          rel="canonical"
          href="https://mentoralearn.ir/planningassistant"
        />
      </Helmet>

      <main className="container py-4" style={pageStyle}>
        <div className="d-flex flex-column gap-4">
          <SectionCard>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div className="d-flex justify-content-start align-items-start gap-3 flex-wrap">
                <span style={iconBadgeStyle}>
                  <Wand2 size={22} />
                </span>

                <div>
                  <h1 className="fw-bold mb-1" style={titleStyle}>
                    دستیار برنامه‌ریزی
                  </h1>

                  <p className="text-muted mb-0" style={paragraphStyle}>
                    زمان‌های آزاد و وضعیت درس‌ها را تنظیم کن تا منتورا برنامه
                    هفتگی قابل اجرا، متعادل و شخصی‌سازی‌شده بسازد.
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <StatBadge label="مجموع هفته" value={`${weeklyHours} ساعت`} />
                <StatBadge label="میانگین روزانه" value={`${averageDailyHours} ساعت`} />
              </div>
            </div>

            {error && (
              <div className="mt-3">
                <AlertBox type="danger" message={error} />
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<Clock10Icon size={15} color="#3A8778" />}
              title="ریتم زندگی و نتیجه آزمون"
              description="خواب، کلاس‌های ثابت و آخرین نتیجه آزمون را ثبت کن تا برنامه روی زندگی واقعی تو بنشیند."
            />

            <div className="planner-life-grid">
              <label>
                <span>بیداری</span>
                <input type="time" value={lifeProfile.wakeTime || "07:00"} onChange={(event) => setLifeProfile((value) => ({ ...value, wakeTime: event.target.value }))} />
              </label>
              <label>
                <span>خواب</span>
                <input type="time" value={lifeProfile.sleepTime || "23:00"} onChange={(event) => setLifeProfile((value) => ({ ...value, sleepTime: event.target.value }))} />
              </label>
              <label>
                <span>ریتم انرژی</span>
                <select value={lifeProfile.chronotype || "neutral"} onChange={(event) => setLifeProfile((value) => ({ ...value, chronotype: event.target.value }))}>
                  <option value="morning">صبح‌فعال</option>
                  <option value="neutral">متعادل</option>
                  <option value="night">شب‌فعال</option>
                </select>
              </label>
            </div>

            <div className="planner-commitment-row">
              <input value={commitmentDraft.title} onChange={(event) => setCommitmentDraft((value) => ({ ...value, title: event.target.value }))} placeholder="مثلاً کلاس زبان" />
              <select value={commitmentDraft.day} onChange={(event) => setCommitmentDraft((value) => ({ ...value, day: event.target.value }))}>
                {DAYS.map((day) => <option key={day}>{day}</option>)}
              </select>
              <input type="time" value={commitmentDraft.start} onChange={(event) => setCommitmentDraft((value) => ({ ...value, start: event.target.value }))} />
              <input type="time" value={commitmentDraft.end} onChange={(event) => setCommitmentDraft((value) => ({ ...value, end: event.target.value }))} />
              <button type="button" onClick={addCommitment}><Plus size={14} /> افزودن تعهد</button>
            </div>
            {(lifeProfile.commitments || []).length ? (
              <div className="planner-commitment-list">
                {lifeProfile.commitments.map((item, index) => (
                  <span key={[item.day, item.start, index].join("-")}>
                    {item.title} · {item.day} {item.start}–{item.end}
                    <button type="button" aria-label={"حذف " + item.title} onClick={() => setLifeProfile((value) => ({ ...value, commitments: value.commitments.filter((_, itemIndex) => itemIndex !== index) }))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="planner-result-row">
              <label className="planner-result-exam">
                <span>آزمون</span>
                <select value={examResult.examEventId} onChange={(event) => { setResultSaved(false); setExamResult((value) => ({ ...value, examEventId: event.target.value, course: "", percentage: "", percentages: {} })); }}>
                  <option value="">آزمون برنامه‌ات را انتخاب کن</option>
                  {(examCalendar?.events || []).map((exam) => <option key={exam.id} value={exam.id}>{exam.title} · {exam.persianDate}</option>)}
                </select>
              </label>
              <label>
                <span>درس</span>
                <select value={examResult.course} disabled={!selectedExam} onChange={(event) => setExamResult((value) => ({ ...value, course: event.target.value, percentage: value.percentages[event.target.value] ?? "" }))}>
                  <option value="">انتخاب درس</option>
                  {resultSubjects.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label>
                <span>درصد درس</span>
                <input type="number" min="-33.33" max="100" step="0.01" value={examResult.percentage} disabled={!examResult.course} onChange={(event) => setExamResult((value) => ({ ...value, percentage: event.target.value }))} placeholder="مثلاً ۶۵" />
              </label>
              <button type="button" className="planner-result-add" disabled={!examResult.course || examResult.percentage === ""} onClick={() => {
                const percentage = Number(examResult.percentage);
                if (!Number.isFinite(percentage) || percentage < -33.33 || percentage > 100) { setError("درصد باید بین منفی ۳۳٫۳۳ و ۱۰۰ باشد."); return; }
                setExamResult((value) => ({ ...value, course: "", percentage: "", percentages: { ...value.percentages, [value.course]: value.percentage } }));
                setError("");
              }}>افزودن درصد</button>
              <label>
                <span>نوع نتیجه</span>
                <select value={examResult.metricType} onChange={(event) => setExamResult((value) => ({ ...value, metricType: event.target.value, metricValue: "" }))}>
                  <option value="score">تراز</option>
                  <option value="rank">رتبه</option>
                </select>
              </label>
              <label>
                <span>{examResult.metricType === "score" ? "تراز" : "رتبه"}</span>
                <input type="number" min={examResult.metricType === "score" ? "0" : "1"} max={examResult.metricType === "score" ? "20000" : "100000000"} step={examResult.metricType === "score" ? "0.01" : "1"} value={examResult.metricValue} onChange={(event) => setExamResult((value) => ({ ...value, metricValue: event.target.value }))} placeholder={examResult.metricType === "score" ? "مثلاً ۷۲۰۰" : "مثلاً ۱۵۰۰"} />
              </label>
              <button type="button" className="planner-result-submit" onClick={saveExamResult}>ثبت نتیجه</button>
            </div>
            {Object.keys(examResult.percentages).length ? <div className="planner-result-subjects">
              {Object.entries(examResult.percentages).map(([name, percentage]) => <span key={name}>{name}: {percentage}٪ <button type="button" aria-label={`حذف درصد ${name}`} onClick={() => setExamResult((value) => ({ ...value, percentages: Object.fromEntries(Object.entries(value.percentages).filter(([course]) => course !== name)) }))}><X size={12} /></button></span>)}
            </div> : null}
            {selectedProvider && !(examCalendar?.events || []).length ? <p className="planner-result-history">هنوز آزمونی از این برنامه برگزار نشده است.</p> : null}
            {resultSaved ? <p className="planner-result-feedback" role="status">نتیجه آزمون ذخیره شد.</p> : null}
            {examResults.length ? <p className="planner-result-history">آخرین نتیجه ثبت‌شده: {examResults[0].title} · {Object.keys(examResults[0].percentages || {}).length} درس</p> : null}
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<CalendarDays size={16} color="#3A8778" />}
              title="آزمون بعدی"
              description="برنامه آزمونت را یک‌بار انتخاب کن؛ منتورا هفته‌های بعد هم همان تقویم را در نظر می‌گیرد."
            />

            <div className="planner-exam-providers" role="group" aria-label="انتخاب برنامه آزمون">
              {(examCalendar?.providers || []).map((provider) => (
                <button
                  type="button"
                  key={provider.id}
                  className={selectedProvider === provider.id ? "is-active" : ""}
                  onClick={() => selectExamProvider(provider.id)}
                  disabled={examBusy}
                >
                  {provider.name}
                </button>
              ))}
            </div>

            {selectedProvider === "custom" ? (
              <div className="planner-custom-exam">
                <label>
                  <span>نام آزمون</span>
                  <input
                    value={customExam.title}
                    onChange={(event) => setCustomExam((value) => ({ ...value, title: event.target.value }))}
                    placeholder="مثلاً آزمون جامع مدرسه"
                  />
                </label>
                <label className="planner-custom-exam__date">
                  <span>تاریخ آزمون (شمسی)</span>
                  <div className="planner-jalali-date" role="group" aria-label="تاریخ آزمون شمسی">
                    <select aria-label="سال شمسی" value={customExam.examYear} onChange={(event) => setCustomExam((value) => ({ ...value, examYear: event.target.value, examDay: "" }))}>
                      <option value="">سال</option>
                      {[currentJalaliYear, currentJalaliYear + 1].map((year) => <option key={year} value={year}>{persianDigits(year)}</option>)}
                    </select>
                    <select aria-label="ماه شمسی" value={customExam.examMonth} onChange={(event) => setCustomExam((value) => ({ ...value, examMonth: event.target.value, examDay: "" }))}>
                      <option value="">ماه</option>
                      {JALALI_MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
                    </select>
                    <select aria-label="روز شمسی" value={customExam.examDay} disabled={!customExam.examMonth} onChange={(event) => setCustomExam((value) => ({ ...value, examDay: event.target.value }))}>
                      <option value="">روز</option>
                      {Array.from({ length: Number(customExam.examMonth) <= 6 ? 31 : 30 }, (_, index) => index + 1).map((day) => <option key={day} value={day}>{persianDigits(day)}</option>)}
                    </select>
                  </div>
                </label>
                <label className="planner-custom-exam__topics">
                  <span>مباحث آزمون</span>
                  <input
                    value={customExam.topics}
                    onChange={(event) => setCustomExam((value) => ({ ...value, topics: event.target.value }))}
                    placeholder="مثلاً ژنتیک، مشتق، الکتریسیته"
                  />
                </label>
                <label className="planner-custom-exam__subjects">
                  <span>درس‌های آزمون</span>
                  <input value={customExam.subjects} onChange={(event) => setCustomExam((value) => ({ ...value, subjects: event.target.value }))} placeholder="مثلاً زیست، شیمی، فیزیک" />
                </label>
                <button type="button" onClick={addCustomExam} disabled={examBusy}>
                  <Plus size={15} /> افزودن آزمون
                </button>
              </div>
            ) : null}

            {selectedProvider && !examBusy && !(examCalendar?.upcoming || []).length ? (
              <p className="planner-exam-empty">
                برای این پایه و رشته هنوز تاریخ تأییدشده‌ای ثبت نشده است. می‌توانی «آزمون دیگر» را انتخاب و آزمون خودت را اضافه کنی.
              </p>
            ) : null}

            {(examCalendar?.upcoming || []).length ? (
              <div className="planner-upcoming-exams">
                {(examCalendar.upcoming || []).slice(0, 3).map((exam, index) => (
                  <article key={exam.id} className={index === 0 ? "is-next" : ""}>
                    <div>
                      <span>{index === 0 ? "نزدیک‌ترین آزمون" : "آزمون بعدی"}</span>
                      <strong>{exam.title}</strong>
                      <small>{exam.persianDate}</small>
                      {exam.official && exam.sourceUrl ? (
                        <a href={exam.sourceUrl} target="_blank" rel="noreferrer">
                          منبع رسمی <ExternalLink size={12} />
                        </a>
                      ) : null}
                    </div>
                    <div className="planner-exam-countdown">
                      <strong>{exam.daysUntil}</strong>
                      <span>روز مانده</span>
                    </div>
                    {exam.custom ? (
                      <button type="button" aria-label={`حذف ${exam.title}`} onClick={() => deleteCustomExam(exam.id)}>
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<Clock size={15} color="#3A8778" />}
              title="زمان آزاد برای مطالعه"
              description="برای هر روز تعداد ساعت قابل مطالعه را مشخص کن."
            />

            <div className="row g-3 mb-4">
              {DAYS.map((day) => (
                <div className="col-6 col-md-3" key={day}>
                  <label className="w-100" style={boxStyle}>
                    <span
                      className="d-block mb-2 fw-bold text-secondary"
                      style={{ fontSize: "11px" }}
                    >
                      {day}
                    </span>

                    <input
                      type="number"
                      min="1"
                      max="16"
                      inputMode="numeric"
                      value={dailyHours[day]}
                      onChange={(event) =>
                        updateDailyHour(day, event.target.value)
                      }
                      className="form-control text-center"
                      style={smallInputStyle}
                      aria-label={`ساعت مطالعه ${day}`}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div style={weeklyHoursCardStyle}>
                  <span
                    className="d-block fw-bold"
                    style={{ fontSize: "11px", color: "var(--pd-mint, #3A8778)" }}
                  >
                    مجموع ساعات هفتگی
                  </span>

                  <span
                    className="d-block mt-2"
                    style={{
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "var(--pd-mint-hover, #2F7063)",
                    }}
                  >
                    {weeklyHours} ساعت
                  </span>

                  <span
                    className="d-block mt-1"
                    style={{ color: "var(--pd-mint, #3A8778)", fontSize: "11px" }}
                  >
                    میانگین روزانه: {averageDailyHours} ساعت
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="w-100" style={boxStyle}>
                  <span
                    className="d-flex align-items-center justify-content-start gap-1 mb-2 fw-bold text-muted"
                    style={{ fontSize: "11px" }}
                  >
                    <TimerReset size={12} />
                    مدت هر پارت مطالعاتی
                  </span>

                  <input
                    type="number"
                    min="30"
                    max="180"
                    inputMode="numeric"
                    value={preferredSessionMinutes}
                    onChange={(event) =>
                      setPreferredSessionMinutes(
                        clampNumber(event.target.value, 30, 180, 90),
                      )
                    }
                    className="form-control text-center"
                    style={smallInputStyle}
                    aria-label="مدت هر پارت مطالعاتی"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="w-100" style={boxStyle}>
                  <span
                    className="d-flex align-items-center justify-content-start gap-1 mb-2 fw-bold text-muted"
                    style={{ fontSize: "11px" }}
                  >
                    <Clock10Icon size={12} />
                    استراحت بین پارت‌ها
                  </span>

                  <input
                    type="number"
                    min="5"
                    max="60"
                    inputMode="numeric"
                    value={restMinutes}
                    onChange={(event) =>
                      setRestMinutes(clampNumber(event.target.value, 5, 60, 15))
                    }
                    className="form-control text-center"
                    style={smallInputStyle}
                    aria-label="استراحت بین پارت‌ها"
                  />
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="w-100">
                <span
                  className="d-block mb-2 fw-bold text-muted"
                  style={{ fontSize: "11px" }}
                >
                  محدودیت‌ها و زمان‌های غیرقابل مطالعه
                </span>

                <input
                  value={constraints}
                  onChange={(event) => setConstraints(event.target.value)}
                  placeholder="مثلاً: جمعه سبک‌تر باشد، سه‌شنبه کلاس دارم"
                  className="form-control text-end"
                  style={inputStyle}
                  aria-label="محدودیت‌ها و زمان‌های غیرقابل مطالعه"
                />
              </label>

              <p className="text-muted mt-2 mb-0" style={helperTextStyle}>
                اگر چند محدودیت داری، آن‌ها را با ویرگول جدا کن.
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<ClipboardList size={15} color="#3A8778" />}
              title="وضعیت درس‌ها"
              description="برای هر درس میزان ضعف، اهمیت، علاقه، عقب‌افتادگی و آخرین درصد آزمون را وارد کن."
            />

            {loadingCatalog ? (
              <CatalogLoading />
            ) : !hasCourses ? (
              <EmptyState message="درسی برای این رشته پیدا نشد. لطفاً بعداً دوباره تلاش کن." />
            ) : (
              <div className="d-flex flex-column gap-3">
                {catalog.map((item) => {
                  const values = courses[item.name] || defaultCourseInput();

                  return (
                    <div key={item.name} style={courseInputCardStyle}>
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
                        <div>
                          <h3
                            className="mb-1 fw-bold text-dark"
                            style={{ fontSize: "15px" }}
                          >
                            {item.name}
                          </h3>

                          <span
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            اطلاعات این درس را متناسب با وضعیت فعلی خودت تنظیم کن.
                          </span>
                        </div>

                        <span style={grayPillStyle}>
                          سختی پایه {item.baseDifficulty}/۵
                        </span>
                      </div>

                      <div className="row g-2">
                        <div className="col-6 col-md-4">
                          <NumberField
                            label="میزان ضعف"
                            value={values.student_weakness}
                            min={1}
                            max={5}
                            onChange={(value) =>
                              updateCourse(item.name, "student_weakness", value)
                            }
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="اهمیت برای هدف"
                            value={values.target_importance}
                            min={1}
                            max={5}
                            onChange={(value) =>
                              updateCourse(item.name, "target_importance", value)
                            }
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="علاقه"
                            value={values.interest}
                            min={1}
                            max={5}
                            onChange={(value) =>
                              updateCourse(item.name, "interest", value)
                            }
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="ساعت عقب‌افتادگی"
                            value={values.backlog_hours}
                            min={0}
                            max={100}
                            onChange={(value) =>
                              updateCourse(item.name, "backlog_hours", value)
                            }
                          />
                        </div>

                        <div className="col-6 col-md-4">
                          <NumberField
                            label="آخرین درصد آزمون"
                            value={values.last_test_percent}
                            min={0}
                            max={100}
                            onChange={(value) =>
                              updateCourse(item.name, "last_test_percent", value)
                            }
                          />
                        </div>

                        <div className="col-12 col-md-4">
                          <label className="w-100">
                            <span
                              className="d-block mb-2 fw-bold text-muted"
                              style={{ fontSize: "10px" }}
                            >
                              یادداشت
                            </span>

                            <input
                              value={values.notes}
                              onChange={(event) =>
                                updateCourse(
                                  item.name,
                                  "notes",
                                  event.target.value,
                                )
                              }
                              placeholder="اختیاری"
                              className="form-control text-end"
                              style={smallInputStyle}
                              aria-label={`یادداشت ${item.name}`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || loadingCatalog || !hasCourses}
              className="btn w-100 mt-4 d-inline-flex align-items-center justify-content-center gap-2 fw-bold text-white"
              style={{
                ...primaryButtonStyle,
                background:
                  generating || loadingCatalog || !hasCourses
                    ? "rgba(58, 135, 120, 0.6)"
                    : "#3A8778",
                cursor:
                  generating || loadingCatalog || !hasCourses
                    ? "not-allowed"
                    : "pointer",
                opacity: generating || loadingCatalog || !hasCourses ? 0.85 : 1,
              }}
            >
              {generating ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  در حال تولید برنامه هفتگی ...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  تولید برنامه هفتگی
                </>
              )}
            </button>

            <p className="text-muted text-center mt-2 mb-0" style={helperTextStyle}>
              قبل از تولید برنامه، مطمئن شو ساعات مطالعه و وضعیت درس‌ها واقعی وارد شده‌اند.
            </p>
          </SectionCard>
        </div>
      </main>
    </>
  );
}

const TIME_BANDS = [
  { key: "morning", label: "صبح", hours: "۸–۱۲", start: 8 * 60, end: 12 * 60 },
  { key: "afternoon", label: "ظهر", hours: "۱۲–۱۶", start: 12 * 60, end: 16 * 60 },
  { key: "evening", label: "عصر", hours: "۱۶–۲۰", start: 16 * 60, end: 20 * 60 },
];

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

const toLatinDigits = (value = "") =>
  String(value).replace(/[۰-۹]/g, (digit) => PERSIAN_DIGITS.indexOf(digit));

const taskTimeParts = (duration = "") => {
  const matches = toLatinDigits(duration).match(/(?:[01]\d|2[0-3]):[0-5]\d/g) || [];
  return { startTime: matches[0] || "", endTime: matches[1] || "" };
};

const taskTimeBand = (duration = "") => {
  const hour = Number(toLatinDigits(duration).match(/\b(\d{1,2}):\d{2}/)?.[1]);
  if (!Number.isFinite(hour) || hour < 12) return "morning";
  if (hour < 16) return "afternoon";
  return "evening";
};

const timeToMinutes = (value) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

const minutesToTime = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

export const shiftDurationToBand = (duration, targetBandKey) => {
  const time = taskTimeParts(duration);
  const sourceBand = TIME_BANDS.find((band) => band.key === taskTimeBand(duration));
  const targetBand = TIME_BANDS.find((band) => band.key === targetBandKey);
  if (!time.startTime || !time.endTime || !sourceBand || !targetBand) return duration;

  const start = timeToMinutes(time.startTime);
  const end = timeToMinutes(time.endTime);
  const length = end - start;
  if (length <= 0 || length > targetBand.end - targetBand.start) return duration;

  const shiftedStart = Math.min(
    targetBand.start + Math.max(0, start - sourceBand.start),
    targetBand.end - length,
  );
  return `${minutesToTime(shiftedStart)} تا ${minutesToTime(shiftedStart + length)}`;
};

const taskTone = (task) => {
  const text = `${task.title || ""} ${task.category || ""}`;
  if (/زیست|زمین/.test(text)) return "leaf";
  if (/شیمی/.test(text)) return "ochre";
  if (/فیزیک/.test(text)) return "sky";
  if (/ریاضی|حساب|هندسه|آمار/.test(text)) return "lilac";
  if (/ادبیات|فارسی|عربی|دینی|زبان/.test(text)) return "rose";
  return "stone";
};

const readHours = (value) => {
  const hours = Number(toLatinDigits(value).replace(",", ".").match(/[\d.]+/)?.[0]);
  return Number.isFinite(hours) ? hours : 0;
};

function PlannerWorkspace({ plan, copied, onCopy, onCreateNew }) {
  const [tasks, setTasks] = useState(Array.isArray(plan.tasks) ? plan.tasks : []);
  const [checkin, setCheckin] = useState({ actualMinutes: "", energy: 3, difficulty: 3, note: "" });
  const [checkinMessage, setCheckinMessage] = useState("");
  const dailyPlan = Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [];
  const courses = Array.isArray(plan.courseSummary) ? plan.courseSummary : [];
  const recommendations = Array.isArray(plan.recommendations) ? plan.recommendations : [];
  const weeklyHours = dailyPlan.reduce((sum, day) => sum + readHours(day.totalHours), 0);
  const taskCounts = dailyPlan.map((_, index) => {
    const start = new Date(`${plan.startDate}T12:00:00`);
    start.setDate(start.getDate() + index);
    const iso = start.toISOString().slice(0, 10);
    return tasks.filter((task) => task.scheduledDate === iso).length;
  });
  const maxTaskCount = Math.max(...taskCounts, 1);

  const submitCheckin = async () => {
    const { response, data } = await apiJson("/api/planner/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkin),
    });
    if (!response.ok) {
      setCheckinMessage(data.error || "ثبت گزارش انجام نشد.");
      return;
    }
    if (data.repair?.moved?.length) {
      const latest = await apiJson("/api/planner/plans");
      if (latest.response.ok && latest.data.plans?.[0]?.tasks) setTasks(latest.data.plans[0].tasks);
    }
    setCheckinMessage(data.repair?.message || "گزارش امروز ذخیره شد.");
  };

  return (
    <main className="planner-workspace" dir="rtl">
      <header className="planner-heading">
        <h1>برنامه هفتگی</h1>
        <button type="button" className="planner-new-button" onClick={onCreateNew}>
          <RotateCcw size={16} />
          برنامه‌ی جدید
        </button>
      </header>

      <section className={`planner-overview${plan.examContext?.title ? " has-exam" : ""}`} aria-label="خلاصه برنامه">
        <article className="planner-overview-card planner-overview-card--rhythm">
          <div className="planner-overview-copy">
            <span>ریتم این هفته</span>
            <strong>{weeklyHours ? `${weeklyHours.toLocaleString("fa-IR")} ساعت` : `${tasks.length.toLocaleString("fa-IR")} کار`}</strong>
            <small>{tasks.length.toLocaleString("fa-IR")} کار در هفت روز</small>
          </div>
          <div className="planner-rhythm" aria-label="تراکم کارهای هر روز">
            {taskCounts.map((count, index) => (
              <div className="planner-rhythm-day" key={DAYS[index]}>
                <span
                  className="planner-rhythm-bar"
                  style={{ height: `${18 + (count / maxTaskCount) * 48}px` }}
                />
                <small>{DAYS[index].slice(0, 1)}</small>
              </div>
            ))}
          </div>
        </article>

        {plan.examContext?.title ? (
          <article className="planner-overview-card planner-overview-card--exam">
            <CalendarDays size={18} />
            <div>
              <span>آزمون پیش‌رو</span>
              <strong>{plan.examContext.title}</strong>
              <small>{plan.examContext.persianDate}</small>
            </div>
            <b>{Number(plan.examContext.daysUntil).toLocaleString("fa-IR")} روز</b>
          </article>
        ) : null}

      </section>

      {plan.generationError && (
        <div className="planner-inline-alert" role="status">
          <AlertCircle size={16} />
          برنامه‌ی مطمئن جایگزین استفاده شد؛ سرویس پیشنهاد هوشمند در دسترس نبود.
        </div>
      )}

      <section className="planner-checkin">
        <div>
          <strong>گزارش کوتاه امروز</strong>
          <span>زمان واقعی و حال مطالعه را ثبت کن؛ اگر روز خوب پیش نرفته باشد، ادامه هفته خودکار سبک‌تر می‌شود.</span>
        </div>
        <input type="number" min="0" max="1440" value={checkin.actualMinutes} onChange={(event) => setCheckin((value) => ({ ...value, actualMinutes: event.target.value }))} placeholder="دقیقه واقعی" />
        <select value={checkin.energy} onChange={(event) => setCheckin((value) => ({ ...value, energy: Number(event.target.value) }))} aria-label="انرژی امروز">
          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>انرژی {value}</option>)}
        </select>
        <select value={checkin.difficulty} onChange={(event) => setCheckin((value) => ({ ...value, difficulty: Number(event.target.value) }))} aria-label="سختی امروز">
          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>سختی {value}</option>)}
        </select>
        <button type="button" onClick={submitCheckin}>ثبت گزارش</button>
        {checkinMessage && <small role="status">{checkinMessage}</small>}
      </section>

      <section className="planner-calendar-section">
        <div className="planner-section-heading">
          <div>
            <span>نمای هفتگی</span>
            <h2>برنامه‌ی هفته</h2>
          </div>
          <p>برای ویرایش عنوان یا ساعت روی کارت کلیک کن؛ برای انتقال، آن را بکش.</p>
        </div>

        <div className="planner-legend" aria-label="راهنمای رنگ درس‌ها">
          {courses.slice(0, 6).map((course) => (
            <span key={course.name} data-tone={taskTone({ title: course.name })}>
              <i /> {course.name}
            </span>
          ))}
          {!courses.length && <span data-tone="stone"><i /> کارهای برنامه</span>}
        </div>

        {tasks.length ? (
          <InteractiveWeek plan={plan} onTasksChange={setTasks} />
        ) : (
          <div className="planner-empty-week">هنوز کاری برای این هفته ساخته نشده است.</div>
        )}
      </section>

      {plan.status && (
        <section className="planner-week-note">
          <span>یادداشت هفته</span>
          <p>{plan.status}</p>
        </section>
      )}

      <section className="planner-details">
        <details className="planner-detail-card" open>
          <summary>راهنمای اجرای این هفته <span>{recommendations.length.toLocaleString("fa-IR")} نکته</span></summary>
          <ol>
            {recommendations.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
            {!recommendations.length && <li>بعد از هر جلسه، نتیجه‌ی واقعی را ثبت کن تا برنامه‌ی بعدی دقیق‌تر شود.</li>}
          </ol>
        </details>

        {plan.markdown && (
          <details className="planner-detail-card planner-detail-card--source">
            <summary>نسخه‌ی متنی برنامه <span>برای اشتراک‌گذاری</span></summary>
            <div className="planner-source-actions">
              <button type="button" onClick={onCopy}>
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                {copied ? "کپی شد" : "کپی متن"}
              </button>
            </div>
            <pre>{plan.markdown}</pre>
          </details>
        )}
      </section>
    </main>
  );
}

function InteractiveWeek({ plan, onTasksChange }) {
  const {
    updateTask: updateSharedTask,
    deleteTask: deleteSharedTask,
    loadMe,
    refresh: refreshToday,
  } = useApp();
  const [tasks, setTasks] = useState(plan.tasks || []);
  const [undoStack, setUndoStack] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    onTasksChange(tasks);
  }, [tasks, onTasksChange]);
  const start = new Date(`${plan.startDate}T12:00:00`);
  const days = DAYS.map((name, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      name: plan.dailyPlan?.[index]?.day || DAYS[index],
      iso: date.toISOString().slice(0, 10),
      label: plan.dailyPlan?.[index]?.date || "",
    };
  });

  const saveTask = async (taskId, changes, remember = true) => {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous) return false;
    const next = { ...previous, ...changes };
    setTasks((items) => items.map((item) => item.id === taskId ? next : item));
    try {
      const savedTask = await updateSharedTask(taskId, changes);
      setTasks((items) => items.map((item) => item.id === taskId ? savedTask : item));
      if (remember) setUndoStack((items) => [...items.slice(-9), { taskId, previous }]);
      setMessage("تغییر ذخیره شد.");
      return true;
    } catch (error) {
      setTasks((items) => items.map((item) => item.id === taskId ? previous : item));
      setMessage(error.message);
      return false;
    }
  };

  const saveTaskTime = (task, event) => {
    const inputs = event.currentTarget.closest(".planner-task-time")?.querySelectorAll("input");
    const startTime = inputs?.[0]?.value || "";
    const endTime = inputs?.[1]?.value || "";
    if (!startTime || !endTime) {
      setMessage("زمان شروع و پایان را کامل وارد کن.");
      return;
    }
    if (startTime >= endTime) {
      setMessage("زمان پایان باید بعد از زمان شروع باشد.");
      return;
    }
    const current = taskTimeParts(task.duration);
    if (startTime !== current.startTime || endTime !== current.endTime) {
      saveTask(task.id, { duration: `${startTime} تا ${endTime}` });
    }
  };

  const removeTask = async (taskId) => {
    if (!window.confirm("این کار حذف شود؟")) return;
    const previous = tasks;
    setTasks((items) => items.filter((task) => task.id !== taskId));
    try {
      await deleteSharedTask(taskId);
      setMessage("کار حذف شد.");
    } catch (error) {
      setTasks(previous);
      setMessage(error.message || "حذف کار انجام نشد.");
    }
  };

  const moveTask = (taskId, scheduledDate, bandKey = null) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const position = tasks.filter((task) => task.scheduledDate === scheduledDate && task.id !== taskId).length;
    const duration = bandKey ? shiftDurationToBand(task.duration, bandKey) : task.duration;
    saveTask(taskId, { scheduledDate, position, duration });
  };

  const undo = async () => {
    const action = undoStack[undoStack.length - 1];
    if (!action) return;
    setUndoStack((items) => items.slice(0, -1));
    await saveTask(action.taskId, {
      title: action.previous.title,
      duration: action.previous.duration,
      category: action.previous.category,
      completed: action.previous.completed,
      scheduledDate: action.previous.scheduledDate,
      position: action.previous.position,
    }, false);
  };

  const repair = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { response, data } = await apiJson("/api/planner/repair", { method: "POST" });
      if (!response.ok) throw new Error(data.error || "ترمیم هفته انجام نشد.");
      if (data.plan?.tasks) setTasks(data.plan.tasks);
      await Promise.all([loadMe(), refreshToday({ silent: true })]);
      setMessage(data.message || "برنامه باقی‌مانده هفته اصلاح شد.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const visibleDates = new Set(days.map((day) => day.iso));
  const overflowTasks = tasks.filter((task) => !task.scheduledDate || !visibleDates.has(task.scheduledDate));

  const renderTask = (task) => {
    const time = taskTimeParts(task.duration);
    return (
    <article
      key={task.id}
      className={`planner-task ${task.completed ? "is-completed" : ""}`}
      title={task.reason || task.title}
      data-tone={taskTone(task)}
      draggable
      onDragStart={() => setDraggedId(task.id)}
      onDragEnd={() => setDraggedId(null)}
    >
      <button
        type="button"
        className="planner-task-check"
        aria-label={task.completed ? "برگرداندن به انجام‌نشده" : "علامت‌گذاری به عنوان انجام‌شده"}
        aria-pressed={Boolean(task.completed)}
        onClick={(event) => {
          event.stopPropagation();
          saveTask(task.id, { completed: !task.completed });
        }}
      >
        {task.completed && <Check size={11} />}
      </button>
      <button
        type="button"
        className="planner-task-delete"
        aria-label={`حذف ${task.title}`}
        onClick={(event) => {
          event.stopPropagation();
          removeTask(task.id);
        }}
      >
        <X size={12} />
      </button>
      <GripVertical className="planner-task-grip" size={14} aria-hidden="true" />
      <div
        className="planner-task-title"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        onBlur={(event) => {
          const title = event.currentTarget.textContent.trim();
          if (title && title !== task.title) saveTask(task.id, { title });
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        aria-label={`عنوان کار ${task.title}`}
      >
        {task.title}
      </div>
      {task.reason ? <small className="planner-task-reason">{task.reason}</small> : null}
      <div className="planner-task-time" dir="ltr">
        <input type="time" defaultValue={time.startTime} onBlur={(event) => saveTaskTime(task, event)} aria-label={`زمان شروع ${task.title}`} />
        <span>تا</span>
        <input type="time" defaultValue={time.endTime} onBlur={(event) => saveTaskTime(task, event)} aria-label={`زمان پایان ${task.title}`} />
      </div>
    </article>
    );
  };

  return (
    <div className="planner-board">
      <div className="planner-board-tools">
        <div className="planner-board-actions">
          <button type="button" onClick={undo} disabled={!undoStack.length}>
            <Undo2 size={15} /> بازگردانی
          </button>
          <button type="button" className="is-primary" onClick={repair} disabled={busy}>
            <Wrench size={15} /> {busy ? "در حال بازچینی..." : "بازچینی ادامه‌ی هفته"}
          </button>
        </div>
        {message && <span className="planner-save-message" role="status">{message}</span>}
      </div>

      <div className="planner-mobile-days" role="tablist" aria-label="روزهای هفته">
        {days.map((day, index) => (
          <button
            type="button"
            key={day.iso}
            role="tab"
            aria-selected={activeDay === index}
            className={activeDay === index ? "is-active" : ""}
            onClick={() => setActiveDay(index)}
          >
            {day.name}
          </button>
        ))}
      </div>

      <div className="planner-board-layout">
        <aside
          className="planner-overflow"
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (draggedId) moveTask(draggedId, null);
            setDraggedId(null);
          }}
        >
          <div className="planner-overflow-heading">
            <span>زمان‌بندی‌نشده</span>
            <strong>{overflowTasks.length.toLocaleString("fa-IR")} کار</strong>
          </div>
          <p>کارت را اینجا رها کن تا از برنامه روزها خارج شود.</p>
          <div className="planner-overflow-list">
            {overflowTasks.map(renderTask)}
            {!overflowTasks.length && (
              <div className="planner-overflow-empty">
                <CheckCircle2 size={20} />
                کاری در انتظار زمان‌بندی نیست.
              </div>
            )}
          </div>
        </aside>

        <div className="planner-calendar-scroll">
          <div className="planner-calendar-grid">
            <div className="planner-grid-corner">زمان</div>
            {days.map((day, index) => (
              <header key={day.iso} className={activeDay === index ? "is-active" : ""}>
                <strong>{day.name}</strong>
                <span>{day.label}</span>
              </header>
            ))}

            {TIME_BANDS.map((band) => (
              <React.Fragment key={band.key}>
                <div className="planner-time-label">
                  <strong>{band.label}</strong>
                  <span>{band.hours}</span>
                </div>
                {days.map((day, index) => {
                  const bandTasks = tasks
                    .filter((task) => task.scheduledDate === day.iso && taskTimeBand(task.duration) === band.key)
                    .sort((a, b) => (a.position || 0) - (b.position || 0));
                  return (
                    <div
                      key={`${day.iso}-${band.key}`}
                      className={`planner-time-cell ${activeDay === index ? "is-active" : ""}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedId) moveTask(draggedId, day.iso, band.key);
                        setDraggedId(null);
                      }}
                    >
                      {bandTasks.map(renderTask)}
                      {!bandTasks.length && <span className="planner-drop-hint">رها کن</span>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <section className="card border-0 shadow-sm" style={cardStyle}>
      <div className="card-body p-4 text-end">{children}</div>
    </section>
  );
}

function SectionHeader({ icon, title, description }) {
  return (
    <div className="mb-4">
      <h2
        className="fw-bold d-flex align-items-center justify-content-start gap-2 mb-1"
        style={sectionTitleStyle}
      >
        {icon}
        {title}
      </h2>

      {description && (
        <p className="text-muted mb-0" style={helperTextStyle}>
          {description}
        </p>
      )}
    </div>
  );
}

function AlertBox({ type = "danger", message }) {
  const isWarning = type === "warning";

  return (
    <div
      className="d-flex align-items-start gap-2"
      style={{
        border: isWarning ? "1px solid #FCD34D" : "1px solid #FCA5A5",
        background: isWarning ? "#FEF3C7" : "#FEF2F2",
        color: isWarning ? "#92400E" : "#991B1B",
        borderRadius: "14px",
        padding: "12px 14px",
        fontSize: "12px",
        lineHeight: "1.8",
      }}
    >
      <AlertCircle size={16} style={{ marginTop: 3, flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center text-muted" style={emptyStateStyle}>
      {message}
    </div>
  );
}

function CatalogLoading() {
  return (
    <div
      className="text-center py-5 d-flex flex-column align-items-center justify-content-center"
      style={catalogLoadingStyle}
    >
      <div
        className="spinner-border text-primary mb-3"
        role="status"
        style={{ width: "2rem", height: "2rem" }}
      />

      <div className="text-secondary fw-bold" style={{ fontSize: "13px" }}>
        در حال دریافت لیست درس‌های متناسب با رشته شما...
      </div>

      <div className="text-muted mt-2" style={{ fontSize: "11px" }}>
        چند لحظه صبر کن؛ داده‌ها در حال آماده‌سازی هستند.
      </div>
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div style={statBadgeStyle}>
      <span className="d-block" style={{ fontSize: "10px", color: "var(--pd-text-muted, #55625F)" }}>
        {label}
      </span>

      <strong style={{ fontSize: "13px", color: "var(--pd-text-main, #121A18)" }}>{value}</strong>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="w-100">
      <span
        className="d-block mb-2 fw-bold text-muted"
        style={{ fontSize: "10px" }}
      >
        {label}
      </span>

      <input
        type="number"
        min={min}
        max={max}
        inputMode="numeric"
        value={value}
        onChange={(event) =>
          onChange(clampNumber(event.target.value, min, max, value))
        }
        className="form-control text-center"
        style={smallInputStyle}
        aria-label={label}
      />
    </label>
  );
}

const pageStyle = {
  maxWidth: "1200px",
  direction: "rtl",
  fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
};

const cardStyle = {
  borderRadius: "18px",
  overflow: "hidden",
  background: "#FFFFFF",
  border: "1px solid #E1E5E1",
  boxShadow: "0 10px 30px rgba(18, 26, 24, 0.04)",
};

const titleStyle = {
  fontSize: "18px",
  letterSpacing: "-0.02em",
  color: "#121A18",
};

const sectionTitleStyle = {
  fontSize: "14px",
  letterSpacing: "-0.01em",
  color: "#121A18",
};

const paragraphStyle = {
  fontSize: "13px",
  lineHeight: "1.85",
  color: "#55625F",
};

const helperTextStyle = {
  fontSize: "11px",
  lineHeight: "1.85",
  color: "#778582",
};

const inputStyle = {
  borderRadius: "12px",
  background: "#FAFBF9",
  fontSize: "13px",
  fontWeight: 700,
  border: "1.5px solid #E1E5E1",
  minHeight: "44px",
  color: "#121A18",
};

const smallInputStyle = {
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 700,
  border: "1.5px solid #E1E5E1",
  minHeight: "40px",
  background: "#FAFBF9",
  color: "#121A18",
};

const boxStyle = {
  border: "1px solid #E1E5E1",
  background: "#FAFBF9",
  borderRadius: "14px",
  padding: "12px",
  transition: "all 0.2s ease",
};

const iconBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(58, 135, 120, 0.12)",
  color: "#3A8778",
  borderRadius: "12px",
  padding: "12px",
  flexShrink: 0,
};

const weeklyHoursCardStyle = {
  background: "linear-gradient(135deg, rgba(58, 135, 120, 0.1) 0%, rgba(58, 135, 120, 0.03) 100%)",
  border: "1px solid rgba(78, 154, 137, 0.25)",
  borderRadius: "16px",
  padding: "14px",
  height: "100%",
};

const primaryButtonStyle = {
  borderRadius: "12px",
  border: "none",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: 700,
  background: "#3A8778",
  boxShadow: "0 4px 14px rgba(58, 135, 120, 0.25)",
  transition: "all 0.2s ease",
};

const emptyStateStyle = {
  border: "1px dashed #E1E5E1",
  background: "#FAFBF9",
  borderRadius: "16px",
  padding: "20px",
  fontSize: "12px",
  color: "#55625F",
};

const catalogLoadingStyle = {
  border: "1px dashed rgba(58, 135, 120, 0.3)",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, rgba(58, 135, 120, 0.05), rgba(245, 246, 243, 0.7))",
};

const courseInputCardStyle = {
  border: "1px solid #E1E5E1",
  background: "#FAFBF9",
  borderRadius: "16px",
  padding: "16px",
};

const grayPillStyle = {
  background: "#E7F1EE",
  color: "#3A8778",
  borderRadius: "999px",
  padding: "6px 12px",
  fontSize: "11px",
  fontWeight: 700,
};

const statBadgeStyle = {
  border: "1px solid #E1E5E1",
  background: "#FFFFFF",
  borderRadius: "14px",
  padding: "9px 12px",
  minWidth: "112px",
};
