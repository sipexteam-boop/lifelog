import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { Task } from '../types';
import {
  getTodayIso,
  dateToJalali,
  jalaliToGregorian,
  getJalaliMonthGrid,
  getGregorianMonthGrid,
  formatJalaliFull,
  formatGregorianFull,
  toPersianDigits,
  formatIsoDate,
  JALALI_MONTH_NAMES_FA,
  GREGORIAN_MONTH_NAMES_EN,
  WEEKDAYS_SHORT_FA,
  WEEKDAYS_SHORT_EN,
} from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CalendarScreen: React.FC = () => {
  const { settings, openTaskModal, dataVersion, triggerRefresh, t, isRtl } = useApp();

  const todayIso = getTodayIso();
  const initialJ = dateToJalali(new Date());

  const [calendarMode, setCalendarMode] = useState<'jalali' | 'gregorian'>(settings.calendarSystem);
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');

  // Month navigation state
  const [curJy, setCurJy] = useState<number>(initialJ.jy);
  const [curJm, setCurJm] = useState<number>(initialJ.jm);
  const [curGy, setCurGy] = useState<number>(new Date().getFullYear());
  const [curGm, setCurGm] = useState<number>(new Date().getMonth() + 1);

  // Selected date
  const [selectedIso, setSelectedIso] = useState<string>(todayIso);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load all tasks
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await db.getTasks();
      if (isMounted) setTasks(all);
    })();
    return () => {
      isMounted = false;
    };
  }, [dataVersion]);

  // Jump to today
  const handleJumpToday = () => {
    const now = new Date();
    const j = dateToJalali(now);
    setCurJy(j.jy);
    setCurJm(j.jm);
    setCurGy(now.getFullYear());
    setCurGm(now.getMonth() + 1);
    setSelectedIso(todayIso);
  };

  const handlePrevMonth = () => {
    if (calendarMode === 'jalali') {
      if (curJm === 1) {
        setCurJm(12);
        setCurJy((y) => y - 1);
      } else {
        setCurJm((m) => m - 1);
      }
    } else {
      if (curGm === 1) {
        setCurGm(12);
        setCurGy((y) => y - 1);
      } else {
        setCurGm((m) => m - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (calendarMode === 'jalali') {
      if (curJm === 12) {
        setCurJm(1);
        setCurJy((y) => y + 1);
      } else {
        setCurJm((m) => m + 1);
      }
    } else {
      if (curGm === 12) {
        setCurGm(1);
        setCurGy((y) => y + 1);
      } else {
        setCurGm((m) => m + 1);
      }
    }
  };

  const gridDays =
    calendarMode === 'jalali'
      ? getJalaliMonthGrid(curJy, curJm)
      : getGregorianMonthGrid(curGy, curGm);

  const selectedDateTasks = tasks.filter((t) => t.plannedDate === selectedIso);

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

  const weekdaysHeader = calendarMode === 'jalali' ? WEEKDAYS_SHORT_FA : WEEKDAYS_SHORT_EN;

  const currentMonthTitle =
    calendarMode === 'jalali'
      ? `${JALALI_MONTH_NAMES_FA[curJm - 1]} ${isRtl ? toPersianDigits(curJy) : curJy}`
      : `${GREGORIAN_MONTH_NAMES_EN[curGm - 1]} ${curGy}`;

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Top Controls: View Switcher & Calendar System */}
      <div className="flex items-center justify-between gap-2">
        {/* Jalali / Gregorian Toggle */}
        <div className="flex items-center p-1 rounded-2xl glass-panel text-xs border border-white/10">
          <button
            onClick={() => setCalendarMode('jalali')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              calendarMode === 'jalali'
                ? 'bg-[#91A8FF] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            شمسی
          </button>
          <button
            onClick={() => setCalendarMode('gregorian')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              calendarMode === 'gregorian'
                ? 'bg-[#91A8FF] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            میلادی
          </button>
        </div>

        {/* View Mode (Month, Week, Day) */}
        <div className="flex items-center p-1 rounded-2xl glass-panel text-xs border border-white/10">
          <button
            onClick={() => setViewType('month')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              viewType === 'month'
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.monthView}
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              viewType === 'week'
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.weekView}
          </button>
          <button
            onClick={() => setViewType('day')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              viewType === 'day'
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.dayView}
          </button>
        </div>
      </div>

      {/* Month Navigation Card */}
      <GlassCard className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white">{currentMonthTitle}</h3>
            <button
              onClick={handleJumpToday}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#91A8FF]/15 text-[#91A8FF] hover:bg-[#91A8FF]/25 font-bold transition cursor-pointer border border-[#91A8FF]/25"
            >
              امروز
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="ماه قبل"
              aria-label="ماه قبل"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-0 rotate-180" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="ماه بعد"
              aria-label="ماه بعد"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-0 rotate-180" />
            </button>
          </div>
        </div>

        {/* View Content */}
        {viewType === 'month' && (
          <div>
            {/* Weekdays row */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1 border-b border-white/5 mb-1">
              {weekdaysHeader.map((d, i) => (
                <div key={i} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {gridDays.map((cell, idx) => {
                const isSelected = cell.isoDate === selectedIso;
                const cellTasks = tasks.filter((t) => t.plannedDate === cell.isoDate);
                const hasCompleted = cellTasks.some((t) => t.status === 'completed');
                const hasPending = cellTasks.some((t) => t.status !== 'completed');

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIso(cell.isoDate)}
                    className={`h-11 sm:h-13 rounded-xl sm:rounded-2xl p-1 flex flex-col items-center justify-between transition-all duration-150 relative cursor-pointer ${
                      cell.isCurrentMonth ? 'text-white' : 'text-slate-600'
                    } ${
                      isSelected
                        ? 'bg-[#91A8FF] text-slate-950 font-black shadow-[0_0_15px_rgba(145,168,255,0.4)] scale-102 z-10'
                        : cell.isToday
                        ? 'bg-[#91A8FF]/20 border border-[#91A8FF]/40 text-[#91A8FF]'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-mono mt-0.5">
                      {isRtl ? toPersianDigits(cell.dayNumber) : cell.dayNumber}
                    </span>

                    {/* Task Indicator Dots */}
                    {cellTasks.length > 0 && (
                      <div className="flex items-center gap-0.5 mb-1">
                        {hasPending && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-slate-950' : 'bg-[#91A8FF]'
                            }`}
                          />
                        )}
                        {hasCompleted && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-slate-800' : 'bg-[#35D6A0]'
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {viewType === 'week' && (
          <div className="py-2">
            <p className="text-xs text-slate-400 mb-2">روزهای هفته جاری:</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {gridDays.slice(0, 7).map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIso(d.isoDate)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition ${
                    d.isoDate === selectedIso
                      ? 'bg-[#91A8FF] text-slate-950 font-bold'
                      : 'glass-panel text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">{weekdaysHeader[i]}</span>
                  <span className="text-sm font-mono font-bold">
                    {isRtl ? toPersianDigits(d.dayNumber) : d.dayNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {viewType === 'day' && (
          <div className="py-3 text-center">
            <span className="text-xs text-slate-400">نمای تفصیلی روزانه</span>
            <h4 className="text-lg font-bold text-white mt-1">
              {calendarMode === 'jalali'
                ? formatJalaliFull(selectedIso, isRtl)
                : formatGregorianFull(selectedIso)}
            </h4>
          </div>
        )}
      </GlassCard>

      {/* Selected Day Task List */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-semibold text-[#91A8FF] flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>کارهای تاریخ انتخاب شده</span>
            </h4>
            <p className="text-sm font-bold text-white mt-0.5">
              {calendarMode === 'jalali'
                ? formatJalaliFull(selectedIso, isRtl)
                : formatGregorianFull(selectedIso)}
            </p>
          </div>

          {/* Quick task add for this selected date */}
          <button
            onClick={() => openTaskModal(null)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 text-xs font-bold flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>افزودن</span>
          </button>
        </div>

        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            برای این تاریخ کاری ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:border-[#91A8FF]/30 transition"
                >
                  <div
                    onClick={() => handleToggleTaskStatus(task)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition shrink-0 ${
                        isCompleted
                          ? 'bg-[#35D6A0] border-[#35D6A0] text-slate-950'
                          : 'border-white/30'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono">{task.plannedStartTime || 'در طول روز'}</span>
                        <span>•</span>
                        <span>{t[task.category]}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openTaskModal(task.id)}
                    className="text-xs text-[#91A8FF] hover:underline shrink-0"
                  >
                    ویرایش
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
