import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Target,
  Zap,
  X,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiJson, getToken } from "../utils/api";

function playBeepSequence(ctx, mode) {
  if (!ctx) return;

  const beeps = 3;
  const beepDuration = 0.18;
  const gap = 0.2;

  for (let i = 0; i < beeps; i += 1) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";

    const startTime =
      ctx.currentTime + i * (beepDuration + gap);
    const endTime = startTime + beepDuration;

    oscillator.frequency.setValueAtTime(
      mode === "focus" ? 980 : 760,
      startTime
    );

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(
      0.18,
      startTime + 0.02
    );
    gainNode.gain.linearRampToValueAtTime(
      0.0001,
      endTime
    );

    oscillator.start(startTime);
    oscillator.stop(endTime);
  }
}

const FocusTimer = () => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const [showFinishPopup, setShowFinishPopup] = useState(false);
  const [finishedMode, setFinishedMode] = useState("focus");
  const [sessionSaveError, setSessionSaveError] = useState("");

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const sessionRecordedRef = useRef(false);
  const sessionSnapshotRef = useRef(null);

  const totalTime =
    mode === "focus"
      ? focusMinutes * 60
      : breakMinutes * 60;

  sessionSnapshotRef.current = {
    mode,
    seconds,
    totalTime,
  };

  const progress =
    totalTime > 0
      ? ((totalTime - seconds) / totalTime) * 100
      : 0;

  const circumference = 2 * Math.PI * 100;

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    if (
      audioContextRef.current?.state === "suspended"
    ) {
      audioContextRef.current.resume();
    }
  }, []);

  const formatTime = useCallback((secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const saveSession = useCallback(
    (status, remaining) => {
      const currentRemaining =
        remaining ?? seconds;

      if (
        !getToken() ||
        totalTime - currentRemaining <= 0 ||
        sessionRecordedRef.current
      ) {
        return;
      }

      sessionRecordedRef.current = true;

      apiJson("/api/planner/focus-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          status,
          plannedSeconds: totalTime,
          elapsedSeconds:
            totalTime - currentRemaining,
        }),
      })
        .then(({ response }) => {
          if (!response.ok) {
            throw new Error("جلسه ذخیره نشد.");
          }

          setSessionSaveError("");
        })
        .catch(() => {
          setSessionSaveError(
            "جلسه تایمر ذخیره نشد؛ اتصال را بررسی کن."
          );
        });
    },
    [mode, seconds, totalTime]
  );

  const toggleTimer = useCallback(() => {
    initAudio();

    if (!isActive && seconds === totalTime) {
      sessionRecordedRef.current = false;
    }

    setIsActive((prev) => !prev);
  }, [
    initAudio,
    isActive,
    seconds,
    totalTime,
  ]);

  const resetTimer = useCallback(() => {
    saveSession("interrupted");

    sessionRecordedRef.current = false;
    setIsActive(false);
    setShowFinishPopup(false);

    setSeconds(
      mode === "focus"
        ? focusMinutes * 60
        : breakMinutes * 60
    );
  }, [
    saveSession,
    mode,
    focusMinutes,
    breakMinutes,
  ]);

  const switchMode = useCallback(
    (newMode) => {
      if (newMode === mode) {
        return;
      }

      saveSession("interrupted");

      sessionRecordedRef.current = false;
      setMode(newMode);
      setIsActive(false);
      setShowFinishPopup(false);

      setSeconds(
        newMode === "focus"
          ? focusMinutes * 60
          : breakMinutes * 60
      );
    },
    [
      mode,
      saveSession,
      focusMinutes,
      breakMinutes,
    ]
  );

  const handleClosePopup = useCallback(() => {
    setShowFinishPopup(false);
  }, []);

  const handleFocusChange = useCallback(
    (event) => {
      const minutes = Number(event.target.value);

      if (
        Number.isInteger(minutes) &&
        minutes >= 1 &&
        minutes <= 180
      ) {
        saveSession("interrupted");
        sessionRecordedRef.current = false;
        setFocusMinutes(minutes);
      }
    },
    [saveSession]
  );

  const handleBreakChange = useCallback(
    (event) => {
      const minutes = Number(event.target.value);

      if (
        Number.isInteger(minutes) &&
        minutes >= 1 &&
        minutes <= 60
      ) {
        saveSession("interrupted");
        sessionRecordedRef.current = false;
        setBreakMinutes(minutes);
      }
    },
    [saveSession]
  );

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return undefined;
    }

    if (seconds <= 0) {
      clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [isActive, seconds]);

  useEffect(() => {
    if (seconds !== 0) {
      return undefined;
    }

    if (!isActive) {
      return undefined;
    }

    setIsActive(false);
    saveSession("completed", 0);

    const endedMode = mode;
    const nextMode =
      endedMode === "focus"
        ? "break"
        : "focus";

    playBeepSequence(
      audioContextRef.current,
      endedMode
    );

    setFinishedMode(endedMode);
    setShowFinishPopup(true);
    setMode(nextMode);

    setSeconds(
      nextMode === "focus"
        ? focusMinutes * 60
        : breakMinutes * 60
    );

    return undefined;
  }, [
    seconds,
    isActive,
    mode,
    saveSession,
    focusMinutes,
    breakMinutes,
  ]);

  useEffect(() => {
    if (isActive) {
      return;
    }

    setSeconds(
      mode === "focus"
        ? focusMinutes * 60
        : breakMinutes * 60
    );
  }, [focusMinutes, breakMinutes, mode, isActive]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      const {
        mode: lastMode,
        seconds: remaining,
        totalTime: planned,
      } = sessionSnapshotRef.current;

      if (
        getToken() &&
        !sessionRecordedRef.current &&
        planned > remaining
      ) {
        sessionRecordedRef.current = true;

        apiJson("/api/planner/focus-sessions", {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: lastMode,
            status: "interrupted",
            plannedSeconds: planned,
            elapsedSeconds:
              planned - remaining,
          }),
        }).catch(() => {});
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const isFocus = mode === "focus";

  const accent = isFocus
    ? "var(--primary, #e53935)"
    : "var(--success, #16a34a)";

  const progressColor = isFocus
    ? "var(--primary, #e53935)"
    : "var(--success, #16a34a)";
  return (
    <>
      <Helmet>
        <title>
          تایمر فوکوس پومودورو | افزایش بهره‌وری مطالعه
        </title>

        <meta
          name="description"
          content="با استفاده از متد پومودورو و تایمر تمرکز هوشمند منتورا، بازدهی ساعات مطالعه خود را افزایش دهید."
        />

        <link
          rel="canonical"
          href="https://mentoralearn.ir/focustimer"
        />
      </Helmet>

      <style>{`
        .focus-page {
          min-height: calc(100vh - 80px);
          padding: 28px 16px 50px;
          direction: rtl;
          overflow-x: hidden;
          color: var(--text-primary, #172033);
        }

        .focus-container {
          width: min(100%, 560px);
          margin: 0 auto;
        }

        .focus-heading {
          margin-bottom: 20px;
          text-align: right;
        }

        .focus-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
          color: var(--primary, #e53935);
          font-size: 11px;
          font-weight: 900;
        }

        .focus-heading h1 {
          margin: 0;
          font-size: clamp(25px, 5vw, 31px);
          line-height: 1.4;
          font-weight: 900;
          letter-spacing: -0.6px;
        }

        .focus-heading p {
          max-width: 520px;
          margin: 7px 0 0;
          color: var(--text-muted, #7b8497);
          font-size: 12px;
          line-height: 1.9;
        }

        .focus-module {
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 22px;
          background: var(--bg-card, #fff);
          box-shadow:
            0 16px 42px rgba(31, 41, 55, 0.07),
            0 3px 10px rgba(31, 41, 55, 0.03);
          overflow: hidden;
        }

        .focus-module-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 19px;
          border-bottom: 1px solid var(--border, #e8ebf1);
        }

        .focus-module-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 900;
        }

        .focus-module-title svg {
          color: var(--primary, #e53935);
        }

        .focus-mode-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        .focus-mode-badge.focus {
          color: var(--primary, #e53935);
          background: rgba(229, 57, 53, 0.07);
        }

        .focus-mode-badge.break {
          color: var(--success, #16a34a);
          background: rgba(22, 163, 74, 0.08);
        }

        .focus-module-body {
          padding: 20px;
          text-align: center;
        }

        .focus-settings {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .focus-setting {
          padding: 14px;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 15px;
          background: var(--bg-canvas, #f8f9fb);
          transition:
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .focus-setting:hover {
          transform: translateY(-2px);
          border-color: rgba(229, 57, 53, 0.16);
          box-shadow: 0 8px 20px rgba(31, 41, 55, 0.05);
        }

        .focus-setting-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 9px;
          font-size: 10px;
          font-weight: 900;
        }

        .focus-setting-label.focus {
          color: var(--primary, #e53935);
        }

        .focus-setting-label.break {
          color: var(--success, #16a34a);
        }

        .focus-time-input {
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border: 1px solid var(--border, #e0e4eb);
          border-radius: 11px;
          outline: none;
          color: var(--text-primary, #172033);
          background: #fff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 900;
          text-align: center;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .focus-time-input:focus {
          border-color: rgba(229, 57, 53, 0.4);
          box-shadow: 0 0 0 4px rgba(229, 57, 53, 0.07);
        }

        .focus-setting-unit {
          margin-top: 6px;
          color: var(--text-muted, #7b8497);
          font-size: 9px;
          font-weight: 700;
        }

        .focus-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          padding: 5px;
          margin-bottom: 25px;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 14px;
          background: var(--bg-canvas, #f7f8fa);
        }

        .focus-switch-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 12px;
          border: 0;
          border-radius: 10px;
          color: var(--text-muted, #7b8497);
          background: transparent;
          font-family: inherit;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .focus-switch-button:hover {
          color: var(--text-primary, #172033);
        }

        .focus-switch-button.active-focus {
          color: #fff;
          background: linear-gradient(
            135deg,
            var(--primary, #e53935),
            var(--primary-dark, #c62828)
          );
          box-shadow: 0 7px 17px rgba(229, 57, 53, 0.2);
        }

        .focus-switch-button.active-break {
          color: #fff;
          background: linear-gradient(
            135deg,
            var(--success, #16a34a),
            #15803d
          );
          box-shadow: 0 7px 17px rgba(22, 163, 74, 0.19);
        }

        .focus-timer-area {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 250px;
          height: 250px;
          margin: 0 auto 23px;
        }

        .focus-timer-ring {
          width: 250px;
          height: 250px;
          overflow: visible;
        }

        .focus-ring-track {
          fill: none;
          stroke: var(--border, #e7eaf0);
          stroke-width: 8;
        }

        .focus-ring-progress {
          fill: none;
          stroke: ${progressColor};
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(
            0 4px 8px rgba(229, 57, 53, 0.13)
          );
        }

        .focus-timer-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .focus-timer-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          margin-bottom: 7px;
          border-radius: 11px;
          color: ${accent};
          background: ${
            isFocus
              ? "rgba(229, 57, 53, 0.08)"
              : "rgba(22, 163, 74, 0.09)"
          };
        }

        .focus-time {
          font-size: clamp(42px, 10vw, 50px);
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -1.5px;
          font-variant-numeric: tabular-nums;
        }

        .focus-time-label {
          margin-top: 4px;
          color: var(--text-muted, #7b8497);
          font-size: 10px;
          font-weight: 800;
        }

        .focus-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 17px;
        }

        .focus-control-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          padding: 0;
          border: 1px solid var(--border, #e1e5eb);
          border-radius: 50%;
          color: var(--text-muted, #7b8497);
          background: #fff;
          cursor: pointer;
          box-shadow: 0 6px 17px rgba(31, 41, 55, 0.06);
          transition:
            transform 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .focus-control-button:hover {
          color: var(--primary, #e53935);
          border-color: rgba(229, 57, 53, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(31, 41, 55, 0.09);
        }

        .focus-control-button:active {
          transform: translateY(0);
        }

        .focus-main-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 88px;
          height: 88px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(
            145deg,
            ${accent},
            ${isFocus ? "var(--primary-dark, #c62828)" : "#15803d"}
          );
          cursor: pointer;
          box-shadow:
            0 15px 32px ${
              isFocus
                ? "rgba(229, 57, 53, 0.25)"
                : "rgba(22, 163, 74, 0.24)"
            },
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .focus-main-button::before {
          content: "";
          position: absolute;
          inset: -5px;
          border: 1px solid ${
            isFocus
              ? "rgba(229, 57, 53, 0.18)"
              : "rgba(22, 163, 74, 0.18)"
          };
          border-radius: 50%;
        }

        .focus-main-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow:
            0 20px 38px ${
              isFocus
                ? "rgba(229, 57, 53, 0.3)"
                : "rgba(22, 163, 74, 0.29)"
            },
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }

        .focus-main-button:active {
          transform: translateY(0) scale(0.99);
        }

        .focus-main-button svg {
          position: relative;
          z-index: 1;
        }

        .focus-controls-spacer {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }

        .focus-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 52px;
          padding: 11px 14px;
          margin-top: 24px;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 13px;
          color: var(--text-secondary, #596274);
          background: var(--bg-canvas, #f8f9fb);
          font-size: 10px;
          line-height: 1.8;
          font-weight: 700;
        }

        .focus-tip svg {
          flex-shrink: 0;
          color: ${accent};
        }

        .focus-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          padding: 10px 15px;
          border-bottom: 1px solid rgba(239, 68, 68, 0.12);
          color: #b91c1c;
          background: rgba(239, 68, 68, 0.045);
          font-size: 10px;
          font-weight: 700;
        }

        .focus-module-foot {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 19px;
          border-top: 1px solid var(--border, #e8ebf1);
          color: var(--text-muted, #7b8497);
          font-size: 10px;
          font-weight: 700;
        }

        .focus-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          direction: rtl;
          background: rgba(17, 24, 39, 0.58);
          backdrop-filter: blur(7px);
          animation: focusOverlayIn 0.2s ease;
        }

        @keyframes focusOverlayIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .focus-popup {
          position: relative;
          width: min(100%, 400px);
          padding: 32px 26px 25px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 23px;
          background: #fff;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
          animation: focusPopupIn 0.25s ease;
        }

        @keyframes focusPopupIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .focus-popup-close {
          position: absolute;
          top: 13px;
          left: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 50%;
          color: var(--text-muted, #7b8497);
          background: #fff;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .focus-popup-close:hover {
          color: var(--primary, #e53935);
          background: rgba(229, 57, 53, 0.06);
          transform: rotate(5deg);
        }

        .focus-popup-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          margin: 0 auto 17px;
          border-radius: 22px;
          color: var(--success, #16a34a);
          background: rgba(22, 163, 74, 0.08);
        }

        .focus-popup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 9px;
          padding: 6px 10px;
          border-radius: 999px;
          color: var(--success, #16a34a);
          background: rgba(22, 163, 74, 0.07);
          font-size: 9px;
          font-weight: 900;
        }

        .focus-popup h3 {
          margin: 0 0 9px;
          color: var(--text-primary, #172033);
          font-size: 18px;
          line-height: 1.7;
          font-weight: 900;
        }

        .focus-popup p {
          margin: 0 auto 17px;
          color: var(--text-muted, #7b8497);
          font-size: 11px;
          line-height: 2;
        }

        .focus-next {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 15px;
          border: 1px solid var(--border, #e8ebf1);
          border-radius: 13px;
          background: var(--bg-canvas, #f8f9fb);
          font-size: 10px;
          font-weight: 700;
        }

        .focus-next-label {
          color: var(--text-muted, #7b8497);
        }

        .focus-next-value {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 900;
        }

        .focus-popup-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 46px;
          border: 0;
          border-radius: 13px;
          color: #fff;
          background: linear-gradient(
            135deg,
            var(--primary, #e53935),
            var(--primary-dark, #c62828)
          );
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 9px 22px rgba(229, 57, 53, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .focus-popup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 13px 28px rgba(229, 57, 53, 0.26);
        }

        .focus-popup-button:active {
          transform: translateY(0);
        }

        @media (max-width: 600px) {
          .focus-page {
            min-height: calc(100vh - 60px);
            padding: 20px 12px 40px;
          }

          .focus-heading {
            margin-bottom: 15px;
          }

          .focus-module-head {
            padding: 15px;
          }

          .focus-module-body {
            padding: 16px 13px 19px;
          }

          .focus-timer-area {
            width: 225px;
            height: 225px;
          }

          .focus-timer-ring {
            width: 225px;
            height: 225px;
          }

          .focus-settings {
            gap: 8px;
          }

          .focus-control-button {
            width: 49px;
            height: 49px;
          }

          .focus-controls-spacer {
            width: 49px;
            height: 49px;
          }

          .focus-main-button {
            width: 80px;
            height: 80px;
          }

          .focus-controls {
            gap: 14px;
          }
        }

        @media (max-width: 390px) {
          .focus-page {
            padding-left: 8px;
            padding-right: 8px;
          }

          .focus-module {
            border-radius: 18px;
          }

          .focus-settings {
            grid-template-columns: 1fr;
          }

          .focus-timer-area {
            width: 205px;
            height: 205px;
          }

          .focus-timer-ring {
            width: 205px;
            height: 205px;
          }

          .focus-time {
            font-size: 40px;
          }

          .focus-switch-button {
            min-height: 38px;
          }

          .focus-popup {
            padding: 30px 19px 21px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .focus-icon,
          .focus-popup,
          .focus-popup-overlay {
            animation: none;
          }

          .focus-main-button,
          .focus-control-button,
          .focus-switch-button,
          .focus-popup-button {
            transition: none;
          }
        }
      `}</style>

      <main className="focus-page">
        <div className="focus-container">
          <header className="focus-heading">
            <div className="focus-eyebrow">
              <Sparkles size={14} />
              ابزار تمرکز منتورا
            </div>

            <h1>حالت تمرکز عمیق</h1>

            <p>
              زمان مطالعه را مدیریت کن، حواس‌پرتی را کنار بگذار
              و قدم‌به‌قدم جلو برو.
            </p>
          </header>

          <section className="focus-module">
            {sessionSaveError && (
              <div className="focus-error" role="alert">
                <X size={14} />
                {sessionSaveError}
              </div>
            )}

            <div className="focus-module-head">
              <div className="focus-module-title">
                <Zap size={16} />
                تایمر پومودورو
              </div>

              <span
                className={`focus-mode-badge ${
                  isFocus ? "focus" : "break"
                }`}
              >
                {isFocus ? (
                  <Zap size={12} />
                ) : (
                  <Coffee size={12} />
                )}

                {isFocus
                  ? "در حالت تمرکز"
                  : "در حالت استراحت"}
              </span>
            </div>

            <div className="focus-module-body">
              <div className="focus-settings">
                <div className="focus-setting">
                  <label
                    className="focus-setting-label focus"
                    htmlFor="focus-minutes"
                  >
                    <Zap size={13} />
                    زمان مطالعه
                  </label>

                  <input
                    id="focus-minutes"
                    type="number"
                    min="1"
                    max="180"
                    value={focusMinutes}
                    onChange={handleFocusChange}
                    className="focus-time-input"
                    aria-label="مدت زمان مطالعه"
                  />

                  <div className="focus-setting-unit">
                    دقیقه
                  </div>
                </div>

                <div className="focus-setting">
                  <label
                    className="focus-setting-label break"
                    htmlFor="break-minutes"
                  >
                    <Coffee size={13} />
                    زمان استراحت
                  </label>

                  <input
                    id="break-minutes"
                    type="number"
                    min="1"
                    max="60"
                    value={breakMinutes}
                    onChange={handleBreakChange}
                    className="focus-time-input"
                    aria-label="مدت زمان استراحت"
                  />

                  <div className="focus-setting-unit">
                    دقیقه
                  </div>
                </div>
              </div>

              <div
                className="focus-switch"
                role="tablist"
                aria-label="انتخاب حالت تایمر"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isFocus}
                  onClick={() => switchMode("focus")}
                  className={`focus-switch-button ${
                    isFocus ? "active-focus" : ""
                  }`}
                >
                  <Zap size={15} />
                  تمرکز
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={!isFocus}
                  onClick={() => switchMode("break")}
                  className={`focus-switch-button ${
                    !isFocus ? "active-break" : ""
                  }`}
                >
                  <Coffee size={15} />
                  استراحت
                </button>
              </div>

              <div
                className="focus-timer-area"
                aria-label={`تایمر ${
                  isFocus ? "تمرکز" : "استراحت"
                } ${formatTime(seconds)}`}
              >
                <svg
                  className="focus-timer-ring"
                  viewBox="0 0 220 220"
                  aria-hidden="true"
                >
                  <circle
                    className="focus-ring-track"
                    cx="110"
                    cy="110"
                    r="100"
                  />

                  <circle
                    className="focus-ring-progress"
                    cx="110"
                    cy="110"
                    r="100"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference -
                      (circumference * progress) / 100
                    }
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                </svg>

                <div className="focus-timer-center">
                  <div className="focus-timer-icon">
                    {isFocus ? (
                      <Zap size={17} />
                    ) : (
                      <Coffee size={17} />
                    )}
                  </div>

                  <div className="focus-time">
                    {formatTime(seconds)}
                  </div>

                  <div className="focus-time-label">
                    {isFocus
                      ? "زمان مطالعه"
                      : "زمان استراحت"}
                  </div>
                </div>
              </div>

              <div className="focus-controls">
                <button
                  type="button"
                  onClick={resetTimer}
                  className="focus-control-button"
                  aria-label="شروع مجدد تایمر"
                  title="شروع مجدد"
                >
                  <RotateCcw size={20} />
                </button>

                <button
                  type="button"
                  onClick={toggleTimer}
                  className="focus-main-button"
                  aria-label={isActive ? "توقف تایمر" : "شروع تایمر"}
                  title={isActive ? "توقف" : "شروع"}
                >
                  {isActive ? (
                    <Pause size={31} fill="currentColor" />
                  ) : (
                    <Play size={31} fill="currentColor" />
                  )}
                </button>

                <div
                  className="focus-controls-spacer"
                  aria-hidden="true"
                />
              </div>

              <div className="focus-tip">
                <Target size={15} />

                <span>
                  {isFocus
                    ? "روی یک هدف مشخص تمرکز کن و تا پایان این بازه سراغ کار دیگری نرو."
                    : "چند دقیقه از صفحه فاصله بگیر و اجازه بده ذهنت برای دور بعدی آماده شود."}
                </span>
              </div>
            </div>

            <div className="focus-module-foot">
              {isActive
                ? "تایمر در حال اجراست؛ روی هدفت متمرکز بمان."
                : "وقتی آماده‌ای، دکمه شروع را بزن و وارد حالت تمرکز شو."}
            </div>
          </section>
        </div>
      </main>

      {showFinishPopup && (
        <div
          className="focus-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="focus-popup-title"
        >
          <div className="focus-popup">
            <button
              type="button"
              onClick={handleClosePopup}
              className="focus-popup-close"
              aria-label="بستن"
              title="بستن"
            >
              <X size={17} />
            </button>

            <div className="focus-popup-icon">
              <CheckCircle2 size={34} />
            </div>

            <div className="focus-popup-badge">
              <CheckCircle2 size={12} />
              مرحله با موفقیت تمام شد
            </div>

            <h3 id="focus-popup-title">
              {finishedMode === "focus"
                ? "جلسه تمرکزت تمام شد 🎉"
                : "استراحتت تمام شد، بزن بریم!"}
            </h3>

            <p>
              {finishedMode === "focus"
                ? "عالی بود! حالا چند دقیقه استراحت کن تا با انرژی بیشتری به مطالعه برگردی."
                : "ذهن و بدنت آماده‌اند. حالا می‌توانی یک دور تمرکز عمیق دیگر را شروع کنی."}
            </p>

            <div className="focus-next">
              <span className="focus-next-label">
                مرحله بعد
              </span>

              <span
                className="focus-next-value"
                style={{
                  color:
                    finishedMode === "focus"
                      ? "var(--success, #16a34a)"
                      : "var(--primary, #e53935)",
                }}
              >
                {finishedMode === "focus" ? (
                  <Coffee size={14} />
                ) : (
                  <Zap size={14} />
                )}

                {finishedMode === "focus"
                  ? "استراحت"
                  : "تمرکز"}
              </span>
            </div>

            <button
              type="button"
              className="focus-popup-button"
              onClick={handleClosePopup}
            >
              ادامه می‌دهم
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FocusTimer;