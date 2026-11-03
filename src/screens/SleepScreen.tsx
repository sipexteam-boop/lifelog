import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { SleepSession } from '../types';
import { getTodayIso, formatJalaliFull, formatGregorianFull, toPersianDigits } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import {
  Moon,
  Sun,
  Play,
  Square,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  TrendingUp,
  X,
  Calendar,
} from 'lucide-react';

export const SleepScreen: React.FC = () => {
  const { dataVersion, triggerRefresh, showToast, settings, t, isRtl } = useApp();

  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeSession, setActiveSession] = useState<SleepSession | null>(null);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);

  // End sleep modal
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [endQuality, setEndQuality] = useState(85);
  const [endNotes, setEndNotes] = useState('');

  // Manual entry modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDate, setManualDate] = useState(getTodayIso());
  const [manualBedtime, setManualBedtime] = useState('23:30');
  const [manualWakeTime, setManualWakeTime] = useState('07:30');
  const [manualQuality, setManualQuality] = useState(80);
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await db.getSleepSessions();
      if (!isMounted) return;
      setSessions(all);
      const active = all.find((s) => s.isActive) || null;
      setActiveSession(active);
    })();
    return () => {
      isMounted = false;
    };
  }, [dataVersion]);

  // Live timer for active sleep session
  useEffect(() => {
    if (!activeSession) return;
    const updateElapsed = () => {
      const start = new Date(activeSession.bedtime).getTime();
      const now = Date.now();
      setLiveElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSleep = async () => {
    try {
      const session = await db.startSleepSession();
      setActiveSession(session);
      triggerRefresh();
      showToast('جلسه خواب با موفقیت آغاز شد. خوابی آرام داشته باشید! 🌙');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت شروع خواب');
    }
  };

  const handleConfirmEndSleep = async () => {
    if (!activeSession) return;
    try {
      await db.endSleepSession(activeSession.id, endQuality, endNotes.trim() || undefined);
      setIsEndModalOpen(false);
      setActiveSession(null);
      triggerRefresh();
      showToast('جلسه خواب با موفقیت ذخیره شد. صبح بخیر! ☀️');
    } catch (err) {
      console.error(err);
      showToast('خطا در پایان جلسه خواب');
    }
  };

  const handleSaveManual = async () => {
    try {
      const bedDateTime = new Date(`${manualDate}T${manualBedtime}:00`);
      // If wake time is earlier than bedtime, it is next morning
      let wakeDateTime = new Date(`${manualDate}T${manualWakeTime}:00`);
      if (wakeDateTime <= bedDateTime) {
        wakeDateTime = new Date(wakeDateTime.getTime() + 24 * 60 * 60 * 1000);
      }
      const durationMins = Math.max(0, Math.round((wakeDateTime.getTime() - bedDateTime.getTime()) / 60000));

      const session: SleepSession = {
        id: `sleep_manual_${Date.now()}`,
        date: manualDate,
        bedtime: bedDateTime.toISOString(),
        wakeTime: wakeDateTime.toISOString(),
        durationMinutes: durationMins,
        quality: manualQuality,
        notes: manualNotes.trim() || undefined,
        isActive: false,
        createdAt: new Date().toISOString(),
      };

      await db.saveManualSleepSession(session);
      setIsManualModalOpen(false);
      triggerRefresh();
      showToast('رکورد خواب با موفقیت ثبت شد.');
    } catch (err) {
      console.error(err);
      showToast('خطا در ثبت رکورد');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm('آیا از حذف این رکورد خواب اطمینان دارید؟')) {
      await db.deleteSleepSession(id);
      triggerRefresh();
      showToast('رکورد خواب حذف شد.');
    }
  };

  // Aggregates
  const endedSessions = sessions.filter((s) => !s.isActive);
  const avgDurationMinutes =
    endedSessions.length > 0
      ? Math.round(endedSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / endedSessions.length)
      : 0;
  const avgQuality =
    endedSessions.length > 0
      ? Math.round(endedSessions.reduce((acc, s) => acc + s.quality, 0) / endedSessions.length)
      : 0;

  const liveHours = Math.floor(liveElapsedSeconds / 3600);
  const liveMins = Math.floor((liveElapsedSeconds % 3600) / 60);
  const liveSecs = liveElapsedSeconds % 60;

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Title & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38BDF8]/20 to-[#7C5CFC]/20 text-[#38BDF8] flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{t.sleep}</h2>
            <span className="text-xs text-slate-400">ثبت چرخه خواب و پایش بازیابی شبانه</span>
          </div>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="px-3.5 py-2 rounded-xl glass-panel border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.manualSleepEntry}</span>
        </button>
      </div>

      {/* Active Sleep Session Banner / Trigger */}
      {activeSession ? (
        <GlassCard glow="blue" className="p-5 border-[#38BDF8]/40 bg-[#38BDF8]/10 text-center space-y-3">
          <span className="text-xs font-bold text-[#38BDF8] flex items-center justify-center gap-1.5 animate-pulse">
            <Moon className="w-4 h-4" /> {t.activeSleepSession}
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
            {String(liveHours).padStart(2, '0')}:{String(liveMins).padStart(2, '0')}:
            {String(liveSecs).padStart(2, '0')}
          </div>
          <p className="text-xs text-slate-400">
            زمان شروع:{' '}
            {new Date(activeSession.bedtime).toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <button
            onClick={() => setIsEndModalOpen(true)}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#35D6A0] to-[#38BDF8] text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
          >
            <Sun className="w-4 h-4" />
            <span>{t.wakeUp}</span>
          </button>
        </GlassCard>
      ) : (
        <GlassCard className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">آماده خواب شبانه هستید؟</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              با زدن دکمه شروع، تایمر خواب فعال شده و مدت دقیق تا زمان بیداری محاسبه می‌شود.
            </p>
          </div>
          <button
            onClick={handleStartSleep}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#91A8FF] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(145,168,255,0.3)] hover:brightness-110 active:scale-95 transition cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.startSleep}</span>
          </button>
        </GlassCard>
      )}

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard glow="green" className="p-4 text-center">
          <span className="text-xs font-semibold text-slate-400">{t.averageSleep}</span>
          <p className="text-xl font-black text-white font-mono mt-1">
            {Math.floor(avgDurationMinutes / 60)}h {avgDurationMinutes % 60}m
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5">بر مبنای رکوردهای ثبت‌شده</span>
        </GlassCard>

        <GlassCard glow="purple" className="p-4 text-center">
          <span className="text-xs font-semibold text-slate-400">میانگین کیفیت خواب</span>
          <p className="text-xl font-black text-[#38BDF8] font-mono mt-1">
            {isRtl ? toPersianDigits(avgQuality) : avgQuality}%
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5">ارزیابی ذهنی و بدنی</span>
        </GlassCard>
      </div>

      {/* Sleep History Feed */}
      <GlassCard className="p-4 sm:p-5">
        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#91A8FF]" />
          <span>تاریخچه شب‌های گذشته</span>
        </h3>

        {endedSessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">رکوردی برای خواب ثبت نشده است.</p>
        ) : (
          <div className="space-y-2.5">
            {endedSessions.map((session) => {
              const hours = Math.floor(session.durationMinutes / 60);
              const mins = session.durationMinutes % 60;
              return (
                <div
                  key={session.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white font-mono">
                        {settings.calendarSystem === 'jalali'
                          ? formatJalaliFull(session.date, isRtl)
                          : formatGregorianFull(session.date)}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(session.bedtime).toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        تا{' '}
                        {session.wakeTime
                          ? new Date(session.wakeTime).toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                      {session.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{session.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-end font-mono">
                      <span className="text-sm font-black text-white">
                        {hours}h {mins}m
                      </span>
                      <p className="text-[10px] text-[#35D6A0]">کیفیت: {session.quality}%</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1 text-slate-500 hover:text-[#FF6B82] transition"
                      aria-label="حذف رکورد خواب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* End Sleep Modal (Quality & Notes) */}
      {isEndModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-[#38BDF8]/40 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-[#FFBD69]" />
              <span>پایان خواب و ارزیابی کیفیت</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>کیفیت خواب</span>
                <span className="font-mono text-[#38BDF8]">{endQuality}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={endQuality}
                onChange={(e) => setEndQuality(Number(e.target.value))}
                className="w-full accent-[#38BDF8] h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">یادداشت بیداری</label>
              <textarea
                rows={2}
                value={endNotes}
                onChange={(e) => setEndNotes(e.target.value)}
                placeholder="آیا احساس سرحالی دارید؟ آیا رویا یا بیداری مکرر داشتید؟"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setIsEndModalOpen(false)}>
                انصراف
              </GlassButton>
              <GlassButton variant="primary" size="sm" onClick={handleConfirmEndSleep}>
                ثبت و پایان
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Manual Sleep Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">ثبت دستی رکورد خواب</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">تاریخ شب</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-300 mb-1">ساعت خواب</label>
                <input
                  type="time"
                  value={manualBedtime}
                  onChange={(e) => setManualBedtime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">ساعت بیداری</label>
                <input
                  type="time"
                  value={manualWakeTime}
                  onChange={(e) => setManualWakeTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>کیفیت خواب</span>
                <span className="font-mono text-[#38BDF8]">{manualQuality}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={manualQuality}
                onChange={(e) => setManualQuality(Number(e.target.value))}
                className="w-full accent-[#38BDF8] h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">یادداشت</label>
              <textarea
                rows={2}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="توضیحات اختیاری..."
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setIsManualModalOpen(false)}>
                انصراف
              </GlassButton>
              <GlassButton variant="primary" size="sm" onClick={handleSaveManual}>
                ذخیره
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
