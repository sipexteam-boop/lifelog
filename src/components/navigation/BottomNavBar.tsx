import React from 'react';
import { useApp } from '../../context/AppContext';
import { MainNavTab } from '../../types';
import { Home, Calendar, CheckSquare2, BarChart3, LayoutGrid } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const navItems: { id: MainNavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: t.today, icon: Home },
    { id: 'calendar', label: t.calendar, icon: Calendar },
    { id: 'tasks', label: t.tasks, icon: CheckSquare2 },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
    { id: 'more', label: t.more, icon: LayoutGrid },
  ];

  return (
    <nav aria-label="ناوبری اصلی" className="fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom,10px),10px)] pt-2 bg-gradient-to-t from-[#070A12] via-[#070A12]/95 to-transparent backdrop-blur-md pointer-events-none">
      <div className="max-w-md mx-auto glass-panel rounded-2xl p-1.5 flex items-center justify-around border border-[#91A8FF]/20 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'text-[#91A8FF]'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active pill background glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#91A8FF]/15 to-[#7C5CFC]/10 rounded-xl border border-[#91A8FF]/30 -z-10 shadow-[0_0_12px_rgba(145,168,255,0.2)]" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span className={`text-[11px] mt-1 font-medium transition-all ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
