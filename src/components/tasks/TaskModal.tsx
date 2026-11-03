import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../utils/storage';
import { Task, TaskPriority, TaskStatus, TaskCategory, RecurrenceType, Subtask, Goal } from '../../types';
import { getTodayIso, toPersianDigits } from '../../utils/calendar';
import { X, Plus, Trash2, Check, Calendar, Clock, Tag, Flag, CheckSquare, Target } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, editingTaskId, triggerRefresh, showToast, t, isRtl } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('planned');
  const [progress, setProgress] = useState(0);
  const [plannedDate, setPlannedDate] = useState(getTodayIso());
  const [plannedStartTime, setPlannedStartTime] = useState('09:00');
  const [plannedEndTime, setPlannedEndTime] = useState('10:00');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing task if editing
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const allGoals = await db.getGoals();
      if (isMounted) setGoals(allGoals.filter((g) => !g.isArchived));

      if (editingTaskId) {
        const existing = await db.getById<Task>('tasks', editingTaskId);
        if (existing && isMounted) {
          setTitle(existing.title);
          setDescription(existing.description || '');
          setCategory(existing.category);
          setPriority(existing.priority);
          setStatus(existing.status);
          setProgress(existing.progress);
          setPlannedDate(existing.plannedDate);
          setPlannedStartTime(existing.plannedStartTime || '09:00');
          setPlannedEndTime(existing.plannedEndTime || '10:00');
          setRecurrence(existing.recurrence || 'none');
          setReminderEnabled(existing.reminderEnabled || false);
          setReminderMinutesBefore(existing.reminderMinutesBefore || 15);
          setTags(existing.tags || []);
          setSubtasks(existing.subtasks || []);
          setLinkedGoalId(existing.linkedGoalId || '');
        }
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setCategory('work');
        setPriority('medium');
        setStatus('planned');
        setProgress(0);
        setPlannedDate(getTodayIso());
        setPlannedStartTime('09:00');
        setPlannedEndTime('10:00');
        setRecurrence('none');
        setReminderEnabled(false);
        setTags([]);
        setSubtasks([]);
        setLinkedGoalId('');
        setErrors({});
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [editingTaskId, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (trimmed) {
      const newSt: Subtask = {
        id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: trimmed,
        completed: false,
      };
      setSubtasks([...subtasks, newSt]);
      setSubtaskInput('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st));
    setSubtasks(updated);
    // Auto adjust progress percentage if subtasks exist
    if (updated.length > 0) {
      const completedCount = updated.filter((s) => s.completed).length;
      setProgress(Math.round((completedCount / updated.length) * 100));
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: t.requiredField });
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const taskToSave: Task = {
        id: editingTaskId || `task_${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status,
        progress: status === 'completed' ? 100 : progress,
        plannedDate,
        plannedStartTime,
        plannedEndTime,
        recurrence,
        reminderEnabled,
        reminderMinutesBefore,
        tags,
        subtasks,
        linkedGoalId: linkedGoalId || undefined,
        createdAt: editingTaskId ? nowIso : nowIso,
        updatedAt: nowIso,
      };

      await db.saveTask(taskToSave);
      triggerRefresh();
      showToast(editingTaskId ? 'کار به‌روزرسانی شد.' : 'کار جدید با موفقیت ثبت شد.');
      closeTaskModal();
    } catch (err) {
      console.error(err);
      showToast('خطا در ذخیره‌سازی اطلاعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTaskId) return;
    if (confirm(t.delete + '؟')) {
      await db.deleteTask(editingTaskId);
      triggerRefresh();
      showToast('کار حذف شد.');
      closeTaskModal();
    }
  };

  const priorityColors = {
    low: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    medium: 'text-[#91A8FF] bg-[#91A8FF]/10 border-[#91A8FF]/30',
    high: 'text-[#FFBD69] bg-[#FFBD69]/10 border-[#FFBD69]/30',
    urgent: 'text-[#FF6B82] bg-[#FF6B82]/10 border-[#FF6B82]/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl max-h-[92vh] glass-panel rounded-3xl p-5 sm:p-6 border border-[#91A8FF]/30 shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#91A8FF]/20 to-[#7C5CFC]/20 border border-[#91A8FF]/30 flex items-center justify-center text-[#91A8FF]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingTaskId ? t.editTask : t.saveTask}
              </h2>
              <span className="text-[11px] text-slate-400">
                {isRtl ? 'ثبت در پایگاه داده محلی IndexedDB' : 'Persisted locally in IndexedDB'}
              </span>
            </div>
          </div>
          <button
            onClick={closeTaskModal}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.taskTitle} <span className="text-[#FF6B82]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder={isRtl ? 'مثال: طراحی صفحه داشبورد کاربری' : 'e.g. Design user dashboard'}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 font-medium"
              autoFocus
            />
            {errors.title && <p className="text-xs text-[#FF6B82] mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.taskDesc}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRtl ? 'جزئیات، لینک‌ها یا اهداف مرتبط...' : 'Details, links or context...'}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 resize-none"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#101521]"
              >
                <option value="work">{t.work}</option>
                <option value="personal">{t.personal}</option>
                <option value="health">{t.health}</option>
                <option value="learning">{t.learning}</option>
                <option value="finance">{t.finance}</option>
                <option value="creative">{t.creative}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold bg-[#101521] ${priorityColors[priority]}`}
              >
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
                <option value="urgent">{t.urgent}</option>
              </select>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.status}
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as TaskStatus;
                  setStatus(s);
                  if (s === 'completed') setProgress(100);
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#101521]"
              >
                <option value="planned">{t.markPlanned}</option>
                <option value="in_progress">{t.markInProgress}</option>
                <option value="paused">{t.markPaused}</option>
                <option value="completed">{t.markComplete}</option>
                <option value="cancelled">{t.markCancelled}</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                <span>پیشرفت</span>
                <span className="font-mono text-[#91A8FF]">{progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-[#91A8FF] h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Date & Time Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                {t.plannedDate}
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                {t.startTime}
              </label>
              <input
                type="time"
                value={plannedStartTime}
                onChange={(e) => setPlannedStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                {t.endTime}
              </label>
              <input
                type="time"
                value={plannedEndTime}
                onChange={(e) => setPlannedEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              {t.subtasks} ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder={isRtl ? 'عنوان زیرکار...' : 'Subtask title...'}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition"
                  >
                    <div
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                          st.completed
                            ? 'bg-[#35D6A0] border-[#35D6A0] text-slate-950'
                            : 'border-white/30'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs truncate ${
                          st.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-500 hover:text-[#FF6B82] p-1 transition"
                      aria-label="حذف زیرکار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              برچسب‌ها (Tags)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={isRtl ? 'برچسب را تایپ کنید و Enter بزنید' : 'Type tag and press Enter'}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                <Tag className="w-3.5 h-3.5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#91A8FF]/15 text-[#91A8FF] text-[11px] border border-[#91A8FF]/25 font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                      aria-label="حذف برچسب"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Goal Link & Recurrence */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.recurrence}
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#101521]"
              >
                <option value="none">{t.none}</option>
                <option value="daily">{t.daily}</option>
                <option value="weekdays">{t.weekdays}</option>
                <option value="weekly">{t.weekly}</option>
                <option value="monthly">{t.monthly}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اتصال به هدف (Goal)
              </label>
              <select
                value={linkedGoalId}
                onChange={(e) => setLinkedGoalId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#101521]"
              >
                <option value="">بدون هدف مرتبط</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          {editingTaskId ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl bg-[#FF6B82]/15 text-[#FF6B82] hover:bg-[#FF6B82]/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.delete}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <GlassButton variant="ghost" size="sm" onClick={closeTaskModal}>
              {t.cancel}
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {editingTaskId ? t.edit : t.save}
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};
