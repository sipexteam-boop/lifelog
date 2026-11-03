import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../utils/storage';
import { Task, FocusSession } from '../../types';
import { X, Play, Pause, Square, RotateCcw, Timer, CheckCircle2, History } from 'lucide-react';
import { toPersianDigits } from '../../utils/calendar';

export const FocusTimerModal: React.FC = () => {
  const { isFocusModalOpen, closeFocusModal, triggerRefresh, showToast, t, isRtl } = useApp();

  const [mode, setMode] = useState<'pomodoro' | 'deep' | 'shortBreak' | 'longBreak' | 'custom'>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'timer' | 'history'>('timer');
  const [pastSessions, setPastSessions] = useState<FocusSession[]>([]);

  const sessionStartTimeRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Load tasks and past sessions
  useEffect(() => {
    if (!isFocusModalOpen) return;
    (async () => {
      const allTasks = await db.getTasks();
      setTasks(allTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled'));
      const sessions = await db.getFocusSessions();
      setPastSessions(sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    })();
  }, [isFocusModalOpen]);

  // Mode changes
  const switchMode = (newMode: typeof mode, minutes: number) => {
    if (isRunning) {
      if (!confirm('جلسه جاری لغو خواهد شد. ادامه می‌دهید؟')) return;
    }
    stopTimer();
    setMode(newMode);
    setTotalSeconds(minutes * 60);
    setSecondsRemaining(minutes * 60);
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    sessionStartTimeRef.current = Date.now();
  };

  const pauseTimer = () => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    if (sessionStartTimeRef.current) {
      const now = Date.now();
      elapsedBeforePauseRef.current += Math.floor((now - sessionStartTimeRef.current) / 1000);
    }
  };

  const resumeTimer = () => {
    if (!isRunning || !isPaused) return;
    setIsPaused(false);
    sessionStartTimeRef.current = Date.now();
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    sessionStartTimeRef.current = null;
    elapsedBeforePauseRef.current = 0;
    setSecondsRemaining(totalSeconds);
  };

  // Timer tick effect with high accuracy based on timestamps
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        if (!sessionStartTimeRef.current) return;
        const now = Date.now();
        const currentSegmentElapsed = Math.floor((now - sessionStartTimeRef.current) / 1000);
        const totalElapsed = elapsedBeforePauseRef.current + currentSegmentElapsed;
        const remaining = Math.max(0, totalSeconds - totalElapsed);

        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          // Completed session
          handleSessionCompleted();
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, totalSeconds]);

  const handleSessionCompleted = async () => {
    stopTimer();
    const durationMins = Math.round(totalSeconds / 60);
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);

    const session: FocusSession = {
      id: `fs_${Date.now()}`,
      taskId: selectedTaskId || undefined,
      taskTitle: selectedTask?.title || undefined,
      category: selectedTask?.category || 'work',
      startTime: new Date(Date.now() - totalSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: durationMins,
      completed: true,
    };

    await db.saveFocusSession(session);

    // If task was associated, increment its focusMinutesTotal
    if (selectedTaskId && selectedTask) {
      selectedTask.focusMinutesTotal = (selectedTask.focusMinutesTotal || 0) + durationMins;
      await db.saveTask(selectedTask);
    }

    triggerRefresh();
    showToast(`جلسه تمرکز (${durationMins} دقیقه) با موفقیت ثبت شد! 🎉`);
  };

  if (!isFocusModalOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const circleRadius = 90;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md max-h-[92vh] glass-panel rounded-3xl p-5 sm:p-6 border border-[#91A8FF]/30 shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC]/20 to-[#91A8FF]/20 border border-[#7C5CFC]/30 flex items-center justify-center text-[#91A8FF]">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.focus}</h2>
              <span className="text-[11px] text-slate-400">کار عمیق و انضباط فردی</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab(activeTab === 'timer' ? 'history' : 'timer')}
              className={`p-1.5 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-[#91A8FF]/20 border-[#91A8FF]/40 text-[#91A8FF]'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
              title="تاریخچه جلسات"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={closeFocusModal}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'history' ? (
          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 mb-2">جلسات تمرکز ثبت‌شده</h3>
            {pastSessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">هنوز جلسه تمرکزی ثبت نشده است.</p>
            ) : (
              pastSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{s.taskTitle || 'جلسه کار عمیق آزاد'}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {s.startTime.split('T')[0]} • {s.startTime.split('T')[1].substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[#91A8FF] font-bold">
                    <span>{isRtl ? toPersianDigits(s.durationMinutes) : s.durationMinutes}</span>
                    <span className="text-[10px] text-slate-400">{t.minutes}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 text-xs w-full max-w-sm justify-between">
              <button
                onClick={() => switchMode('pomodoro', 25)}
                className={`flex-1 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  mode === 'pomodoro'
                    ? 'bg-[#91A8FF] text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ۲۵دقیقه
              </button>
              <button
                onClick={() => switchMode('deep', 50)}
                className={`flex-1 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  mode === 'deep'
                    ? 'bg-[#7C5CFC] text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ۵۰دقیقه
              </button>
              <button
                onClick={() => switchMode('shortBreak', 5)}
                className={`flex-1 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  mode === 'shortBreak'
                    ? 'bg-[#35D6A0] text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                استراحت ۵د
              </button>
              <button
                onClick={() => switchMode('longBreak', 15)}
                className={`flex-1 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  mode === 'longBreak'
                    ? 'bg-[#FFBD69] text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                استراحت ۱۵د
              </button>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-56 h-56 flex items-center justify-center my-2">
              <svg width="224" height="224" className="-rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r={circleRadius}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="112"
                  cy="112"
                  r={circleRadius}
                  stroke="#91A8FF"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500 ease-linear"
                  style={{
                    filter: isRunning ? 'drop-shadow(0 0 10px rgba(145, 168, 255, 0.5))' : undefined,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                  {isRtl ? toPersianDigits(timeFormatted) : timeFormatted}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {isRunning ? (isPaused ? 'متوقف‌شده' : 'در حال تمرکز') : 'آماده شروع'}
                </span>
              </div>
            </div>

            {/* Task Link Selection */}
            <div className="w-full max-w-sm mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.selectTask}
              </label>
              <select
                disabled={isRunning}
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#101521]"
              >
                <option value="">بدون اتصال به کار خاص</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-6">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(145,168,255,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t.startFocus}</span>
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeTimer}
                      className="h-12 px-5 rounded-2xl bg-[#35D6A0] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>{t.resumeFocus}</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="h-12 px-5 rounded-2xl bg-[#FFBD69] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      <Pause className="w-5 h-5 fill-current" />
                      <span>{t.pauseFocus}</span>
                    </button>
                  )}

                  <button
                    onClick={stopTimer}
                    className="h-12 px-4 rounded-2xl bg-white/10 hover:bg-[#FF6B82]/20 text-slate-300 hover:text-[#FF6B82] border border-white/10 font-bold text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title={t.stopFocus}
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>لغو</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
