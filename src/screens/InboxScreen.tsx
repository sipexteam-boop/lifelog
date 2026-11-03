import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { InboxItem, Task } from '../types';
import { getTodayIso } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import {
  Inbox,
  Send,
  Trash2,
  ArrowRight,
  CheckSquare,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const InboxScreen: React.FC = () => {
  const { dataVersion, triggerRefresh, showToast, openTaskModal, openSubView, t, isRtl } = useApp();

  const [items, setItems] = useState<InboxItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await db.getInboxItems();
      if (isMounted) setItems(all);
    })();
    return () => {
      isMounted = false;
    };
  }, [dataVersion]);

  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsSubmitting(true);
    try {
      const newItem: InboxItem = {
        id: `inb_${Date.now()}`,
        text: inputText.trim(),
        createdAt: new Date().toISOString(),
        processed: false,
      };
      await db.saveInboxItem(newItem);
      setInputText('');
      triggerRefresh();
      showToast('ایده در اینباکس ذخیره شد.');
    } catch (err) {
      console.error(err);
      showToast('خطا در ذخیره‌سازی');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await db.deleteInboxItem(id);
    triggerRefresh();
    showToast('مورد حذف شد.');
  };

  // Convert to scheduled task
  const handleConvertToTask = async (item: InboxItem) => {
    const todayIso = getTodayIso();
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: item.text,
      category: 'work',
      priority: 'medium',
      status: 'planned',
      progress: 0,
      plannedDate: todayIso,
      subtasks: [],
      recurrence: 'none',
      reminderEnabled: false,
      tags: ['اینباکس'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveTask(newTask);
    await db.deleteInboxItem(item.id);
    triggerRefresh();
    showToast('ایده به یک تسک برنامه‌ریزی‌شده تبدیل شد.');
    openTaskModal(newTask.id);
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#91A8FF]/20 to-[#7C5CFC]/20 text-[#91A8FF] flex items-center justify-center">
          <Inbox className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{t.inbox}</h2>
          <span className="text-xs text-slate-400">فضای ثبت فوری افکار بدون استرس زمان‌بندی</span>
        </div>
      </div>

      {/* Quick Input Bar */}
      <GlassCard glow="blue" className="p-3">
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.inboxPlaceholder}
            className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-medium"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 disabled:opacity-40 transition cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>ثبت</span>
          </button>
        </form>
      </GlassCard>

      {/* Items List */}
      {items.length === 0 ? (
        <GlassCard className="text-center py-12 space-y-2">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">اینباکس شما خالی است! ذهن شما آرام و رهاست.</p>
        </GlassCard>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <GlassCard key={item.id} className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-relaxed">{item.text}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  {new Date(item.createdAt).toLocaleString(isRtl ? 'fa-IR' : 'en-US')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Convert to Task */}
                <button
                  onClick={() => handleConvertToTask(item)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#91A8FF]/20 text-[#91A8FF] text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  title={t.convertToTask}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تبدیل به کار</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-[#FF6B82] rounded-lg transition cursor-pointer"
                  title="حذف"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
