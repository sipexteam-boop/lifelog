/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderBar } from './components/navigation/HeaderBar';
import { BottomNavBar } from './components/navigation/BottomNavBar';
import { TodayScreen } from './screens/TodayScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { TasksScreen } from './screens/TasksScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { MoreScreen } from './screens/MoreScreen';
import { JournalScreen } from './screens/JournalScreen';
import { SleepScreen } from './screens/SleepScreen';
import { HabitsGoalsScreen } from './screens/HabitsGoalsScreen';
import { InboxScreen } from './screens/InboxScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TaskModal } from './components/tasks/TaskModal';
import { DailyReviewModal } from './components/reviews/DailyReviewModal';
import { FocusTimerModal } from './components/focus/FocusTimerModal';
import { PINLockModal } from './components/common/PINLockModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, activeSubView, closeSubView, toastMessage, isRtl } = useApp();

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Render SubView if active
  if (activeSubView) {
    let subComponent = null;
    let subTitle = '';

    switch (activeSubView) {
      case 'journal':
        subComponent = <JournalScreen />;
        subTitle = 'ژورنال و خاطرات';
        break;
      case 'sleep':
        subComponent = <SleepScreen />;
        subTitle = 'پایش خواب';
        break;
      case 'habits':
        subComponent = <HabitsGoalsScreen />;
        subTitle = 'عادت‌ها و اهداف';
        break;
      case 'inbox':
        subComponent = <InboxScreen />;
        subTitle = 'اینباکس سریع';
        break;
      case 'settings':
        subComponent = <SettingsScreen />;
        subTitle = 'تنظیمات و پشتیبان‌گیری';
        break;
      case 'overdue':
        subComponent = <TasksScreen />;
        subTitle = 'کارهای معوقه';
        break;
      default:
        subComponent = null;
    }

    return (
      <div className="min-h-screen pb-20">
        {/* SubView Top Navigation Bar */}
        <div className="sticky top-0 z-30 px-4 py-3 bg-[#070A12]/85 backdrop-blur-xl border-b border-white/5 safe-pt">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={closeSubView}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <BackIcon className="w-4 h-4 text-[#91A8FF]" />
              <span>بازگشت به صفحه اصلی</span>
            </button>
            <span className="text-xs font-bold text-white">{subTitle}</span>
          </div>
        </div>

        <main className="pt-2">{subComponent}</main>

        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderBar />

      <main className="flex-1">
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'tasks' && <TasksScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'more' && <MoreScreen />}
      </main>

      <BottomNavBar />

      {/* Global Modals */}
      <TaskModal />
      <DailyReviewModal />
      <FocusTimerModal />
      <PINLockModal />
      <OfflineIndicator />

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:end-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 px-4 py-2.5 text-xs font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
