import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { Habit, HabitLog, Goal, GoalMilestone, Task, TaskCategory } from '../types';
import { getTodayIso, formatIsoDate, toPersianDigits } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import {
  Flame,
  Target,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Calendar,
  X,
  Archive,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const HabitsGoalsScreen: React.FC = () => {
  const { dataVersion, triggerRefresh, showToast, t, isRtl } = useApp();

  const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Habit modal
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitCategory, setHabitCategory] = useState<TaskCategory>('health');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekdays' | 'weekly'>('daily');

  // Goal modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<TaskCategory>('work');
  const [goalTargetDate, setGoalTargetDate] = useState(getTodayIso());
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalMilestones, setGoalMilestones] = useState<GoalMilestone[]>([]);
  const [milestoneInput, setMilestoneInput] = useState('');

  const todayIso = getTodayIso();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [allHabits, allLogs, allGoals, allTasks] = await Promise.all([
        db.getHabits(),
        db.getHabitLogs(),
        db.getGoals(),
        db.getTasks(),
      ]);
      if (!isMounted) return;
      setHabits(allHabits);
      setHabitLogs(allLogs);
      setGoals(allGoals);
      setTasks(allTasks);
    })();
    return () => {
      isMounted = false;
    };
  }, [dataVersion]);

  // Calculate Habit Streak (consecutive days)
  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const now = new Date();
    // Check backwards from today or yesterday
    for (let i = 0; i < 90; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = formatIsoDate(d);
      const isCompleted = habitLogs.some((l) => l.habitId === habitId && l.date === iso && l.completed);
      if (isCompleted) {
        streak++;
      } else if (i === 0) {
        // Not completed yet today, check yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const handleToggleHabit = async (habitId: string) => {
    await db.toggleHabitLog(habitId, todayIso);
    triggerRefresh();
  };

  // Habit CRUD
  const handleOpenNewHabit = () => {
    setEditingHabitId(null);
    setHabitTitle('');
    setHabitDesc('');
    setHabitCategory('health');
    setHabitFrequency('daily');
    setIsHabitModalOpen(true);
  };

  const handleOpenEditHabit = (h: Habit) => {
    setEditingHabitId(h.id);
    setHabitTitle(h.title);
    setHabitDesc(h.description || '');
    setHabitCategory(h.category);
    setHabitFrequency(h.frequency);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = async () => {
    if (!habitTitle.trim()) {
      showToast('عنوان عادت الزامی است.');
      return;
    }
    const habitToSave: Habit = {
      id: editingHabitId || `habit_${Date.now()}`,
      title: habitTitle.trim(),
      description: habitDesc.trim() || undefined,
      category: habitCategory,
      frequency: habitFrequency,
      targetDaysPerWeek: habitFrequency === 'daily' ? 7 : habitFrequency === 'weekdays' ? 5 : 3,
      createdAt: new Date().toISOString(),
    };
    await db.saveHabit(habitToSave);
    setIsHabitModalOpen(false);
    triggerRefresh();
    showToast(editingHabitId ? 'عادت به‌روزرسانی شد.' : 'عادت جدید ایجاد شد.');
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('آیا از حذف این عادت اطمینان دارید؟')) {
      await db.deleteHabit(id);
      setIsHabitModalOpen(false);
      triggerRefresh();
      showToast('عادت حذف شد.');
    }
  };

  // Goal CRUD
  const handleOpenNewGoal = () => {
    setEditingGoalId(null);
    setGoalTitle('');
    setGoalDesc('');
    setGoalCategory('work');
    setGoalTargetDate(getTodayIso());
    setGoalProgress(0);
    setGoalMilestones([]);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (g: Goal) => {
    setEditingGoalId(g.id);
    setGoalTitle(g.title);
    setGoalDesc(g.description || '');
    setGoalCategory(g.category);
    setGoalTargetDate(g.targetDate);
    setGoalProgress(g.progress);
    setGoalMilestones(g.milestones || []);
    setIsGoalModalOpen(true);
  };

  const handleAddMilestone = () => {
    if (milestoneInput.trim()) {
      setGoalMilestones([
        ...goalMilestones,
        {
          id: `m_${Date.now()}`,
          title: milestoneInput.trim(),
          completed: false,
        },
      ]);
      setMilestoneInput('');
    }
  };

  const handleToggleMilestone = (id: string) => {
    const updated = goalMilestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setGoalMilestones(updated);
    if (updated.length > 0) {
      const comp = updated.filter((m) => m.completed).length;
      setGoalProgress(Math.round((comp / updated.length) * 100));
    }
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim()) {
      showToast('عنوان هدف الزامی است.');
      return;
    }
    const goalToSave: Goal = {
      id: editingGoalId || `goal_${Date.now()}`,
      title: goalTitle.trim(),
      description: goalDesc.trim() || undefined,
      category: goalCategory,
      targetDate: goalTargetDate,
      progress: goalProgress,
      milestones: goalMilestones,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveGoal(goalToSave);
    setIsGoalModalOpen(false);
    triggerRefresh();
    showToast(editingGoalId ? 'هدف به‌روزرسانی شد.' : 'هدف جدید ذخیره شد.');
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('آیا از حذف این هدف اطمینان دارید؟')) {
      await db.deleteGoal(id);
      setIsGoalModalOpen(false);
      triggerRefresh();
      showToast('هدف حذف شد.');
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Tab Switcher & New Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center p-1 rounded-2xl glass-panel text-xs border border-white/10">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'habits'
                ? 'bg-[#35D6A0] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t.habits}</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'goals'
                ? 'bg-[#91A8FF] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{t.goals}</span>
          </button>
        </div>

        {activeTab === 'habits' ? (
          <button
            onClick={handleOpenNewHabit}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#35D6A0] to-[#91A8FF] text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer hover:brightness-110 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>عادت جدید</span>
          </button>
        ) : (
          <button
            onClick={handleOpenNewGoal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer hover:brightness-110 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>هدف جدید</span>
          </button>
        )}
      </div>

      {/* Habits View */}
      {activeTab === 'habits' && (
        <div className="space-y-3">
          {habits.length === 0 ? (
            <GlassCard className="text-center py-12 space-y-2">
              <Flame className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">عادت فعالی وجود ندارد.</p>
            </GlassCard>
          ) : (
            habits.map((habit) => {
              const streak = calculateStreak(habit.id);
              const isCheckedToday = habitLogs.some(
                (l) => l.habitId === habit.id && l.date === todayIso && l.completed
              );

              return (
                <GlassCard key={habit.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => handleToggleHabit(habit.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center border transition shrink-0 ${
                          isCheckedToday
                            ? 'bg-[#35D6A0] border-[#35D6A0] text-slate-950 font-black shadow-[0_0_12px_#35D6A0]'
                            : 'border-white/30 hover:border-[#35D6A0]'
                        }`}
                      >
                        {isCheckedToday && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <h3
                          className={`text-sm sm:text-base font-bold truncate ${
                            isCheckedToday ? 'text-[#35D6A0]' : 'text-white'
                          }`}
                        >
                          {habit.title}
                        </h3>
                        {habit.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Streak badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFBD69]/15 text-[#FFBD69] text-xs font-bold border border-[#FFBD69]/30">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span className="font-mono">{isRtl ? toPersianDigits(streak) : streak}</span>
                        <span className="text-[10px]">روز</span>
                      </div>

                      <button
                        onClick={() => handleOpenEditHabit(habit)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Past 7 days history dots */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">۷ روز گذشته:</span>
                    <div className="flex items-center gap-1.5">
                      {[6, 5, 4, 3, 2, 1, 0].map((offset) => {
                        const d = new Date();
                        d.setDate(d.getDate() - offset);
                        const iso = formatIsoDate(d);
                        const done = habitLogs.some(
                          (l) => l.habitId === habit.id && l.date === iso && l.completed
                        );
                        return (
                          <div
                            key={offset}
                            title={iso}
                            className={`w-3.5 h-3.5 rounded-full transition ${
                              done
                                ? 'bg-[#35D6A0] shadow-[0_0_6px_#35D6A0]'
                                : 'bg-white/10 border border-white/10'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Goals View */}
      {activeTab === 'goals' && (
        <div className="space-y-3">
          {goals.length === 0 ? (
            <GlassCard className="text-center py-12 space-y-2">
              <Target className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">هدفی ثبت نشده است.</p>
            </GlassCard>
          ) : (
            goals.map((goal) => {
              const linkedGoalTasks = tasks.filter((t) => t.linkedGoalId === goal.id);
              const completedTasksCount = linkedGoalTasks.filter((t) => t.status === 'completed').length;

              return (
                <GlassCard key={goal.id} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium">
                        {t[goal.category]}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenEditGoal(goal)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg shrink-0"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">پیشرفت کل</span>
                      <span className="text-[#91A8FF] font-bold">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-[#91A8FF] to-[#35D6A0] h-full rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  {goal.milestones.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        گام‌ها و نقاط عطف ({goal.milestones.filter((m) => m.completed).length} /{' '}
                        {goal.milestones.length})
                      </span>
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2 text-xs text-slate-300 p-1.5 rounded-lg bg-white/[0.02]"
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                              m.completed
                                ? 'bg-[#35D6A0] border-[#35D6A0] text-slate-950 font-bold'
                                : 'border-white/30'
                            }`}
                          >
                            {m.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={m.completed ? 'line-through text-slate-500' : ''}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Target Date & Linked Tasks footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#91A8FF]" />
                      <span>موعد: {goal.targetDate}</span>
                    </div>
                    {linkedGoalTasks.length > 0 && (
                      <span>
                        کارهای متصل: {completedTasksCount}/{linkedGoalTasks.length}
                      </span>
                    )}
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      {isHabitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                {editingHabitId ? 'ویرایش عادت' : 'عادت جدید'}
              </h3>
              <button
                onClick={() => setIsHabitModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">عنوان عادت</label>
              <input
                type="text"
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                placeholder="مثال: نوشیدن ۲ لیتر آب"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">توضیحات</label>
              <input
                type="text"
                value={habitDesc}
                onChange={(e) => setHabitDesc(e.target.value)}
                placeholder="هدف یا جزئیات انگیزه..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-300 mb-1">دسته‌بندی</label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value as TaskCategory)}
                  className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white bg-[#101521]"
                >
                  <option value="health">سلامتی</option>
                  <option value="learning">آموزش</option>
                  <option value="work">کار</option>
                  <option value="personal">شخصی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تکرار</label>
                <select
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white bg-[#101521]"
                >
                  <option value="daily">روزانه</option>
                  <option value="weekdays">روزهای کاری</option>
                  <option value="weekly">هفتگی</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {editingHabitId ? (
                <button
                  type="button"
                  onClick={() => handleDeleteHabit(editingHabitId)}
                  className="text-xs text-[#FF6B82] hover:underline"
                >
                  حذف
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <GlassButton variant="ghost" size="sm" onClick={() => setIsHabitModalOpen(false)}>
                  انصراف
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleSaveHabit}>
                  ذخیره
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col space-y-3.5 my-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-bold text-white">
                {editingGoalId ? 'ویرایش هدف' : 'هدف جدید'}
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div>
                <label className="block text-xs text-slate-300 mb-1">عنوان هدف</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="مثال: یادگیری مکالمه آلمانی"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">توضیحات</label>
                <textarea
                  rows={2}
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="دلایل، منابع و نقشه راه..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">دسته‌بندی</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as TaskCategory)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white bg-[#101521]"
                  >
                    <option value="work">کار</option>
                    <option value="personal">شخصی</option>
                    <option value="health">سلامتی</option>
                    <option value="learning">آموزش</option>
                    <option value="finance">مالی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">موعد هدف</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>درصد پیشرفت</span>
                  <span className="font-mono text-[#91A8FF]">{goalProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(Number(e.target.value))}
                  className="w-full accent-[#91A8FF] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Milestones */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300">گام‌ها و نقاط عطف</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={milestoneInput}
                    onChange={(e) => setMilestoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone();
                      }
                    }}
                    placeholder="عنوان گام..."
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white"
                  >
                    +
                  </button>
                </div>

                {goalMilestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer text-xs"
                  >
                    <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {m.title}
                    </span>
                    <span className="text-[10px] text-[#35D6A0]">
                      {m.completed ? 'تکمیل شد' : 'در انتظار'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 shrink-0">
              {editingGoalId ? (
                <button
                  type="button"
                  onClick={() => handleDeleteGoal(editingGoalId)}
                  className="text-xs text-[#FF6B82] hover:underline"
                >
                  حذف
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <GlassButton variant="ghost" size="sm" onClick={() => setIsGoalModalOpen(false)}>
                  انصراف
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleSaveGoal}>
                  ذخیره
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
