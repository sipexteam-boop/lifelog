import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../types';
import { getTodayIso, formatJalaliShort, toPersianDigits } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  CheckSquare,
  AlertCircle,
  Tag,
  ArrowUpDown,
  ListFilter,
  Calendar,
} from 'lucide-react';

export const TasksScreen: React.FC = () => {
  const { openTaskModal, dataVersion, triggerRefresh, showToast, settings, t, isRtl } = useApp();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Bulk selection mode
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const todayIso = getTodayIso();

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

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }
        // Status
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        // Category
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        // Priority
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'date') {
          cmp = (a.plannedDate + (a.plannedStartTime || '00:00')).localeCompare(
            b.plannedDate + (b.plannedStartTime || '00:00')
          );
        } else if (sortBy === 'priority') {
          const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
          cmp = priorityWeights[b.priority] - priorityWeights[a.priority];
        } else if (sortBy === 'progress') {
          cmp = b.progress - a.progress;
        } else if (sortBy === 'title') {
          cmp = a.title.localeCompare(b.title);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [tasks, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  const handleToggleComplete = async (task: Task) => {
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

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = async () => {
    if (selectedTaskIds.length === 0) return;
    const toUpdate = tasks
      .filter((t) => selectedTaskIds.includes(t.id))
      .map((t) => ({ ...t, status: 'completed' as TaskStatus, progress: 100, updatedAt: new Date().toISOString() }));
    await db.bulkUpdateTasks(toUpdate);
    setSelectedTaskIds([]);
    setIsBulkMode(false);
    triggerRefresh();
    showToast(`${toUpdate.length} کار تکمیل شد.`);
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`آیا از حذف ${selectedTaskIds.length} کار انتخاب شده اطمینان دارید؟`)) {
      await db.bulkDeleteTasks(selectedTaskIds);
      setSelectedTaskIds([]);
      setIsBulkMode(false);
      triggerRefresh();
      showToast('کارهای انتخاب شده حذف شدند.');
    }
  };

  const priorityBadges = {
    urgent: 'bg-[#FF6B82]/15 text-[#FF6B82] border-[#FF6B82]/30',
    high: 'bg-[#FFBD69]/15 text-[#FFBD69] border-[#FFBD69]/30',
    medium: 'bg-[#91A8FF]/15 text-[#91A8FF] border-[#91A8FF]/30',
    low: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Title & Top Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{t.tasks}</h2>
          <span className="text-xs text-slate-400">
            {isRtl ? toPersianDigits(filteredTasks.length) : filteredTasks.length} کار ثبت‌شده
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle bulk selection mode */}
          <button
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              if (isBulkMode) setSelectedTaskIds([]);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isBulkMode
                ? 'bg-[#91A8FF]/20 border-[#91A8FF] text-[#91A8FF]'
                : 'glass-panel border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {isBulkMode ? 'خروج از انتخاب گروهی' : 'انتخاب گروهی'}
          </button>

          {/* New Task Button */}
          <button
            onClick={() => openTaskModal(null)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(145,168,255,0.3)] hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.saveTask}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Controls Bar (when bulk mode is active) */}
      {isBulkMode && (
        <div className="p-3 rounded-2xl glass-panel border border-[#91A8FF]/40 bg-[#91A8FF]/10 flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-white hover:underline cursor-pointer"
            >
              {selectedTaskIds.length === filteredTasks.length ? t.deselectAll : t.selectAll}
            </button>
            <span className="text-xs text-[#91A8FF] font-mono">
              ({selectedTaskIds.length} {t.bulkSelected})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              disabled={selectedTaskIds.length === 0}
              className="px-3 py-1.5 rounded-xl bg-[#35D6A0] text-slate-950 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
            >
              {t.bulkComplete}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedTaskIds.length === 0}
              className="px-3 py-1.5 rounded-xl bg-[#FF6B82]/20 text-[#FF6B82] border border-[#FF6B82]/40 text-xs font-bold hover:bg-[#FF6B82]/30 disabled:opacity-50 transition cursor-pointer"
            >
              {t.bulkDelete}
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در عنوان، توضیحات یا برچسب‌ها..."
          className="w-full px-4 py-2.5 ps-10 rounded-2xl glass-input text-xs text-white placeholder-slate-500 font-medium"
        />
        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute end-3.5 top-3 text-xs text-slate-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Filters & Sorting Scrollable Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl glass-input text-white text-xs bg-[#101521] border-white/10 shrink-0"
        >
          <option value="all">تمام وضعیت‌ها</option>
          <option value="planned">در انتظار</option>
          <option value="in_progress">در حال انجام</option>
          <option value="completed">تکمیل‌شده</option>
          <option value="paused">متوقف‌شده</option>
          <option value="cancelled">لغو شده</option>
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl glass-input text-white text-xs bg-[#101521] border-white/10 shrink-0"
        >
          <option value="all">تمام اولویت‌ها</option>
          <option value="urgent">{t.urgent}</option>
          <option value="high">{t.high}</option>
          <option value="medium">{t.medium}</option>
          <option value="low">{t.low}</option>
        </select>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl glass-input text-white text-xs bg-[#101521] border-white/10 shrink-0"
        >
          <option value="all">تمام دسته‌ها</option>
          <option value="work">{t.work}</option>
          <option value="personal">{t.personal}</option>
          <option value="health">{t.health}</option>
          <option value="learning">{t.learning}</option>
          <option value="finance">{t.finance}</option>
          <option value="creative">{t.creative}</option>
        </select>

        {/* Sort by */}
        <button
          onClick={() => {
            const nextSort =
              sortBy === 'date'
                ? 'priority'
                : sortBy === 'priority'
                ? 'progress'
                : sortBy === 'progress'
                ? 'title'
                : 'date';
            setSortBy(nextSort);
          }}
          className="px-3 py-1.5 rounded-xl glass-panel text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#91A8FF]" />
          <span>مرتب‌سازی: {sortBy === 'date' ? 'تاریخ' : sortBy === 'priority' ? 'اولویت' : sortBy === 'progress' ? 'پیشرفت' : 'عنوان'}</span>
        </button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <GlassCard className="text-center py-12 space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">{t.emptyList}</p>
          <button
            onClick={() => openTaskModal(null)}
            className="px-4 py-2 rounded-xl bg-[#91A8FF]/20 text-[#91A8FF] text-xs font-bold hover:bg-[#91A8FF]/30 transition"
          >
            ایجاد کار جدید
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue =
              task.plannedDate < todayIso && task.status !== 'completed' && task.status !== 'cancelled';
            const isSelected = selectedTaskIds.includes(task.id);

            return (
              <GlassCard
                key={task.id}
                className={`p-3.5 sm:p-4 transition-all duration-200 ${
                  isSelected ? 'border-[#91A8FF] bg-[#91A8FF]/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Checkbox / Selection */}
                  <div className="flex items-center gap-3 pt-0.5 shrink-0">
                    {isBulkMode ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(task.id)}
                        className="w-5 h-5 rounded-md accent-[#91A8FF] cursor-pointer"
                      />
                    ) : (
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                          isCompleted
                            ? 'bg-[#35D6A0] border-[#35D6A0] text-slate-950 font-bold'
                            : 'border-white/30 hover:border-[#91A8FF]'
                        }`}
                        aria-label="تغییر وضعیت کار"
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>
                    )}
                  </div>

                  {/* Main Content */}
                  <div
                    onClick={() => (!isBulkMode ? openTaskModal(task.id) : handleToggleSelectOne(task.id))}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                          priorityBadges[task.priority]
                        }`}
                      >
                        {t[task.priority]}
                      </span>

                      {/* Category */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium">
                        {t[task.category]}
                      </span>

                      {/* Overdue tag */}
                      {isOverdue && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B82]/20 text-[#FF6B82] border border-[#FF6B82]/30 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> معوقه
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    {/* Metadata Footer: Date, Subtasks, Tags */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 flex-wrap font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#91A8FF]" />
                        <span>
                          {settings.calendarSystem === 'jalali'
                            ? formatJalaliShort(task.plannedDate, isRtl)
                            : task.plannedDate}
                        </span>
                      </div>

                      {task.plannedStartTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.plannedStartTime}</span>
                        </div>
                      )}

                      {task.subtasks.length > 0 && (
                        <span>
                          زیرکارها:{' '}
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                        </span>
                      )}

                      {task.tags.map((tag) => (
                        <span key={tag} className="text-[#91A8FF] font-sans">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Edit Icon */}
                  {!isBulkMode && (
                    <button
                      onClick={() => openTaskModal(task.id)}
                      className="text-slate-500 hover:text-white p-1 text-xs shrink-0 cursor-pointer"
                    >
                      ویرایش
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
