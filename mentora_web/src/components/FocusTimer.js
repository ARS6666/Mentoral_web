import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Zap } from 'lucide-react';

const FocusTimer = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const timerRef = useRef(null);

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - seconds) / totalTime) * 100;

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      alert(mode === 'focus' ? "زمان تمرکز تمام شد! وقت استراحته." : "استراحت تمام شد! آماده‌ای؟");
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setSeconds(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container py-5 d-flex justify-content-center" style={{ direction: 'rtl', fontFamily: 'Vazir, Tahoma, sans-serif' }}>
      <div className="card border-0 shadow-lg" style={{ borderRadius: '40px', maxWidth: '400px', width: '100%', background: '#fff' }}>
        <div className="card-body p-5 text-center">
          
          {/* Header */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#1f2937' }}>حالت تمرکز عمیق</h2>
            <p className="text-muted" style={{ fontSize: '13px' }}>ذهنت رو روی هدف قفل کن</p>
          </div>

          {/* Mode Switcher */}
          <div className="d-flex justify-content-center gap-2 mb-5 bg-light p-2" style={{ borderRadius: '20px' }}>
            <button 
              onClick={() => switchMode('focus')}
              className={`btn btn-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${mode === 'focus' ? 'bg-white shadow-sm fw-bold' : 'text-muted'}`}
              style={{ borderRadius: '15px', transition: '0.3s', color: mode === 'focus' ? '#6255f5' : '#6b7280' }}
            >
              <Zap size={16} /> تمرکز
            </button>
            <button 
              onClick={() => switchMode('break')}
              className={`btn btn-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${mode === 'break' ? 'bg-white shadow-sm fw-bold' : 'text-muted'}`}
              style={{ borderRadius: '15px', transition: '0.3s', color: mode === 'break' ? '#10b981' : '#6b7280' }}
            >
              <Coffee size={16} /> استراحت
            </button>
          </div>

          {/* Circular Progress & Timer */}
          <div className="position-relative d-flex justify-content-center align-items-center mb-5">
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="100" fill="none" stroke="#f1f3f5" strokeWidth="8" />
              <circle 
                cx="110" cy="110" r="100" fill="none" 
                stroke={mode === 'focus' ? '#6255f5' : '#10b981'} 
                strokeWidth="8" 
                strokeDasharray="628" 
                strokeDashoffset={628 - (628 * progress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <div className="position-absolute text-center">
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#1f2937', letterSpacing: '-1px' }}>
                {formatTime(seconds)}
              </div>
              <div className="text-muted fw-bold" style={{ fontSize: '12px' }}>
                {mode === 'focus' ? 'زمان مطالعه' : 'زمان استراحت'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="d-flex justify-content-center align-items-center gap-4">
            <button 
              onClick={resetTimer}
              className="btn border-0 p-3" 
              style={{ borderRadius: '50%', background: '#f8f9fa', color: '#6b7280' }}
            >
              <RotateCcw size={24} />
            </button>

            <button 
              onClick={toggleTimer}
              className="btn d-flex align-items-center justify-content-center shadow-lg"
              style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                background: mode === 'focus' ? '#6255f5' : '#10b981', 
                color: 'white', border: 'none' 
              }}
            >
              {isActive ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" style={{ marginLeft: '-4px' }} />}
            </button>

            <div className="p-3" style={{ opacity: 0 }}>
              <RotateCcw size={24} />
            </div>
          </div>

          {/* Motivational Tip */}
          <div className="mt-5 p-3" style={{ background: 'rgba(98, 85, 245, 0.05)', borderRadius: '20px' }}>
             <p className="mb-0 text-dark" style={{ fontSize: '11px', fontWeight: '500' }}>
               <Target size={14} className="me-1" style={{ color: '#6255f5' }} />
               بیشترین تمرکز در ۲۵ دقیقه اول اتفاق می‌افتد.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
