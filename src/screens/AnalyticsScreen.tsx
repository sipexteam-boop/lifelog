import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { Task, Habit, HabitLog, Goal, DailyReview, SleepSession, FocusSession } from '../types';
import { getTodayIso, formatIsoDate, toPersianDigits } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Moon,
  Smile,
  Zap,
  Target,
  Flame,
  Calendar,
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { dataVersion, t, isRtl } = useApp();

  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('7days');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [allTasks, allHabits, allLogs, allReviews, allSleep, allFocus, allGoals] =
        await Promise.all([
          db.getTasks(),
          db.getHabits(),
          db.getHabitLogs(),
          db.getDailyReviews(),
          db.getSleepSessions(),
          db.getFocusSessions(),
          db.getGoals(),
        ]);
      if (isMounted) {
        setTasks(allTasks);
        setHabits(allHabits);
        setHabitLogs(allLogs);
        setReviews(allReviews);
        setSleepSessions(allSleep);
        setFocusSessions(allFocus);
        setGoals(allGoals);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [dataVersion]);

  // Compute date threshold
  const daysCount = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
  const thresholdIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - daysCount);
    return formatIsoDate(d);
  }, [daysCount]);

  // Filtered collections
  const filteredTasks = useMemo(
    () => tasks.filter((t) => t.plannedDate >= thresholdIso),
    [tasks, thresholdIso]
  );
  const filteredReviews = useMemo(
    () => reviews.filter((r) => r.date >= thresholdIso).sort((a, b) => a.date.localeCompare(b.date)),
    [reviews, thresholdIso]
  );
  const filteredSleep = useMemo(
    () => sleepSessions.filter((s) => s.date >= thresholdIso && !s.isActive),
    [sleepSessions, thresholdIso]
  );
  const filteredFocus = useMemo(
    () => focusSessions.filter((f) => f.startTime >= thresholdIso),
    [focusSessions, thresholdIso]
  );

  // Key Aggregates
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalFocusMinutes = filteredFocus.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  const averageSleepDurationMinutes =
    filteredSleep.length > 0
      ? Math.round(filteredSleep.reduce((acc, s) => acc + s.durationMinutes, 0) / filteredSleep.length)
      : 0;

  const averageSleepQuality =
    filteredSleep.length > 0
      ? Math.round(filteredSleep.reduce((acc, s) => acc + s.quality, 0) / filteredSleep.length)
      : 0;

  const averageMood =
    filteredReviews.length > 0
      ? Math.round(filteredReviews.reduce((acc, r) => acc + r.mood, 0) / filteredReviews.length)
      : 0;

  const averageEnergy =
    filteredReviews.length > 0
      ? Math.round(filteredReviews.reduce((acc, r) => acc + r.energy, 0) / filteredReviews.length)
      : 0;

  const averageProductivity =
    filteredReviews.length > 0
      ? Math.round(filteredReviews.reduce((acc, r) => acc + r.productivity, 0) / filteredReviews.length)
      : 0;

  // Category breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of filteredTasks) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [filteredTasks]);

  // Daily Trend points for SVG line chart (Past 7 days)
  const past7DaysData = useMemo(() => {
    const list: { date: string; label: string; productivity: number; mood: number; energy: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = formatIsoDate(d);
      const rev = reviews.find((r) => r.date === iso);
      list.push({
        date: iso,
        label: iso.substring(5),
        productivity: rev ? rev.productivity : 0,
        mood: rev ? rev.mood : 0,
        energy: rev ? rev.energy : 0,
      });
    }
    return list;
  }, [reviews]);

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Title & Range Switcher */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{t.analytics}</h2>
          <span className="text-xs text-slate-400">تحلیل جامع عملکرد، انرژی و تعادل زندگی</span>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center p-1 rounded-2xl glass-panel text-xs border border-white/10">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              timeRange === '7days' ? 'bg-[#91A8FF] text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            ۷ روز
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              timeRange === '30days' ? 'bg-[#91A8FF] text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            ۳۰ روز
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              timeRange === 'all' ? 'bg-[#91A8FF] text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            کل دوره
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Task Completion Rate */}
        <GlassCard glow="blue" className="p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">{t.completionRate}</span>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              {isRtl ? toPersianDigits(taskCompletionRate) : taskCompletionRate}%
            </p>
            <span className="text-[10px] text-slate-400">
              {completedTasks} از {totalTasks} کار
            </span>
          </div>
        </GlassCard>

        {/* Focus Time */}
        <GlassCard glow="purple" className="p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">ساعات تمرکز</span>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              {isRtl ? toPersianDigits(totalFocusHours) : totalFocusHours}{' '}
              <span className="text-xs text-slate-400">ساعت</span>
            </p>
            <span className="text-[10px] text-slate-400">
              {filteredFocus.length} جلسه عمیق
            </span>
          </div>
        </GlassCard>

        {/* Average Sleep */}
        <GlassCard glow="green" className="p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center mb-1">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">{t.averageSleep}</span>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              {Math.floor(averageSleepDurationMinutes / 60)}h{' '}
              {averageSleepDurationMinutes % 60}m
            </p>
            <span className="text-[10px] text-[#35D6A0]">
              کیفیت {averageSleepQuality}%
            </span>
          </div>
        </GlassCard>

        {/* Average Productivity */}
        <GlassCard glow="amber" className="p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-[#FFBD69]/20 text-[#FFBD69] flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">میانگین بهره‌وری</span>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              {isRtl ? toPersianDigits(averageProductivity) : averageProductivity}%
            </p>
            <span className="text-[10px] text-slate-400">از مرورهای ثبت‌شده</span>
          </div>
        </GlassCard>
      </div>

      {/* SVG Interactive Multi-Line Trend Chart (Productivity, Mood, Energy) */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#91A8FF]" />
            <span>روند ۷ روز اخیر (بهره‌وری، حال روحی، انرژی)</span>
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-[#91A8FF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#91A8FF]" /> بهره‌وری
            </span>
            <span className="flex items-center gap-1 text-[#35D6A0]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35D6A0]" /> حال روحی
            </span>
            <span className="flex items-center gap-1 text-[#FFBD69]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD69]" /> انرژی
            </span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="h-44 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 350 140">
            {/* Grid Lines */}
            <line x1="0" y1="20" x2="350" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="350" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="350" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

            {/* Path for Productivity */}
            <polyline
              fill="none"
              stroke="#91A8FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={past7DaysData
                .map((d, i) => {
                  const x = (i / 6) * 330 + 10;
                  const y = 120 - (d.productivity / 100) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Path for Mood */}
            <polyline
              fill="none"
              stroke="#35D6A0"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={past7DaysData
                .map((d, i) => {
                  const x = (i / 6) * 330 + 10;
                  const y = 120 - (d.mood / 100) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Path for Energy */}
            <polyline
              fill="none"
              stroke="#FFBD69"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={past7DaysData
                .map((d, i) => {
                  const x = (i / 6) * 330 + 10;
                  const y = 120 - (d.energy / 100) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Node dots */}
            {past7DaysData.map((d, i) => {
              const x = (i / 6) * 330 + 10;
              const yProd = 120 - (d.productivity / 100) * 100;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={yProd}
                  r="3.5"
                  fill="#070A12"
                  stroke="#91A8FF"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 px-2">
          {past7DaysData.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </GlassCard>

      {/* Category Breakdown & Goals Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Categories Distribution */}
        <GlassCard className="p-4">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#7C5CFC]" />
            <span>توزیع موضوعی کارها (Category Distribution)</span>
          </h3>

          <div className="space-y-2.5">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">کاری برای نمایش وجود ندارد.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = Math.round((count / totalTasks) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{t[cat as keyof typeof t] || cat}</span>
                      <span className="font-mono text-slate-400">
                        {count} مورد ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Goals Progress */}
        <GlassCard className="p-4">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#35D6A0]" />
            <span>پیشرفت اهداف استراتژیک (Goals)</span>
          </h3>

          <div className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">هدفی ثبت نشده است.</p>
            ) : (
              goals.slice(0, 3).map((g) => (
                <div key={g.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white truncate max-w-[70%]">{g.title}</span>
                    <span className="font-mono text-[#35D6A0] font-bold">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#35D6A0] h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>
                      گام‌ها: {g.milestones.filter((m) => m.completed).length} / {g.milestones.length}
                    </span>
                    <span>هدف: {g.targetDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
