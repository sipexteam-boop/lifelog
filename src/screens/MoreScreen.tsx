import React from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/common/GlassCard';
import {
  Timer,
  BookOpen,
  Moon,
  Flame,
  Inbox,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const MoreScreen: React.FC = () => {
  const { openSubView, openFocusModal, openDailyReview, t, isRtl } = useApp();

  const menuSections = [
    {
      id: 'journal',
      title: t.journal,
      subtitle: 'ثبت احساسات، خاطرات و تأملات شخصی روزانه',
      icon: BookOpen,
      color: 'text-[#91A8FF]',
      bg: 'bg-[#91A8FF]/15',
      action: () => openSubView('journal'),
    },
    {
      id: 'focus',
      title: t.focus,
      subtitle: 'تایمر پومودورو، کار عمیق و انضباط فردی',
      icon: Timer,
      color: 'text-[#7C5CFC]',
      bg: 'bg-[#7C5CFC]/15',
      action: openFocusModal,
    },
    {
      id: 'sleep',
      title: t.sleep,
      subtitle: 'پایش چرخه خواب شبانه، کیفیت و میانگین بازیابی',
      icon: Moon,
      color: 'text-[#38BDF8]',
      bg: 'bg-[#38BDF8]/15',
      action: () => openSubView('sleep'),
    },
    {
      id: 'habits',
      title: `${t.habits} و ${t.goals}`,
      subtitle: 'پیگیری زنجیره‌ها، گام‌ها و اهداف استراتژیک',
      icon: Flame,
      color: 'text-[#35D6A0]',
      bg: 'bg-[#35D6A0]/15',
      action: () => openSubView('habits'),
    },
    {
      id: 'inbox',
      title: t.inbox,
      subtitle: 'ثبت سریع افکار و ایده‌ها بدون نیاز به تاریخ',
      icon: Inbox,
      color: 'text-[#FFBD69]',
      bg: 'bg-[#FFBD69]/15',
      action: () => openSubView('inbox'),
    },
    {
      id: 'daily_review',
      title: t.dailyReview,
      subtitle: 'ارزیابی ۶ شاخص کلیدی رضایت، خواب و انرژی',
      icon: Sparkles,
      color: 'text-[#91A8FF]',
      bg: 'bg-[#91A8FF]/15',
      action: openDailyReview,
    },
    {
      id: 'settings',
      title: t.settings,
      subtitle: 'تنظیمات هویت یاسین، امنیت، نسخه نیتیو فلاتر و فایل APK',
      icon: Settings,
      color: 'text-slate-300',
      bg: 'bg-white/10',
      action: () => openSubView('settings'),
    },
  ];

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">{t.more}</h2>
        <span className="text-xs text-slate-400">ابزارهای تکمیلی سیستم عامل شخصی LifeLog</span>
      </div>

      {/* Menu Cards */}
      <div className="space-y-2.5">
        {menuSections.map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard
              key={item.id}
              onClick={item.action}
              hoverable
              className="p-4 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 border border-white/5 transition group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#91A8FF] transition truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.subtitle}</p>
                </div>
              </div>

              <ArrowIcon className="w-5 h-5 text-slate-500 group-hover:text-white transition shrink-0" />
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
