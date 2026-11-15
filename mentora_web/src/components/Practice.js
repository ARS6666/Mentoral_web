import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Info,
  Lock,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiJson, resolveMediaUrl } from "../utils/api";
import { Helmet } from "react-helmet-async";

const ALL_TOPICS = "همه مباحث";
const MAJORS = ["تجربی", "ریاضی"];
const FALLBACK_COUNTS = [5, 10, 15, 20, 25, 30];

const PRACTICE_SESSION_STORAGE_KEY = "mentora_practice_session_v1";
const PRACTICE_SESSION_VERSION = 4;

const SAVED_PHASES = ["running", "results"];

const DEFAULT_FEATURES = {
  topics: false,
  explanations: false,
  difficulty: false,
};

const OPTION_LABELS = ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"];
const KEY_LABELS = ["۱", "۲", "۳", "۴"];

const toFa = (value, maximumFractionDigits = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "۰";

  return number.toLocaleString("fa-IR", {
    maximumFractionDigits,
  });
};

const storageAvailable = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

const clampQuestionIndex = (value, maxIndex) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.min(Math.max(Math.trunc(number), 0), Math.max(maxIndex, 0));
};

const normalizeSavedAnswers = (answers, length) => {
  const source = Array.isArray(answers) ? answers : [];

  return Array.from({ length }, (_, index) => {
    const answer = source[index];

    return Number.isInteger(answer) ? answer : null;
  });
};

const loadPracticeSession = () => {
  if (!storageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(PRACTICE_SESSION_STORAGE_KEY);

    if (!raw) return null;

    const saved = JSON.parse(raw);

    const savedQuestions = Array.isArray(saved?.questions)
      ? saved.questions
      : [];

    const savedPhase = SAVED_PHASES.includes(saved?.phase) ? saved.phase : "";

    if (
      saved?.version !== PRACTICE_SESSION_VERSION ||
      !savedQuestions.length ||
      !savedPhase
    ) {
      window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);

      return null;
    }

    return {
      activeTab: saved.activeTab === "mistakes" ? "mistakes" : "practice",

      major: MAJORS.includes(saved.major) ? saved.major : "تجربی",

      lesson: saved.lesson || "",
      grade: saved.grade || "",
      topic: saved.topic || ALL_TOPICS,

      questionCount: Number(saved.questionCount) || savedQuestions.length,

      phase: savedPhase,

      questions: savedQuestions,

      answers: normalizeSavedAnswers(saved.answers, savedQuestions.length),

      currentIndex: clampQuestionIndex(
        saved.currentIndex,
        savedQuestions.length - 1,
      ),

      attemptId: Number(saved.attemptId) || null,

      startedAt: saved.startedAt || null,

      serverResult: saved.serverResult || null,
    };
  } catch {
    try {
      window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);
    } catch {}

    return null;
  }
};

const savePracticeSession = (session) => {
  if (!storageAvailable()) return;

  try {
    window.localStorage.setItem(
      PRACTICE_SESSION_STORAGE_KEY,
      JSON.stringify({
        version: PRACTICE_SESSION_VERSION,
        savedAt: new Date().toISOString(),
        ...session,
      }),
    );
  } catch {}
};

const clearPracticeSession = () => {
  if (!storageAvailable()) return;

  try {
    window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);
  } catch {}
};

function BlockMarkdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children: paragraphChildren }) => (
          <p className="practice-md-paragraph">{paragraphChildren}</p>
        ),
        ul: ({ children }) => <ul className="practice-md-list">{children}</ul>,
        ol: ({ children }) => <ol className="practice-md-list">{children}</ol>,
      }}
    >
      {children || ""}
    </ReactMarkdown>
  );
}

