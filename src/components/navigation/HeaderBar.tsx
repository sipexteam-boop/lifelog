import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatJalaliShort, formatGregorianFull, toPersianDigits, getTodayIso } from '../../utils/calendar';
import { Plus, Timer, Lock, Sparkles, Inbox } from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const { settings, openTaskModal, openFocusModal, openSubView, lockApp, isRtl } = useApp();

  const todayIso = getTodayIso();
  const dateDisplay =
    settings.calendarSystem === 'jalali'
      ? formatJalaliShort(todayIso, isRtl)
      : todayIso;

  return (
    <header className="sticky top-0 z-30 px-4 py-3 bg-[#070A12]/80 backdrop-blur-xl border-b border-white/5 safe-pt">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#91A8FF] via-[#7C5CFC] to-[#35D6A0] p-0.5 shadow-[0_0_15px_rgba(145,168,255,0.3)] shrink-0">
            <div className="w-full h-full bg-[#070A12] rounded-[10px] flex items-center justify-center">
              <span className="text-[#91A8FF] font-black text-sm tracking-tighter">LL</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">LifeLog</h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#91A8FF]/15 text-[#91A8FF] font-mono border border-[#91A8FF]/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {dateDisplay}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Inbox */}
          <button
            onClick={() => openSubView('inbox')}
            className="w-9 h-9 rounded-xl glass-panel border border-white/10 hover:border-[#91A8FF]/40 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="اینباکس افکار و ایده‌ها"
            aria-label="اینباکس افکار و ایده‌ها"
          >
            <Inbox className="w-4 h-4 text-[#91A8FF]" />
          </button>

          {/* Focus Timer */}
          <button
            onClick={openFocusModal}
            className="w-9 h-9 rounded-xl glass-panel border border-[#7C5CFC]/30 bg-[#7C5CFC]/10 hover:bg-[#7C5CFC]/20 text-[#91A8FF] flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="تایمر تمرکز و کار عمیق"
            aria-label="تایمر تمرکز و کار عمیق"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Lock App if PIN is enabled */}
          {settings.enablePin && settings.pinHash && (
            <button
              onClick={lockApp}
              className="w-9 h-9 rounded-xl glass-panel border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="قفل کردن برنامه"
              aria-label="قفل کردن برنامه"
            >
              <Lock className="w-4 h-4 text-[#FFBD69]" />
            </button>
          )}

          {/* Quick Add Task */}
          <button
            onClick={() => openTaskModal(null)}
            className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_16px_rgba(145,168,255,0.35)] hover:brightness-110 active:scale-95 transition cursor-pointer"
            aria-label="افزودن کار جدید"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">کار جدید</span>
          </button>
        </div>
      </div>
    </header>
  );
};
