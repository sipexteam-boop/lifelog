import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { Task, Habit, HabitLog, DailyReview, SleepSession, FocusSession } from '../types';
import { getTodayIso, formatJalaliFull, formatGregorianFull, toPersianDigits } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import { CircularProgress } from '../components/common/ProgressBar';
import { PWAInstallBanner } from '../components/common/PWAInstallBanner';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Moon,
  Timer,
  AlertTriangle,
  Plus,
  BookOpen,
  TrendingUp,
  Smile,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const TodayScreen: React.FC = () => {
  const {
    openTaskModal,
    openDailyReview,
    openFocusModal,
    openSubView,
    dataVersion,
    triggerRefresh,
    settings,
    t,
    isRtl,
  } = useApp();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [todayReview, setTodayReview] = useState<DailyReview | null>(null);
  const [lastSleep, setLastSleep] = useState<SleepSession | null>(null);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayIso = getTodayIso();

  // Load all today's data from IndexedDB
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const [allTasks, allHabits, allLogs, review, sleepLogs, allFocus] = await Promise.all([
          db.getTasks(),
          db.getHabits(),
          db.getHabitLogs(),
          db.getDailyReviewByDate(todayIso),
          db.getSleepSessions(),
          db.getFocusSessions(),
        ]);

        if (!isMounted) return;
        setTasks(allTasks);
        setHabits(allHabits.filter((h) => !h.archived));
        setHabitLogs(allLogs.filter((l) => l.date === todayIso));
        setTodayReview(review);
        // Latest ended sleep session
        const endedSleep = sleepLogs.filter((s) => !s.isActive);
        setLastSleep(endedSleep.length > 0 ? endedSleep[0] : null);
        // Focus sessions today
        setFocusSessions(allFocus.filter((f) => f.startTime.startsWith(todayIso)));
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dataVersion, todayIso]);

  // Calculations
  const todayTasks = tasks.filter((t) => t.plannedDate === todayIso);
  const overdueTasks = tasks.filter(
    (t) => t.plannedDate < todayIso && t.status !== 'completed' && t.status !== 'cancelled'
  );
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  
  // Habits completed today
  const completedHabitCount = habitLogs.filter((l) => l.completed).length;
  const totalHabitsCount = habits.length;

  // Completion percentage
  const totalItemsCount = todayTasks.length + totalHabitsCount;
  const completedItemsCount = completedTodayTasks.length + completedHabitCount;
  const completionPercentage =
    totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 100;

  // Total focus minutes today
  const focusMinutesToday = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Dynamic Productivity Score (0-100)
  const taskFactor = todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 40 : 35;
  const habitFactor = totalHabitsCount > 0 ? (completedHabitCount / totalHabitsCount) * 30 : 25;
  const focusFactor = Math.min(30, Math.round((focusMinutesToday / 90) * 30));
  const productivityScore = Math.min(100, Math.round(taskFactor + habitFactor + focusFactor));

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.morningGreeting;
    if (hour < 16) return t.afternoonGreeting;
    if (hour < 20) return t.eveningGreeting;
    return t.nightGreeting;
  };

  const handleToggleHabit = async (habitId: string) => {
    await db.toggleHabitLog(habitId, todayIso);
    triggerRefresh();
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const isCompleted = task.status === 'completed';
    const updated: Task = {
      ...task,
      status: isCompleted ? 'planned' : 'completed',
      progress: isCompleted ? 0 : 100,
      updatedAt: new Date().toISOString(),
    };
    await db.saveTask(updated);
    triggerRefresh();
  };

  const fullDateString =
    settings.calendarSystem === 'jalali'
      ? formatJalaliFull(todayIso, isRtl)
      : formatGregorianFull(todayIso);

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* PWA Install Banner if applicable */}
      <PWAInstallBanner />

      {/* Hero Greeting & Date */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#91A8FF] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {getGreeting()}، {settings.userName}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
            {fullDateString}
          </h2>
        </div>

        {/* Quick Review Button */}
        <button
          onClick={openDailyReview}
          className="px-3.5 py-2 rounded-2xl glass-panel border border-[#91A8FF]/30 hover:border-[#91A8FF]/60 hover:bg-[#91A8FF]/15 text-xs font-bold text-[#91A8FF] flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer shrink-0"
        >
          <Smile className="w-4 h-4" />
          <span>{t.recordReview}</span>
        </button>
      </div>

      {/* Overdue Alert banner if any */}
      {overdueTasks.length > 0 && (
        <div
          onClick={() => openSubView('overdue')}
          className="p-3.5 rounded-2xl bg-[#FF6B82]/10 border border-[#FF6B82]/30 flex items-center justify-between text-xs text-[#FF6B82] cursor-pointer hover:bg-[#FF6B82]/15 transition"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {isRtl ? toPersianDigits(overdueTasks.length) : overdueTasks.length} {t.overdueTasks}
            </span>
          </div>
          <span className="text-[11px] underline">بررسی و زمان‌بندی</span>
        </div>
      )}

      {/* Main KPI Row: Completion Ring & Productivity Score */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Daily Completion */}
        <GlassCard glow="blue" className="flex flex-col items-center justify-center py-5">
          <CircularProgress
            percentage={completionPercentage}
            size={96}
            strokeWidth={8}
            color="#91A8FF"
            centerText={`${isRtl ? toPersianDigits(completionPercentage) : completionPercentage}%`}
          />
          <span className="text-xs font-bold text-white mt-2.5">{t.dailyCompletion}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {isRtl ? toPersianDigits(completedItemsCount) : completedItemsCount} /{' '}
            {isRtl ? toPersianDigits(totalItemsCount) : totalItemsCount} مورد
          </span>
        </GlassCard>

        {/* Productivity Score */}
        <GlassCard glow="purple" className="flex flex-col items-center justify-center py-5">
          <CircularProgress
            percentage={productivityScore}
            size={96}
            strokeWidth={8}
            color="#7C5CFC"
            centerText={`${isRtl ? toPersianDigits(productivityScore) : productivityScore}`}
            subtext="/ 100"
          />
          <span className="text-xs font-bold text-white mt-2.5">{t.productivityScore}</span>
          <span className="text-[10px] text-[#35D6A0] font-medium mt-0.5 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> محاسبه هوشمند
          </span>
        </GlassCard>
      </div>

      {/* Vital Metrics Row (Focus, Sleep, Mood/Energy) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Focus */}
        <GlassCard
          onClick={openFocusModal}
          hoverable
          className="p-3 flex flex-col items-center text-center justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-[#7C5CFC]/20 text-[#91A8FF] flex items-center justify-center mb-1">
            <Timer className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{t.focus}</span>
          <span className="text-sm font-extrabold text-white font-mono mt-1">
            {isRtl ? toPersianDigits(focusMinutesToday) : focusMinutesToday}{' '}
            <span className="text-[10px] text-slate-400">{t.minutes}</span>
          </span>
        </GlassCard>

        {/* Sleep */}
        <GlassCard
          onClick={() => openSubView('sleep')}
          hoverable
          className="p-3 flex flex-col items-center text-center justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center mb-1">
            <Moon className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{t.sleep} دیشب</span>
          <span className="text-sm font-extrabold text-white font-mono mt-1">
            {lastSleep
              ? `${Math.floor(lastSleep.durationMinutes / 60)}h ${lastSleep.durationMinutes % 60}m`
              : '۷h ۳۰m'}
          </span>
        </GlassCard>

        {/* Mood & Energy */}
        <GlassCard
          onClick={openDailyReview}
          hoverable
          className="p-3 flex flex-col items-center text-center justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-[#35D6A0]/20 text-[#35D6A0] flex items-center justify-center mb-1">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">حال و انرژی</span>
          <span className="text-sm font-extrabold text-[#35D6A0] font-mono mt-1">
            {todayReview ? `${todayReview.energy}%` : 'ثبت نشده'}
          </span>
        </GlassCard>
      </div>

      {/* Daily Habits Checklist */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFBD69]/20 text-[#FFBD69] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.habitsChecklist}</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#91A8FF]">
            {isRtl ? toPersianDigits(completedHabitCount) : completedHabitCount} /{' '}
            {isRtl ? toPersianDigits(totalHabitsCount) : totalHabitsCount}
          </span>
        </div>

        {habits.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">{t.noHabitsToday}</p>
        ) : (
          <div className="space-y-2">
            {habits.map((h) => {
              const isChecked = habitLogs.some((l) => l.habitId === h.id && l.completed);
              return (
                <div
                  key={h.id}
                  onClick={() => handleToggleHabit(h.id)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-[#35D6A0]/10 border-[#35D6A0]/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                        isChecked
                          ? 'bg-[#35D6A0] border-[#35D6A0] text-slate-950 font-bold'
                          : 'border-white/30'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isChecked ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {h.title}
                      </p>
                      {h.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{h.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono">
                    {h.frequency === 'daily' ? 'روزانه' : 'کاری'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Today's Timeline / Tasks */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.timeline}</h3>
          </div>
          <button
            onClick={() => openTaskModal(null)}
            className="text-xs font-semibold text-[#91A8FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.quickAdd}</span>
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-slate-400">{t.noTasksToday}</p>
            <button
              onClick={() => openTaskModal(null)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#91A8FF] font-semibold cursor-pointer"
            >
              افزودن اولین کار امروز
            </button>
          </div>
        ) : (
          <div className="relative border-s-2 border-white/10 ms-2.5 ps-4 space-y-4">
            {todayTasks
              .sort((a, b) => (a.plannedStartTime || '00:00').localeCompare(b.plannedStartTime || '00:00'))
              .map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className="relative group">
                    {/* Timeline bullet dot */}
                    <div
                      className={`absolute -start-[25px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition ${
                        isCompleted
                          ? 'bg-[#35D6A0] border-[#35D6A0] shadow-[0_0_8px_#35D6A0]'
                          : 'bg-[#070A12] border-[#91A8FF]'
                      }`}
                    />

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#91A8FF]/30 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => handleToggleTaskStatus(task)}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-[#91A8FF] font-semibold">
                              {task.plannedStartTime || 'در طول روز'}
                              {task.plannedEndTime && ` - ${task.plannedEndTime}`}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                task.priority === 'urgent'
                                  ? 'bg-[#FF6B82]/20 text-[#FF6B82]'
                                  : task.priority === 'high'
                                  ? 'bg-[#FFBD69]/20 text-[#FFBD69]'
                                  : 'bg-white/5 text-slate-300'
                              }`}
                            >
                              {t[task.priority]}
                            </span>
                          </div>
                          <h4
                            className={`text-xs sm:text-sm font-bold mt-1 ${
                              isCompleted ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Edit task button */}
                        <button
                          onClick={() => openTaskModal(task.id)}
                          className="p-1 text-slate-500 hover:text-white rounded-lg transition"
                          title="ویرایش کار"
                          aria-label="ویرایش کار"
                        >
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </button>
                      </div>

                      {/* Subtask miniature progress */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            زیرکارها:{' '}
                            {task.subtasks.filter((s) => s.completed).length} از {task.subtasks.length}
                          </span>
                          <span className="font-mono text-[#91A8FF]">{task.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </GlassCard>

      {/* Quick Access Shortcuts Footer Cards */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <GlassCard
          onClick={() => openSubView('journal')}
          hoverable
          className="p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{t.journal}</h4>
            <span className="text-[10px] text-slate-400">ثبت احساس و تأملات</span>
          </div>
        </GlassCard>

        <GlassCard
          onClick={() => openSubView('habits')}
          hoverable
          className="p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#35D6A0]/20 text-[#35D6A0] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{t.habits} و {t.goals}</h4>
            <span className="text-[10px] text-slate-400">پیگیری زنجیره‌ها</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