export default function Practice() {
  const navigate = useNavigate();
  const { profile, setBridgeQuestion } = useApp();

  const initialMajor = MAJORS.includes(profile?.major)
    ? profile.major
    : "تجربی";

  const [activeTab, setActiveTab] = useState("practice");

  const [major, setMajor] = useState(initialMajor);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState("");
  const [grade, setGrade] = useState("");

  const [topics, setTopics] = useState([ALL_TOPICS]);
  const [topic, setTopic] = useState(ALL_TOPICS);

  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  const [questionCounts, setQuestionCounts] = useState(FALLBACK_COUNTS);

  const [questionCount, setQuestionCount] = useState(10);

  const [availableCount, setAvailableCount] = useState(0);
  const [dueMistakes, setDueMistakes] = useState(0);
  const [mistakes, setMistakes] = useState([]);

  const [filtersLoading, setFiltersLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [error, setError] = useState("");

  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [attemptId, setAttemptId] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [serverResult, setServerResult] = useState(null);

  const [sessionLoaded, setSessionLoaded] = useState(false);

  const [showDamage, setShowDamage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [imageError, setImageError] = useState(false);

  const lessonConfig = useMemo(
    () => lessons.find((item) => item.name === lesson),
    [lessons, lesson],
  );

  const gradeOptions = lessonConfig?.grades || [];

  const currentQuestion = questions[currentIndex];

  const currentAnswer = answers[currentIndex];

  const hasAnswered = currentAnswer !== null && currentAnswer !== undefined;

  const currentIsCorrect = currentAnswer === currentQuestion?.correctAnswer;

  const answeredCount = useMemo(
    () =>
      answers.filter((answer) => answer !== null && answer !== undefined)
        .length,
    [answers],
  );

  const progressPercent = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  const calculatedResult = useMemo(() => {
    const total = questions.length;

    const correct = questions.reduce(
      (sum, question, index) =>
        sum + (answers[index] === question.correctAnswer ? 1 : 0),
      0,
    );

    const wrong = questions.reduce((sum, question, index) => {
      const answer = answers[index];

      return (
        sum +
        (answer !== null &&
        answer !== undefined &&
        answer !== question.correctAnswer
          ? 1
          : 0)
      );
    }, 0);

    const unsolved = Math.max(0, total - correct - wrong);

    const rawPercent = total ? (correct / total) * 100 : 0;

    const negativePercent = total
      ? ((correct * 3 - wrong) / (total * 3)) * 100
      : 0;

    return {
      total,
      correct,
      wrong,
      unsolved,
      rawPercent,
      negativePercent,
    };
  }, [answers, questions]);

  const result = serverResult || calculatedResult;

  const fireCorrectConfetti = useCallback(() => {
    setShowCelebration(false);

    window.setTimeout(() => {
      setShowCelebration(true);
    }, 0);

    window.setTimeout(() => {
      setShowCelebration(false);
    }, 700);
  }, []);

  const triggerWrongFlash = useCallback(() => {
    setShowDamage(true);

    window.setTimeout(() => {
      setShowDamage(false);
    }, 420);
  }, []);

  const resetRun = () => {
    clearPracticeSession();

    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setAttemptId(null);
    setStartedAt(null);
    setServerResult(null);

    setShowCelebration(false);
    setShowDamage(false);
    setImageError(false);
  };

  useEffect(() => {
    const savedSession = loadPracticeSession();

    if (savedSession) {
      setActiveTab(savedSession.activeTab);
      setMajor(savedSession.major);
      setLesson(savedSession.lesson);
      setGrade(savedSession.grade);
      setTopic(savedSession.topic);
      setQuestionCount(savedSession.questionCount);

      setQuestions(savedSession.questions);
      setAnswers(savedSession.answers);

      setCurrentIndex(savedSession.currentIndex);

      setPhase(savedSession.phase);

      setAttemptId(savedSession.attemptId);
      setStartedAt(savedSession.startedAt);
      setServerResult(savedSession.serverResult);
    }

    setSessionLoaded(true);
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;

    if (SAVED_PHASES.includes(phase) && questions.length) {
      savePracticeSession({
        activeTab,
        major,
        lesson,
        grade,
        topic,
        questionCount,
        phase,
        questions,
        answers: normalizeSavedAnswers(answers, questions.length),
        currentIndex: clampQuestionIndex(currentIndex, questions.length - 1),
        attemptId,
        startedAt,
        serverResult,
      });

      return;
    }

    clearPracticeSession();
  }, [
    activeTab,
    answers,
    attemptId,
    currentIndex,
    grade,
    lesson,
    major,
    phase,
    questionCount,
    questions,
    sessionLoaded,
    serverResult,
    startedAt,
    topic,
  ]);

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams({
      major,
    });

    if (lesson) params.set("lesson", lesson);
    if (grade) params.set("grade", grade);
    if (topic) params.set("topic", topic);

    const loadFilters = async () => {
      setFiltersLoading(true);
      setError("");

      try {
        const { response, data } = await apiJson(
          `/api/practice/filters?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            data.error || "دریافت تنظیمات تمرین با مشکل مواجه شد.",
          );
        }

        if (!active) return;

        const nextLessons = Array.isArray(data.lessons) ? data.lessons : [];

        const nextTopics =
          Array.isArray(data.topics) && data.topics.length
            ? data.topics
            : [ALL_TOPICS];

        const nextCounts =
          Array.isArray(data.questionCounts) && data.questionCounts.length
            ? data.questionCounts
            : FALLBACK_COUNTS;

        setLessons(nextLessons);
        setTopics(nextTopics);

        setFeatures({
          ...DEFAULT_FEATURES,
          ...(data.features || {}),
        });

        setQuestionCounts(nextCounts);

        setAvailableCount(Number(data.availableCount) || 0);

        setDueMistakes(Number(data.dueMistakes) || 0);

        if (data.selectedLesson && data.selectedLesson !== lesson) {
          setLesson(data.selectedLesson);
        }

        if (data.selectedGrade && data.selectedGrade !== grade) {
          setGrade(data.selectedGrade);
        }

        if (data.selectedTopic && data.selectedTopic !== topic) {
          setTopic(data.selectedTopic);
        } else if (!nextTopics.includes(topic)) {
          setTopic(nextTopics[0]);
        }

        if (!nextCounts.includes(questionCount)) {
          setQuestionCount(nextCounts[1] || nextCounts[0] || 10);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "ارتباط با سرور تمرین برقرار نشد.");
        }
      } finally {
        if (active) {
          setFiltersLoading(false);
        }
      }
    };

    loadFilters();

    return () => {
      active = false;
    };
  }, [major, lesson, grade, topic, questionCount]);

  useEffect(() => {
    if (activeTab !== "mistakes") return;

    let active = true;

    apiJson("/api/practice/mistakes").then(({ response, data }) => {
      if (!active || !response.ok) return;

      setMistakes(Array.isArray(data.mistakes) ? data.mistakes : []);

      setDueMistakes(Number(data.dueCount) || 0);
    });

    return () => {
      active = false;
    };
  }, [activeTab]);

  useEffect(() => {
    setError("");
  }, [activeTab]);

  useEffect(() => {
    setImageError(false);

    if (phase !== "running") return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentIndex, phase]);

  const updateMajor = (value) => {
    setMajor(value);
    setLesson("");
    setGrade("");
    setTopic(ALL_TOPICS);
    resetRun();
  };

  const updateLesson = (value) => {
    setLesson(value);
    setGrade("");
    setTopic(ALL_TOPICS);
    resetRun();
  };

  const updateGrade = (value) => {
    setGrade(value);
    setTopic(ALL_TOPICS);
    resetRun();
  };

  const startPractice = async () => {
    setStarting(true);
    setError("");

    try {
      const { response, data } = await apiJson("/api/practice/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          major,
          lesson,
          grade,
          topic,
          count: questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(data.error || "شروع تمرین با مشکل مواجه شد.");
      }

      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];

      if (!nextQuestions.length) {
        throw new Error("برای این انتخاب هنوز سوالی وجود ندارد.");
      }

      setQuestions(nextQuestions);

      setAnswers(Array(nextQuestions.length).fill(null));

      setCurrentIndex(0);

      setAttemptId(Number(data.attemptId) || null);

      setStartedAt(data.startedAt || new Date().toISOString());

      setServerResult(null);
      setImageError(false);
      setPhase("running");
    } catch (err) {
      setError(err.message || "شروع تمرین با مشکل مواجه شد.");
    } finally {
      setStarting(false);
    }
  };

  const answerQuestion = useCallback(
    (optionIndex) => {
      if (
        !currentQuestion ||
        hasAnswered ||
        optionIndex < 0 ||
        optionIndex > 3
      ) {
        return;
      }

      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = optionIndex;
        return next;
      });

      if (optionIndex === currentQuestion.correctAnswer) {
        fireCorrectConfetti();
      } else {
        triggerWrongFlash();
      }
    },
    [
      currentQuestion,
      hasAnswered,
      currentIndex,
      fireCorrectConfetti,
      triggerWrongFlash,
    ],
  );

  const completeAttempt = useCallback(async () => {
    if (!attemptId || completing) return;

    setCompleting(true);
    setError("");

    try {
      const durationSeconds = startedAt
        ? Math.max(
            0,
            Math.round((Date.now() - new Date(startedAt).getTime()) / 1000),
          )
        : 0;

      const { response, data } = await apiJson(
        `/api/practice/attempts/${attemptId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
            durationSeconds,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(data.error || "ثبت نتیجه تمرین با مشکل مواجه شد.");
      }

      setServerResult(data.result || null);

      setDueMistakes(Number(data.dueMistakes) || 0);

      setPhase("results");
    } catch (err) {
      setError(err.message || "ثبت نتیجه تمرین با مشکل مواجه شد.");
    } finally {
      setCompleting(false);
    }
  }, [attemptId, completing, startedAt, answers]);
  const goNext = useCallback(() => {
    if (!hasAnswered && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    completeAttempt();
  }, [hasAnswered, currentIndex, questions.length, completeAttempt]);

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  useEffect(() => {
    if (phase !== "running" || !currentQuestion) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const keyMap = {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        "۱": 0,
        "۲": 1,
        "۳": 2,
        "۴": 3,
      };

      if (Object.prototype.hasOwnProperty.call(keyMap, event.key)) {
        answerQuestion(keyMap[event.key]);
      }

      if (event.key === "ArrowLeft" && hasAnswered) {
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, currentQuestion, hasAnswered, answerQuestion, goNext]);

  const startMistakeReview = async () => {
    setStarting(true);
    setError("");

    try {
      const { response, data } = await apiJson(
        "/api/practice/mistakes/review",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(data.error || "مرور اشتباهات آماده نشد.");
      }

      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];

      if (!nextQuestions.length) {
        throw new Error("در حال حاضر سوالی برای مرور وجود ندارد.");
      }

      setQuestions(nextQuestions);

      setAnswers(Array(nextQuestions.length).fill(null));

      setAttemptId(Number(data.attemptId) || null);

      setStartedAt(data.startedAt || new Date().toISOString());

      setServerResult(null);
      setCurrentIndex(0);
      setActiveTab("practice");
      setImageError(false);
      setPhase("running");
    } catch (err) {
      setError(err.message || "مرور اشتباهات آماده نشد.");
    } finally {
      setStarting(false);
    }
  };

  const askTutor = (question) => {
    if (!question) return;

    const questionLabel = `سوال ${currentIndex + 1}`;

    setBridgeQuestion(
      `این سوال را مرحله‌به‌مرحله و با توضیح کامل برای من حل کن: "${questionLabel}"`,
    );

    navigate("/tutor");
  };

  const optionClassName = (index) => {
    if (!hasAnswered) {
      return "practice-option";
    }

    if (index === currentQuestion?.correctAnswer) {
      return "practice-option is-correct";
    }

    if (index === currentAnswer) {
      return "practice-option is-wrong";
    }

    return "practice-option is-disabled";
  };

  const handleTabChange = (tab) => {
    if (tab === "exam") {
      setActiveTab("exam");
      return;
    }

    setActiveTab(tab);
  };

  return (
    <>
      <Helmet>
        <title>تمرین و خودآزمایی هوشمند | منتورا</title>

        <meta
          name="description"
          content="تولید خودکار آزمون‌های مبحثی، پاسخ تشریحی و تحلیل نقاط ضعف و قوت در یادگیری با منتورا."
        />

        <link rel="canonical" href="https://mentoralearn.ir/practice" />
      </Helmet>

      <div className="practice-page">
        {showDamage && (
          <div className="practice-damage-flash" aria-hidden="true" />
        )}

        {showCelebration && (
          <div className="practice-success-flash" aria-hidden="true">
            <div className="success-particle success-particle-1" />
            <div className="success-particle success-particle-2" />
            <div className="success-particle success-particle-3" />
            <div className="success-particle success-particle-4" />
            <div className="success-particle success-particle-5" />
          </div>
        )}

        <style>{`
          .practice-page {
            --practice-primary: var(--primary, #2e7f81);
            --practice-primary-dark: var(--primary-dark, #235f61);
            --practice-primary-soft: var(--primary-tint, #eaf6f5);
            --practice-success: var(--success, #2f8a57);
            --practice-success-soft: var(--success-tint, #edf8f1);
            --practice-danger: var(--danger, #d64545);
            --practice-danger-soft: var(--danger-tint, #fff0f0);
            --practice-warning: var(--warning, #c68a19);
            --practice-warning-soft: var(--warning-tint, #fff8e7);
            --practice-text: var(--text-primary, #172126);
            --practice-muted: var(--text-muted, #7a858a);
            --practice-border: #e6ebed;
            --practice-surface: #ffffff;
            --practice-bg: #f7f9fa;

            width: 100%;
            min-height: calc(100vh - 40px);
            direction: rtl;
            text-align: right;
            padding: 26px 18px 48px;
            color: var(--practice-text);
            background:
              radial-gradient(
                circle at 88% 0%,
                rgba(46, 127, 129, 0.055),
                transparent 27%
              );
          }

          .practice-container {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
          }

          .practice-damage-flash {
            position: fixed;
            inset: 0;
            z-index: 9998;
            pointer-events: none;
            background: rgba(214, 69, 69, 0.16);
            animation: practiceDamage 420ms ease-out;
          }

          .practice-success-flash {
            position: fixed;
            inset: 0;
            z-index: 9998;
            pointer-events: none;
            overflow: hidden;
            background:
              radial-gradient(
                circle at 20% 35%,
                rgba(47, 138, 87, 0.2),
                transparent 18%
              ),
              radial-gradient(
                circle at 78% 42%,
                rgba(46, 127, 129, 0.18),
                transparent 16%
              ),
              radial-gradient(
                circle at 50% 25%,
                rgba(95, 240, 192, 0.2),
                transparent 14%
              );
            animation: practiceSuccess 700ms ease-out;
          }

          .success-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            opacity: 0;
            animation: particleFly 650ms ease-out;
          }

          .success-particle-1 {
            right: 28%;
            top: 38%;
            color: #2f8a57;
          }

          .success-particle-2 {
            right: 65%;
            top: 34%;
            color: #2e7f81;
            animation-delay: 30ms;
          }

          .success-particle-3 {
            right: 45%;
            top: 28%;
            color: #7a5af8;
            animation-delay: 70ms;
          }

          .success-particle-4 {
            right: 55%;
            top: 45%;
            color: #d99a26;
            animation-delay: 100ms;
          }

          .success-particle-5 {
            right: 35%;
            top: 50%;
            color: #2f8a57;
            animation-delay: 120ms;
          }

          @keyframes practiceDamage {
            0% {
              opacity: 0;
            }

            18% {
              opacity: 1;
            }

            100% {
              opacity: 0;
            }
          }

          @keyframes practiceSuccess {
            0% {
              opacity: 0;
              transform: scale(0.985);
            }

            20% {
              opacity: 1;
              transform: scale(1);
            }

            100% {
              opacity: 0;
              transform: scale(1.02);
            }
          }

          @keyframes particleFly {
            0% {
              opacity: 0;
              transform: translate3d(0, 0, 0) scale(0.5);
            }

            20% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform: translate3d(
                var(--particle-x, 30px),
                var(--particle-y, -60px),
                0
              ) scale(1);
            }
          }

          .practice-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 24px;
          }

          .practice-header-copy {
            min-width: 0;
          }

          .practice-eyebrow {
            display: flex;
            align-items: center;
            gap: 7px;
            color: var(--practice-primary);
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 7px;
          }

          .practice-header h1 {
            margin: 0;
            font-size: clamp(25px, 3vw, 32px);
            line-height: 1.35;
            font-weight: 900;
            letter-spacing: -0.6px;
          }

          .practice-header-subtitle {
            margin: 7px 0 0;
            color: var(--practice-muted);
            font-size: 12px;
            line-height: 1.8;
          }

          .practice-tabs {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 5px;
            background: rgba(255,255,255,0.88);
            border: 1px solid var(--practice-border);
            border-radius: 16px;
            box-shadow: 0 7px 24px rgba(26, 45, 51, 0.055);
            flex-shrink: 0;
          }

          .practice-tab {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            min-height: 38px;
            padding: 0 13px;
            border: 0;
            border-radius: 11px;
            background: transparent;
            color: var(--practice-muted);
            font-family: inherit;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: 180ms ease;
            white-space: nowrap;
          }

          .practice-tab:hover {
            background: #f5f8f8;
            color: var(--practice-text);
          }

          .practice-tab.is-active {
            color: #fff;
            background: linear-gradient(
              135deg,
              var(--practice-primary),
              var(--practice-primary-dark)
            );
            box-shadow: 0 6px 16px rgba(46, 127, 129, 0.2);
          }

          .practice-tab-badge {
            min-width: 20px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            border-radius: 999px;
            background: rgba(255,255,255,0.18);
            font-size: 10px;
          }

          .practice-module {
            position: relative;
            overflow: hidden;
            background: var(--practice-surface);
            border: 1px solid var(--practice-border);
            border-radius: 20px;
            box-shadow:
              0 12px 35px rgba(25, 45, 51, 0.055),
              0 2px 5px rgba(25, 45, 51, 0.025);
          }

          .practice-module-head {
            min-height: 64px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            border-bottom: 1px solid var(--practice-border);
            background:
              linear-gradient(
                180deg,
                rgba(249,251,251,0.85),
                rgba(255,255,255,0.9)
              );
          }

          .practice-module-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 900;
            min-width: 0;
          }

          .practice-module-title svg {
            flex-shrink: 0;
          }

          .practice-module-body {
            padding: 22px;
          }

          .practice-module-foot {
            padding: 14px 18px;
            border-top: 1px solid var(--practice-border);
            background: #fbfcfc;
          }

          .practice-alert {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-bottom: 17px;
            padding: 12px 13px;
            border: 1px solid rgba(214,69,69,0.15);
            border-radius: 13px;
            color: var(--practice-danger);
            background: var(--practice-danger-soft);
            font-size: 12px;
            line-height: 1.8;
          }

          .practice-field-label {
            display: block;
            margin-bottom: 8px;
            color: #677277;
            font-size: 11px;
            font-weight: 900;
          }

          .practice-select {
            width: 100%;
            height: 46px;
            padding: 0 13px;
            border: 1px solid var(--practice-border);
            border-radius: 12px;
            background: #fff;
            color: var(--practice-text);
            outline: none;
            font-family: inherit;
            font-size: 12px;
            cursor: pointer;
            transition: 180ms ease;
          }

          .practice-select:hover {
            border-color: #ccd8da;
          }

          .practice-select:focus {
            border-color: var(--practice-primary);
            box-shadow: 0 0 0 4px rgba(46,127,129,0.09);
          }

          .practice-select:disabled {
            opacity: 0.65;
            cursor: wait;
            background: #f7f8f8;
          }

          .practice-major-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .practice-major {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-width: 102px;
            height: 42px;
            padding: 0 15px;
            border: 1px solid var(--practice-border);
            border-radius: 12px;
            background: #fff;
            color: #697579;
            font-family: inherit;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: 180ms ease;
          }

          .practice-major:hover {
            border-color: rgba(46,127,129,0.35);
            color: var(--practice-primary);
            transform: translateY(-1px);
          }

          .practice-major.is-active {
            color: var(--practice-primary-dark);
            border-color: rgba(46,127,129,0.25);
            background: var(--practice-primary-soft);
            box-shadow: 0 5px 15px rgba(46,127,129,0.08);
          }

          .practice-primary-button {
            min-height: 48px;
            border: 0;
            border-radius: 13px;
            padding: 0 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(
              135deg,
              var(--practice-primary),
              var(--practice-primary-dark)
            );
            color: #fff;
            font-family: inherit;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 9px 22px rgba(46,127,129,0.17);
            transition: 180ms ease;
          }

          .practice-primary-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 12px 26px rgba(46,127,129,0.22);
          }

          .practice-primary-button:active:not(:disabled) {
            transform: translateY(0);
          }

          .practice-primary-button:disabled {
            opacity: 0.52;
            cursor: not-allowed;
            box-shadow: none;
          }

          .practice-outline-button,
          .practice-secondary-button {
            min-height: 42px;
            padding: 0 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            border-radius: 11px;
            font-family: inherit;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: 180ms ease;
          }

          .practice-outline-button {
            border: 1px solid rgba(46,127,129,0.24);
            background: #fff;
            color: var(--practice-primary-dark);
          }

          .practice-outline-button:hover:not(:disabled) {
            background: var(--practice-primary-soft);
            border-color: rgba(46,127,129,0.35);
          }

          .practice-secondary-button {
            border: 1px solid #e0e5e7;
            background: #f5f7f8;
            color: #59666a;
          }

          .practice-secondary-button:hover:not(:disabled) {
            background: #eef2f3;
          }

          .practice-outline-button:disabled,
          .practice-secondary-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .practice-summary-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .practice-summary-tile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 13px;
            border: 1px solid transparent;
            border-radius: 15px;
          }

          .practice-summary-icon {
            width: 37px;
            height: 37px;
            flex: 0 0 37px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
          }

          .practice-summary-content {
            min-width: 0;
            flex: 1;
          }

          .practice-summary-label {
            margin-bottom: 3px;
            font-size: 10px;
            font-weight: 800;
            opacity: 0.78;
          }

          .practice-summary-value {
            font-size: 12px;
            font-weight: 900;
            line-height: 1.7;
            overflow-wrap: anywhere;
          }

          .practice-empty {
            text-align: center;
            padding: 42px 20px;
            color: var(--practice-muted);
          }

          .practice-empty-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            border-radius: 16px;
            color: var(--practice-primary);
            background: var(--practice-primary-soft);
          }

          .practice-empty-title {
            margin: 0 0 6px;
            color: var(--practice-text);
            font-size: 14px;
            font-weight: 900;
          }

          .practice-empty-text {
            max-width: 470px;
            margin: 0 auto;
            font-size: 12px;
            line-height: 1.9;
          }

          .practice-quiz {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
          }

          .practice-quiz-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 14px;
          }

          .practice-quiz-title {
            margin: 0;
            font-size: 20px;
            font-weight: 900;
          }

          .practice-quiz-meta {
            margin-top: 5px;
            color: var(--practice-muted);
            font-size: 11px;
            line-height: 1.8;
          }

          .practice-question-number {
            flex-shrink: 0;
            padding: 9px 13px;
            border-radius: 12px;
            color: var(--practice-primary-dark);
            background: var(--practice-primary-soft);
            font-size: 11px;
            font-weight: 900;
          }

          .practice-progress-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 180px;
          }

          .practice-progress {
            position: relative;
            flex: 1;
            height: 7px;
            overflow: hidden;
            border-radius: 99px;
            background: #edf1f2;
          }

          .practice-progress > span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(
              90deg,
              var(--practice-primary-dark),
              var(--practice-primary)
            );
            transition: width 300ms ease;
          }

          .practice-progress-label {
            color: var(--practice-muted);
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
          }

          .practice-question-area {
            padding: 24px;
          }

          .practice-image-box {
            width: 100%;
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border: 1px solid #edf0f1;
            border-radius: 16px;
            background:
              linear-gradient(
                135deg,
                #fbfcfc,
                #ffffff
              );
          }

          .practice-question-image {
            display: block;
            width: 100%;
            max-height: 620px;
            object-fit: contain;
            border-radius: 10px;
          }

          .practice-image-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 7px;
            padding: 25px;
            color: var(--practice-danger);
            font-size: 12px;
          }

          .practice-options {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 11px;
            margin-top: 17px;
          }

          .practice-option {
            min-height: 66px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 13px;
            border: 1px solid #e5eaec;
            border-radius: 15px;
            background: #fff;
            color: var(--practice-text);
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            text-align: right;
            cursor: pointer;
            transition:
              transform 160ms ease,
              border-color 160ms ease,
              background 160ms ease,
              box-shadow 160ms ease;
          }

          .practice-option:hover:not(:disabled) {
            transform: translateY(-1px);
            border-color: rgba(46,127,129,0.35);
            background: #fbfefe;
            box-shadow: 0 8px 20px rgba(25,45,51,0.06);
          }

          .practice-option:focus-visible {
            outline: none;
            border-color: var(--practice-primary);
            box-shadow:
              0 0 0 4px rgba(46,127,129,0.1);
          }

          .practice-option:disabled {
            cursor: default;
          }

          .practice-option.is-correct {
            border-color: rgba(47,138,87,0.35);
            background: var(--practice-success-soft);
          }

          .practice-option.is-wrong {
            border-color: rgba(214,69,69,0.32);
            background: var(--practice-danger-soft);
          }

          .practice-option.is-disabled {
            opacity: 0.58;
          }

          .practice-option-key {
            width: 36px;
            height: 36px;
            flex: 0 0 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e3e8e9;
            border-radius: 10px;
            color: #647176;
            background: #f8fafa;
            font-size: 12px;
            font-weight: 900;
          }

          .practice-option.is-correct .practice-option-key {
            border-color: rgba(47,138,87,0.2);
            color: var(--practice-success);
            background: rgba(47,138,87,0.08);
          }

          .practice-option.is-wrong .practice-option-key {
            border-color: rgba(214,69,69,0.2);
            color: var(--practice-danger);
            background: rgba(214,69,69,0.08);
          }

          .practice-option-text {
            flex: 1;
            line-height: 1.8;
          }

          .practice-answer-state {
            margin-top: 16px;
            padding: 14px;
            border-radius: 14px;
            font-size: 12px;
            line-height: 1.9;
          }

          .practice-answer-state.correct {
            color: var(--practice-success);
            background: var(--practice-success-soft);
          }

          .practice-answer-state.wrong {
            color: var(--practice-danger);
            background: var(--practice-danger-soft);
          }

          .practice-answer-title {
            display: flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 5px;
            font-weight: 900;
          }

          .practice-explanation {
            margin-top: 9px;
            padding-top: 9px;
            border-top: 1px dashed rgba(0,0,0,0.09);
            color: var(--practice-text);
          }

          .practice-md-paragraph {
            margin: 0 0 7px;
          }

          .practice-md-paragraph:last-child {
            margin-bottom: 0;
          }

          .practice-md-list {
            margin: 6px 0;
            padding-right: 22px;
          }

          .practice-quiz-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }

          .practice-question-dots {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 5px;
            max-width: 48%;
          }

          .practice-question-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #dfe5e6;
            transition: 180ms ease;
          }

          .practice-question-dot.done {
            background: #8cb9ba;
          }

          .practice-question-dot.current {
            width: 22px;
            border-radius: 99px;
            background: var(--practice-primary);
          }

          .practice-quiz-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 8px;
          }

          .practice-mistake-list {
            display: grid;
            gap: 9px;
          }

          .practice-mistake-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 14px;
            border: 1px solid var(--practice-border);
            border-radius: 14px;
            background: #fff;
            transition: 180ms ease;
          }

          .practice-mistake-item:hover {
            border-color: #d9e2e3;
            box-shadow: 0 6px 18px rgba(25,45,51,0.045);
          }

          .practice-mistake-main {
            min-width: 0;
          }

          .practice-mistake-title {
            margin: 0 0 4px;
            font-size: 12px;
            font-weight: 900;
          }

          .practice-mistake-meta {
            color: var(--practice-muted);
            font-size: 10px;
            line-height: 1.8;
          }

          .practice-status {
            flex-shrink: 0;
            padding: 7px 10px;
            border-radius: 9px;
            font-size: 10px;
            font-weight: 900;
          }

          .practice-status.due {
            color: var(--practice-danger);
            background: var(--practice-danger-soft);
          }

          .practice-status.waiting {
            color: var(--practice-primary-dark);
            background: var(--practice-primary-soft);
          }

          .practice-exam-card {
            text-align: center;
            padding: 54px 20px;
          }

          .practice-exam-icon {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            border-radius: 19px;
            color: var(--practice-primary);
            background: var(--practice-primary-soft);
            box-shadow: 0 9px 25px rgba(46,127,129,0.08);
          }

          .practice-exam-title {
            margin: 0 0 7px;
            font-size: 18px;
            font-weight: 900;
          }

          .practice-exam-text {
            max-width: 540px;
            margin: 0 auto;
            color: var(--practice-muted);
            font-size: 12px;
            line-height: 2;
          }

          .practice-results-hero {
            position: relative;
            overflow: hidden;
            padding: 25px;
            margin-bottom: 16px;
            border-radius: 18px;
            color: #fff;
            background:
              radial-gradient(
                circle at 100% 0%,
                rgba(255,255,255,0.15),
                transparent 30%
              ),
              linear-gradient(
                135deg,
                var(--practice-primary-dark),
                var(--practice-primary)
              );
          }

          .practice-results-hero-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .practice-results-kicker {
            display: flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 7px;
            color: rgba(255,255,255,0.76);
            font-size: 10px;
            font-weight: 800;
          }

          .practice-results-title {
            margin: 0;
            font-size: 21px;
            font-weight: 900;
          }

          .practice-results-percent {
            min-width: 105px;
            text-align: center;
          }

          .practice-results-percent-value {
            font-size: 34px;
            font-weight: 950;
            line-height: 1;
          }

          .practice-results-percent-label {
            margin-top: 5px;
            color: rgba(255,255,255,0.7);
            font-size: 9px;
          }

          .practice-kpis {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 11px;
            margin-bottom: 16px;
          }

          .practice-kpi {
            padding: 15px;
            border-radius: 15px;
            border: 1px solid transparent;
          }

          .practice-kpi-label {
            margin-bottom: 5px;
            font-size: 10px;
            font-weight: 900;
          }

          .practice-kpi-value {
            font-size: 25px;
            font-weight: 950;
            line-height: 1;
          }

          .practice-score-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .practice-score-card {
            min-height: 145px;
            padding: 18px;
            border-radius: 16px;
            border: 1px solid var(--practice-border);
          }

          .practice-score-card.raw {
            background: var(--practice-primary-soft);
            border-color: transparent;
          }

          .practice-score-card.negative {
            color: #fff;
            border-color: transparent;
            background:
              radial-gradient(
                circle at 90% 10%,
                rgba(255,255,255,0.13),
                transparent 25%
              ),
              #182b30;
          }

          .practice-score-label {
            margin-bottom: 7px;
            font-size: 10px;
            font-weight: 800;
          }

          .practice-score-value {
            font-size: 31px;
            font-weight: 950;
            line-height: 1;
          }

          .practice-score-description {
            margin-top: 9px;
            font-size: 10px;
            line-height: 1.8;
          }

          .practice-mini-progress {
            height: 7px;
            margin-top: 12px;
            overflow: hidden;
            border-radius: 99px;
            background: rgba(255,255,255,0.22);
          }

          .practice-score-card.raw .practice-mini-progress {
            background: rgba(46,127,129,0.13);
          }

          .practice-mini-progress span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: currentColor;
          }

          .practice-results-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .practice-loading {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .practice-spinner {
            width: 15px;
            height: 15px;
            border: 2px solid rgba(255,255,255,0.35);
            border-top-color: #fff;
            border-radius: 50%;
            animation: practiceSpin 700ms linear infinite;
          }

          .practice-spinner.dark {
            border-color: rgba(46,127,129,0.18);
            border-top-color: var(--practice-primary);
          }

          @keyframes practiceSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .practice-shortcut-hint {
            margin-top: 9px;
            color: var(--practice-muted);
            font-size: 9px;
            text-align: center;
          }

          @media (max-width: 991.98px) {
            .practice-header {
              align-items: stretch;
              flex-direction: column;
            }

            .practice-tabs {
              width: 100%;
              overflow-x: auto;
            }

            .practice-tab {
              flex: 1;
            }

            .practice-kpis {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 767.98px) {
            .practice-page {
              padding: 18px 11px 35px;
            }

            .practice-header {
              margin-bottom: 16px;
              gap: 14px;
            }

            .practice-header h1 {
              font-size: 24px;
            }

            .practice-header-subtitle {
              font-size: 10px;
            }

            .practice-tabs {
              border-radius: 14px;
            }

            .practice-tab {
              min-width: 112px;
              min-height: 40px;
              padding: 0 9px;
              font-size: 10px;
            }

            .practice-module {
              border-radius: 16px;
            }

            .practice-module-head {
              min-height: 57px;
              padding: 12px 14px;
            }

            .practice-module-body {
              padding: 15px;
            }

            .practice-module-foot {
              padding: 12px 14px;
            }

            .practice-quiz-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .practice-question-number {
              width: 100%;
              text-align: center;
            }

            .practice-progress-wrap {
              width: 100%;
            }

            .practice-question-area {
              padding: 15px;
            }

            .practice-options {
              grid-template-columns: 1fr;
              gap: 8px;
            }

            .practice-option {
              min-height: 58px;
            }

            .practice-quiz-foot {
              align-items: stretch;
              flex-direction: column;
            }

            .practice-question-dots {
              max-width: 100%;
              justify-content: center;
            }

            .practice-quiz-actions {
              width: 100%;
              justify-content: stretch;
            }

            .practice-quiz-actions button {
              flex: 1;
            }

            .practice-mistake-item {
              align-items: flex-start;
              flex-direction: column;
            }

            .practice-status {
              align-self: flex-start;
            }

            .practice-results-hero {
              padding: 19px;
            }

            .practice-results-hero-top {
              align-items: flex-start;
              flex-direction: column;
            }

            .practice-results-percent {
              width: 100%;
              text-align: right;
            }

            .practice-score-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 430px) {
            .practice-page {
              padding-left: 8px;
              padding-right: 8px;
            }

            .practice-tabs {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              overflow: visible;
            }

            .practice-tab {
              min-width: 0;
              width: 100%;
              padding: 0 5px;
            }

            .practice-tab span.tab-text {
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .practice-module-body {
              padding: 12px;
            }

            .practice-major {
              flex: 1;
              min-width: 0;
            }

            .practice-kpis {
              gap: 8px;
            }

            .practice-kpi {
              padding: 12px;
            }

            .practice-kpi-value {
              font-size: 22px;
            }

            .practice-score-value {
              font-size: 27px;
            }

            .practice-quiz-actions {
              flex-direction: column;
            }

            .practice-quiz-actions button {
              width: 100%;
              flex: none;
            }
          }
        `}</style>

        <main className="practice-container">
          <header className="practice-header">
            <div className="practice-header-copy">
              <div className="practice-eyebrow">
                <Zap size={13} />
                تمرین هوشمند و تحلیل عملکرد
              </div>

              <h1>تمرین و خودآزمایی</h1>

              <p className="practice-header-subtitle">
                سوال انتخاب کن، پاسخ بده و نقاط ضعف خودت را دقیق‌تر بشناس.
              </p>
            </div>

            <nav className="practice-tabs" aria-label="بخش‌های تمرین">
              <button
                type="button"
                onClick={() => handleTabChange("practice")}
                className={`practice-tab ${
                  activeTab === "practice" ? "is-active" : ""
                }`}
              >
                <ClipboardList size={14} />
                <span className="tab-text">تمرین</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("exam")}
                className={`practice-tab ${
                  activeTab === "exam" ? "is-active" : ""
                }`}
              >
                <Lock size={14} />
                <span className="tab-text">آزمون</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("mistakes")}
                className={`practice-tab ${
                  activeTab === "mistakes" ? "is-active" : ""
                }`}
              >
                <RefreshCw size={14} />

                <span className="tab-text">اشتباهات</span>

                {dueMistakes > 0 && (
                  <span className="practice-tab-badge">
                    {toFa(dueMistakes)}
                  </span>
                )}
              </button>
            </nav>
          </header>

          {activeTab === "exam" ? (
            <section className="practice-module">
              <div className="practice-exam-card">
                <div className="practice-exam-icon">
                  <Lock size={27} />
                </div>

                <h2 className="practice-exam-title">
                  بخش آزمون در حال توسعه است
                </h2>

                <p className="practice-exam-text">
                  در نسخه بعدی، آزمون زمان‌دار، مرور سوالات نشان‌دار، مدیریت
                  زمان و تحلیل کامل آزمون در این بخش اضافه خواهد شد.
                </p>
              </div>
            </section>
          ) : activeTab === "mistakes" ? (
            <section className="practice-module">
              <div className="practice-module-head">
                <div className="practice-module-title">
                  <RefreshCw size={16} color="var(--practice-primary)" />
                  دفترچه اشتباهات
                </div>

                <button
                  type="button"
                  className="practice-primary-button"
                  onClick={startMistakeReview}
                  disabled={starting || dueMistakes === 0}
                >
                  {starting ? (
                    <>
                      <span className="practice-spinner" />
                      در حال آماده‌سازی
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      شروع مرور
                      {dueMistakes > 0 ? ` ${toFa(dueMistakes)} سوال` : ""}
                    </>
                  )}
                </button>
              </div>

              <div className="practice-module-body">
                {error && (
                  <div className="practice-alert">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />

                    <span>{error}</span>
                  </div>
                )}

                {mistakes.length === 0 ? (
                  <div className="practice-empty">
                    <div className="practice-empty-icon">
                      <CheckCircle2 size={24} />
                    </div>

                    <h3 className="practice-empty-title">
                      دفترچه اشتباهات هنوز خالی است
                    </h3>

                    <p className="practice-empty-text">
                      بعد از اولین تمرین، سوال‌هایی که پاسخ اشتباه داده‌ای در
                      این بخش ثبت می‌شوند تا بتوانی به‌صورت فاصله‌دار آن‌ها را
                      مرور کنی.
                    </p>
                  </div>
                ) : (
                  <div className="practice-mistake-list">
                    {mistakes.map((item) => (
                      <div className="practice-mistake-item" key={item.id}>
                        <div className="practice-mistake-main">
                          <h3 className="practice-mistake-title">
                            {item.question?.lesson || "سوال تمرینی"}
                          </h3>

                          <div className="practice-mistake-meta">
                            {item.question?.topic || "بدون مبحث"}
                            {" · "}
                            {toFa(item.wrongCount)} بار اشتباه
                          </div>
                        </div>

                        <span
                          className={`practice-status ${
                            item.due ? "due" : "waiting"
                          }`}
                        >
                          {item.due
                            ? "آماده مرور"
                            : `مرحله ${toFa(item.reviewStage)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              {phase === "setup" && (
                <div className="row g-3">
                  <div className="col-12 col-lg-8">
                    <section className="practice-module h-100">
                      <div className="practice-module-head">
                        <div className="practice-module-title">
                          <BookOpen size={17} color="var(--practice-primary)" />
                          ساخت تمرین جدید
                        </div>

                        <span className="practice-quiz-meta">
                          {filtersLoading
                            ? "در حال دریافت..."
                            : `${toFa(availableCount)} سوال موجود`}
                        </span>
                      </div>

                      <div className="practice-module-body">
                        {error && (
                          <div className="practice-alert">
                            <AlertCircle
                              size={16}
                              style={{
                                flexShrink: 0,
                              }}
                            />

                            <span>{error}</span>
                          </div>
                        )}

                        <div className="mb-3">
                          <span className="practice-field-label">
                            رشته تحصیلی
                          </span>

                          <div className="practice-major-list">
                            {MAJORS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => updateMajor(item)}
                                className={`practice-major ${
                                  major === item ? "is-active" : ""
                                }`}
                              >
                                {major === item && <Check size={13} />}

                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <label className="d-block">
                              <span className="practice-field-label">درس</span>

                              <select
                                className="practice-select"
                                value={lesson}
                                onChange={(event) =>
                                  updateLesson(event.target.value)
                                }
                                disabled={filtersLoading}
                              >
                                {!lessons.length && (
                                  <option value="">انتخاب درس</option>
                                )}

                                {lessons.map((item) => (
                                  <option key={item.name} value={item.name}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="d-block">
                              <span className="practice-field-label">پایه</span>

                              <select
                                className="practice-select"
                                value={grade}
                                onChange={(event) =>
                                  updateGrade(event.target.value)
                                }
                                disabled={filtersLoading || !lesson}
                              >
                                {!gradeOptions.length && (
                                  <option value="">انتخاب پایه</option>
                                )}

                                {gradeOptions.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          {features.topics && (
                            <div className="col-12 col-md-6">
                              <label className="d-block">
                                <span className="practice-field-label">
                                  مبحث
                                </span>

                                <select
                                  className="practice-select"
                                  value={topic}
                                  onChange={(event) => {
                                    setTopic(event.target.value);
                                    resetRun();
                                  }}
                                  disabled={filtersLoading}
                                >
                                  {topics.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          )}

                          <div className="col-12 col-md-6">
                            <label className="d-block">
                              <span className="practice-field-label">
                                تعداد سوال
                              </span>

                              <select
                                className="practice-select"
                                value={questionCount}
                                onChange={(event) =>
                                  setQuestionCount(Number(event.target.value))
                                }
                                disabled={filtersLoading}
                              >
                                {questionCounts.map((item) => (
                                  <option key={item} value={item}>
                                    {toFa(item)} سوال
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="practice-module-foot">
                        <button
                          type="button"
                          onClick={startPractice}
                          disabled={
                            filtersLoading || starting || availableCount <= 0
                          }
                          className="practice-primary-button"
                          style={{
                            width: "100%",
                          }}
                        >
                          {starting ? (
                            <>
                              <span className="practice-spinner" />
                              در حال آماده‌سازی تمرین
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              شروع تمرین
                            </>
                          )}
                        </button>
                      </div>
                    </section>
                  </div>

                  <div className="col-12 col-lg-4">
                    <section className="practice-module h-100">
                      <div className="practice-module-head">
                        <div className="practice-module-title">
                          <Target size={16} color="var(--practice-primary)" />
                          خلاصه انتخاب شما
                        </div>
                      </div>

                      <div className="practice-module-body">
                        <div className="practice-summary-list">
                          <SummaryTile
                            icon={<BookOpen size={16} />}
                            label="درس و پایه"
                            value={`${lesson || "انتخاب نشده"} · ${
                              grade || "انتخاب نشده"
                            }`}
                            tone="primary"
                          />

                          {features.topics && (
                            <SummaryTile
                              icon={<ClipboardList size={16} />}
                              label="مبحث"
                              value={topic || ALL_TOPICS}
                              tone="success"
                            />
                          )}

                          <SummaryTile
                            icon={<BarChart3 size={16} />}
                            label="سوال‌های قابل استفاده"
                            value={
                              filtersLoading
                                ? "در حال بررسی..."
                                : `${toFa(availableCount)} سوال`
                            }
                            tone={availableCount > 0 ? "warning" : "danger"}
                          />

                          <SummaryTile
                            icon={<ClipboardList size={16} />}
                            label="تعداد انتخابی"
                            value={`${toFa(questionCount)} سوال`}
                            tone="primary"
                          />

                          {availableCount <= 0 && !filtersLoading && (
                            <div className="practice-alert">
                              <Info
                                size={15}
                                style={{
                                  flexShrink: 0,
                                }}
                              />

                              <span>
                                برای این انتخاب هنوز سوالی در بانک سوال ثبت نشده
                                است.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {phase === "running" && currentQuestion && (
                <div className="practice-quiz">
                  <div className="practice-quiz-header">
                    <div>
                      <h2 className="practice-quiz-title">
                        {currentQuestion.lesson || lesson || "تمرین"}
                      </h2>

                      <div className="practice-quiz-meta">
                        {currentQuestion.grade || grade}
                        {features.topics &&
                          ` · ${currentQuestion.topic || ALL_TOPICS}`}
                        {" · "}
                        {toFa(questions.length)} سوال
                      </div>
                    </div>

                    <div className="practice-question-number">
                      سوال {toFa(currentIndex + 1)} از {toFa(questions.length)}
                    </div>
                  </div>

                  <section className="practice-module">
                    <div className="practice-module-head">
                      <div className="practice-module-title">
                        <Clock3 size={15} color="var(--practice-primary)" />
                        پیشرفت تمرین
                      </div>

                      <div className="practice-progress-wrap">
                        <div className="practice-progress">
                          <span
                            style={{
                              width: `${progressPercent}%`,
                            }}
                          />
                        </div>

                        <span className="practice-progress-label">
                          {toFa(answeredCount)} / {toFa(questions.length)}
                        </span>
                      </div>
                    </div>

                    <div className="practice-question-area">
                      <div className="practice-image-box">
                        {currentQuestion.questionImage && !imageError ? (
                          <img
                            src={resolveMediaUrl(currentQuestion.questionImage)}
                            alt={`سوال ${toFa(currentIndex + 1)}`}
                            className="practice-question-image"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="practice-image-error">
                            <AlertCircle size={22} />

                            <span>تصویر سوال قابل بارگذاری نیست.</span>
                          </div>
                        )}
                      </div>

                      <div className="practice-options">
                        {OPTION_LABELS.map((option, index) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => answerQuestion(index)}
                            disabled={hasAnswered}
                            className={optionClassName(index)}
                            aria-label={option}
                          >
                            <span className="practice-option-key">
                              {KEY_LABELS[index]}
                            </span>

                            <span className="practice-option-text">
                              {option}
                            </span>

                            {hasAnswered &&
                              index === currentQuestion.correctAnswer && (
                                <Check
                                  size={18}
                                  color="var(--practice-success)"
                                />
                              )}

                            {hasAnswered &&
                              index === currentAnswer &&
                              index !== currentQuestion.correctAnswer && (
                                <X size={18} color="var(--practice-danger)" />
                              )}
                          </button>
                        ))}
                      </div>

                      {hasAnswered && (
                        <div
                          className={`practice-answer-state ${
                            currentIsCorrect ? "correct" : "wrong"
                          }`}
                        >
                          <div className="practice-answer-title">
                            {currentIsCorrect ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <X size={16} />
                            )}

                            {currentIsCorrect
                              ? "آفرین! پاسخ درست بود."
                              : "پاسخ انتخاب‌شده درست نبود."}
                          </div>

                          {features.explanations &&
                            currentQuestion.explanation && (
                              <div className="practice-explanation">
                                <BlockMarkdown>
                                  {currentQuestion.explanation}
                                </BlockMarkdown>
                              </div>
                            )}
                        </div>
                      )}

                      <div className="practice-shortcut-hint">
                        برای پاسخ سریع می‌توانی از کلیدهای ۱ تا ۴ صفحه‌کلید
                        استفاده کنی.
                      </div>
                    </div>

                    <div className="practice-module-foot">
                      <div className="practice-quiz-foot">
                        <div
                          className="practice-question-dots"
                          aria-label="وضعیت سوالات"
                        >
                          {questions.map((_, index) => (
                            <span
                              key={index}
                              className={`practice-question-dot ${
                                index === currentIndex
                                  ? "current"
                                  : answers[index] !== null &&
                                      answers[index] !== undefined
                                    ? "done"
                                    : ""
                              }`}
                            />
                          ))}
                        </div>

                        <div className="practice-quiz-actions">
                          {currentIndex > 0 && (
                            <button
                              type="button"
                              onClick={goPrevious}
                              className="practice-secondary-button"
                            >
                              قبلی
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => askTutor(currentQuestion)}
                            className="practice-outline-button"
                          >
                            <Sparkles size={14} />
                            رفع اشکال با مربی
                          </button>

                          <button
                            type="button"
                            onClick={goNext}
                            disabled={completing}
                            className={
                              hasAnswered
                                ? "practice-primary-button"
                                : "practice-secondary-button"
                            }
                          >
                            {completing ? (
                              <>
                                <span className="practice-spinner dark" />
                                ثبت نتیجه
                              </>
                            ) : currentIndex < questions.length - 1 ? (
                              hasAnswered ? (
                                <>
                                  ثبت و سوال بعدی
                                  <ArrowLeft size={14} />
                                </>
                              ) : (
                                <>
                                  رد کردن
                                  <ArrowLeft size={14} />
                                </>
                              )
                            ) : (
                              <>
                                مشاهده نتیجه
                                <Trophy size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {phase === "results" && (
                <section className="practice-module">
                  <div className="practice-module-head">
                    <div className="practice-module-title">
                      <Trophy size={17} color="var(--practice-primary)" />
                      نتیجه تمرین
                    </div>

                    <div className="practice-results-header-actions">
                      <button
                        type="button"
                        onClick={resetRun}
                        className="practice-outline-button"
                      >
                        <RefreshCw size={14} />
                        تمرین جدید
                      </button>
                    </div>
                  </div>

                  <div className="practice-module-body">
                    {error && (
                      <div className="practice-alert">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="practice-results-hero">
                      <div className="practice-results-hero-top">
                        <div>
                          <div className="practice-results-kicker">
                            <Sparkles size={13} />
                            جمع‌بندی عملکرد شما
                          </div>

                          <h2 className="practice-results-title">
                            {result.lesson || lesson || "تمرین"}

                            {" · "}

                            {result.grade || grade || "—"}
                          </h2>
                        </div>

                        <div className="practice-results-percent">
                          <div className="practice-results-percent-value">
                            {toFa(result.rawPercent, 1)}٪
                          </div>

                          <div className="practice-results-percent-label">
                            درصد خام
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="practice-kpis">
                      <ResultCard
                        label="پاسخ درست"
                        value={result.correct}
                        tone="success"
                      />

                      <ResultCard
                        label="پاسخ غلط"
                        value={result.wrong}
                        tone="danger"
                      />

                      <ResultCard
                        label="نزده"
                        value={result.unsolved}
                        tone="warning"
                      />

                      <ResultCard
                        label="کل سوالات"
                        value={result.total}
                        tone="primary"
                      />
                    </div>

                    <div className="practice-score-grid">
                      <ScoreCard
                        type="raw"
                        label="درصد خام"
                        value={result.rawPercent}
                        description="درصد پاسخ‌های صحیح نسبت به کل سوالات"
                      />

                      <ScoreCard
                        type="negative"
                        label="درصد با نمره منفی کنکور"
                        value={result.negativePercent}
                        description="فرمول: ((درست × ۳ - غلط) ÷ (کل × ۳)) × ۱۰۰"
                      />
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

const TONE_STYLES = {
  primary: {
    color: "var(--practice-primary)",
    background: "var(--practice-primary-soft)",
  },

  success: {
    color: "var(--practice-success)",
    background: "var(--practice-success-soft)",
  },

  warning: {
    color: "var(--practice-warning)",
    background: "var(--practice-warning-soft)",
  },

  danger: {
    color: "var(--practice-danger)",
    background: "var(--practice-danger-soft)",
  },
};

function SummaryTile({ icon, label, value, tone }) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.primary;

  return (
    <div
      className="practice-summary-tile"
      style={{
        background: toneStyle.background,
        color: toneStyle.color,
      }}
    >
      <div
        className="practice-summary-icon"
        style={{
          background: "rgba(255,255,255,0.68)",
        }}
      >
        {icon}
      </div>

      <div className="practice-summary-content">
        <div className="practice-summary-label">{label}</div>

        <div
          className="practice-summary-value"
          style={{
            color: "var(--practice-text)",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, tone }) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.primary;

  return (
    <div
      className="practice-kpi"
      style={{
        background: toneStyle.background,
        color: toneStyle.color,
      }}
    >
      <div className="practice-kpi-label">{label}</div>

      <div
        className="practice-kpi-value"
        style={{
          color: toneStyle.color,
        }}
      >
        {toFa(value)}
      </div>
    </div>
  );
}

function ScoreCard({ type, label, value, description }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={`practice-score-card ${type}`}>
      <div className="practice-score-label">{label}</div>

      <div className="practice-score-value">{toFa(value, 1)}٪</div>

      <div className="practice-score-description">{description}</div>

      <div className="practice-mini-progress">
        <span
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}
