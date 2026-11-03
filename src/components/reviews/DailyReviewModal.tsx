import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../utils/storage';
import { DailyReview } from '../../types';
import { getTodayIso, formatJalaliFull, formatGregorianFull, toPersianDigits } from '../../utils/calendar';
import { X, Sparkles, Smile, BatteryCharging, Zap, Target, Moon, Award, Calendar } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface DailyReviewModalProps {
  customDate?: string;
}

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({ customDate }) => {
  const { isDailyReviewOpen, closeDailyReview, triggerRefresh, showToast, settings, t, isRtl } = useApp();

  const [date, setDate] = useState(customDate || getTodayIso());
  const [satisfaction, setSatisfaction] = useState(80);
  const [mood, setMood] = useState(80);
  const [energy, setEnergy] = useState(75);
  const [focus, setFocus] = useState(80);
  const [productivity, setProductivity] = useState(75);
  const [sleepQuality, setSleepQuality] = useState(85);
  const [notes, setNotes] = useState('');
  const [winInput, setWinInput] = useState('');
  const [wins, setWins] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isDailyReviewOpen) return;
    const targetDate = customDate || getTodayIso();
    setDate(targetDate);

    (async () => {
      const existing = await db.getDailyReviewByDate(targetDate);
      if (existing) {
        setSatisfaction(existing.satisfaction);
        setMood(existing.mood);
        setEnergy(existing.energy);
        setFocus(existing.focus);
        setProductivity(existing.productivity);
        setSleepQuality(existing.sleepQuality);
        setNotes(existing.notes || '');
        setWins(existing.wins || []);
      } else {
        setSatisfaction(80);
        setMood(80);
        setEnergy(75);
        setFocus(80);
        setProductivity(75);
        setSleepQuality(80);
        setNotes('');
        setWins([]);
      }
    })();
  }, [isDailyReviewOpen, customDate]);

  if (!isDailyReviewOpen) return null;

  const handleAddWin = () => {
    if (winInput.trim()) {
      setWins([...wins, winInput.trim()]);
      setWinInput('');
    }
  };

  const handleRemoveWin = (idx: number) => {
    setWins(wins.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const review: DailyReview = {
        id: date,
        date,
        satisfaction,
        mood,
        energy,
        focus,
        productivity,
        sleepQuality,
        notes: notes.trim() || undefined,
        wins,
        updatedAt: new Date().toISOString(),
      };
      await db.saveDailyReview(review);
      triggerRefresh();
      showToast(t.reviewSaved);
      closeDailyReview();
    } catch (err) {
      console.error(err);
      showToast('خطا در ذخیره مرور روزانه');
    } finally {
      setIsSaving(false);
    }
  };

  const averageScore = Math.round(
    (satisfaction + mood + energy + focus + productivity + sleepQuality) / 6
  );

  const metricsConfig = [
    {
      id: 'satisfaction',
      label: t.satisfaction,
      val: satisfaction,
      setter: setSatisfaction,
      icon: Award,
      color: 'from-[#91A8FF] to-[#7C5CFC]',
      textColor: 'text-[#91A8FF]',
    },
    {
      id: 'mood',
      label: t.mood,
      val: mood,
      setter: setMood,
      icon: Smile,
      color: 'from-[#35D6A0] to-[#91A8FF]',
      textColor: 'text-[#35D6A0]',
    },
    {
      id: 'energy',
      label: t.energy,
      val: energy,
      setter: setEnergy,
      icon: BatteryCharging,
      color: 'from-[#FFBD69] to-[#FF6B82]',
      textColor: 'text-[#FFBD69]',
    },
    {
      id: 'focus',
      label: t.focusMetric,
      val: focus,
      setter: setFocus,
      icon: Zap,
      color: 'from-[#7C5CFC] to-[#91A8FF]',
      textColor: 'text-[#7C5CFC]',
    },
    {
      id: 'productivity',
      label: t.productivity,
      val: productivity,
      setter: setProductivity,
      icon: Target,
      color: 'from-[#91A8FF] to-[#35D6A0]',
      textColor: 'text-[#91A8FF]',
    },
    {
      id: 'sleepQuality',
      label: t.sleepQuality,
      val: sleepQuality,
      setter: setSleepQuality,
      icon: Moon,
      color: 'from-[#7C5CFC] to-[#38BDF8]',
      textColor: 'text-[#38BDF8]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[92vh] glass-panel rounded-3xl p-5 sm:p-6 border border-[#91A8FF]/30 shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#91A8FF]/20 to-[#7C5CFC]/20 border border-[#91A8FF]/30 flex items-center justify-center text-[#91A8FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.dailyReview}</h2>
              <p className="text-xs text-slate-400">
                {settings.calendarSystem === 'jalali'
                  ? formatJalaliFull(date, isRtl)
                  : formatGregorianFull(date)}
              </p>
            </div>
          </div>
          <button
            onClick={closeDailyReview}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Average Score Banner */}
        <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-[#91A8FF]/10 via-[#7C5CFC]/10 to-[#35D6A0]/10 border border-[#91A8FF]/25 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">میانگین کیفیت امروز</span>
          <div className="flex items-center gap-1.5 font-mono text-base font-extrabold text-[#91A8FF]">
            <span>{isRtl ? toPersianDigits(averageScore) : averageScore}</span>
            <span className="text-xs text-slate-400">/ ۱۰۰</span>
          </div>
        </div>

        {/* 6 Metrics Sliders */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
          <div className="space-y-3.5">
            {metricsConfig.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      <Icon className={`w-4 h-4 ${m.textColor}`} />
                      <span>{m.label}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-white">
                      {isRtl ? toPersianDigits(m.val) : m.val}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={m.val}
                    onChange={(e) => m.setter(Number(e.target.value))}
                    className="w-full accent-[#91A8FF] h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* Wins / Handled Challenges */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-300">
              دستاوردها یا نکات مثبت امروز (Wins)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={winInput}
                onChange={(e) => setWinInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWin();
                  }
                }}
                placeholder={isRtl ? 'یک نکته مثبت یا پیروزی امروز...' : 'A highlight or win today...'}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddWin}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
              >
                ثبت
              </button>
            </div>
            {wins.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {wins.map((w, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#35D6A0]/15 text-[#35D6A0] text-xs border border-[#35D6A0]/25 font-medium"
                  >
                    <span>✓ {w}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWin(idx)}
                      className="hover:text-white"
                      aria-label="حذف"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              یادداشت و جمع‌بندی روز
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRtl ? 'تأملات، سپاسگزاری‌ها و درس‌آموخته‌های امروز...' : 'Reflections and lessons from today...'}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <GlassButton variant="ghost" size="sm" onClick={closeDailyReview}>
            {t.cancel}
          </GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
          >
            {t.save}
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
