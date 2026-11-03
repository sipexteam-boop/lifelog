import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { JournalEntry, JournalMood } from '../types';
import { getTodayIso, formatJalaliFull, formatGregorianFull, toPersianDigits } from '../utils/calendar';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Smile,
  Frown,
  Meh,
  Sparkles,
  Zap,
  Coffee,
  X,
  Calendar,
} from 'lucide-react';

export const JournalScreen: React.FC = () => {
  const { dataVersion, triggerRefresh, showToast, settings, t, isRtl } = useApp();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Editor fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood>('great');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [entryDate, setEntryDate] = useState(getTodayIso());

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await db.getJournalEntries();
      if (isMounted) setEntries(all);
    })();
    return () => {
      isMounted = false;
    };
  }, [dataVersion]);

  const handleOpenNew = () => {
    setEditingEntryId(null);
    setTitle('');
    setContent('');
    setMood('great');
    setTags([]);
    setIsPinned(false);
    setEntryDate(getTodayIso());
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags || []);
    setIsPinned(entry.isPinned || false);
    setEntryDate(entry.date);
    setIsEditorOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!title.trim() && !content.trim()) {
      showToast('عنوان یا متن یادداشت الزامی است.');
      return;
    }

    const nowIso = new Date().toISOString();
    const entryToSave: JournalEntry = {
      id: editingEntryId || `journal_${Date.now()}`,
      date: entryDate,
      createdAt: editingEntryId ? nowIso : nowIso,
      title: title.trim() || 'یادداشت بدون عنوان',
      content: content.trim(),
      mood,
      tags,
      isPinned,
      updatedAt: nowIso,
    };

    await db.saveJournalEntry(entryToSave);
    triggerRefresh();
    showToast(editingEntryId ? 'یادداشت به‌روزرسانی شد.' : 'یادداشت با موفقیت ثبت شد.');
    setIsEditorOpen(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('آیا از حذف این یادداشت اطمینان دارید؟')) {
      await db.deleteJournalEntry(id);
      triggerRefresh();
      showToast('یادداشت حذف شد.');
      if (isEditorOpen) setIsEditorOpen(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const moodIcons: Record<JournalMood, { icon: React.FC<{ className?: string }>; label: string; color: string }> = {
    great: { icon: Sparkles, label: 'عالی و پرانرژی', color: 'text-[#35D6A0]' },
    good: { icon: Smile, label: 'خوب و آرام', color: 'text-[#91A8FF]' },
    neutral: { icon: Meh, label: 'معمولی', color: 'text-slate-400' },
    down: { icon: Frown, label: 'ناراحت / کم‌انرژی', color: 'text-[#FF6B82]' },
    tired: { icon: Coffee, label: 'خسته', color: 'text-[#FFBD69]' },
    stressed: { icon: Zap, label: 'پراسترس', color: 'text-[#FF6B82]' },
    inspired: { icon: Sparkles, label: 'الهام‌بخش', color: 'text-[#7C5CFC]' },
  };

  const filteredEntries = entries.filter((e) => {
    if (selectedMoodFilter !== 'all' && e.mood !== selectedMoodFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchContent = e.content.toLowerCase().includes(q);
      const matchTag = e.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Title & New Entry Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#91A8FF]/20 to-[#7C5CFC]/20 text-[#91A8FF] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{t.journal}</h2>
            <span className="text-xs text-slate-400">فضای امن و اختصاصی تأملات روزانه</span>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(145,168,255,0.3)] hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>یادداشت جدید</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در خاطرات و تگ‌ها..."
          className="w-full px-4 py-2.5 ps-10 rounded-2xl glass-input text-xs text-white placeholder-slate-500 font-medium"
        />
        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
      </div>

      {/* Entries Chronological Feed */}
      {filteredEntries.length === 0 ? (
        <GlassCard className="text-center py-12 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">هنوز یادداشتی ثبت نشده است.</p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-[#91A8FF]/20 text-[#91A8FF] text-xs font-bold hover:bg-[#91A8FF]/30 transition"
          >
            نوشتن اولین یادداشت
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const MoodIcon = moodIcons[entry.mood]?.icon || Smile;
            return (
              <GlassCard
                key={entry.id}
                onClick={() => handleOpenEdit(entry)}
                hoverable
                className="p-4 sm:p-5 relative"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-xl bg-white/5 ${
                        moodIcons[entry.mood]?.color || 'text-[#91A8FF]'
                      }`}
                    >
                      <MoodIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                        {entry.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {settings.calendarSystem === 'jalali'
                          ? formatJalaliFull(entry.date, isRtl)
                          : formatGregorianFull(entry.date)}
                      </span>
                    </div>
                  </div>

                  {entry.isPinned && (
                    <span className="p-1 rounded-lg bg-[#FFBD69]/20 text-[#FFBD69]">
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 whitespace-pre-line">
                  {entry.content}
                </p>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#91A8FF]/10 text-[#91A8FF] border border-[#91A8FF]/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] glass-panel rounded-3xl p-5 sm:p-6 border border-[#91A8FF]/30 shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingEntryId ? 'ویرایش یادداشت' : 'یادداشت جدید ژورنال'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="موضوع اصلی یا احساس محوری امروز..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  autoFocus
                />
              </div>

              {/* Mood Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  حس و حال کنونی (Mood)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(Object.keys(moodIcons) as JournalMood[]).map((mKey) => {
                    const item = moodIcons[mKey];
                    const Icon = item.icon;
                    const isSelected = mood === mKey;
                    return (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => setMood(mKey)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#91A8FF]/20 border-[#91A8FF] text-white shadow-md'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-[9px] truncate max-w-full">{item.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  متن ژورنال و دل‌نوشته
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="آزادانه بنویسید... امروز چه اتفاقی افتاد؟ چه احساسی دارید؟ چه درس‌هایی گرفتید؟"
                  className="w-full px-3.5 py-3 rounded-xl glass-input text-xs text-white leading-relaxed resize-none"
                />
              </div>

              {/* Tags & Pinned */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2">
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
                      placeholder="افزودن برچسب..."
                      className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white"
                    >
                      +
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#91A8FF]/15 text-[#91A8FF] border border-[#91A8FF]/25"
                        >
                          #{t}{' '}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs ${
                    isPinned
                      ? 'bg-[#FFBD69]/20 border-[#FFBD69] text-[#FFBD69]'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>سنجاق</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
              {editingEntryId ? (
                <button
                  onClick={() => handleDeleteEntry(editingEntryId)}
                  className="px-3 py-2 rounded-xl bg-[#FF6B82]/15 text-[#FF6B82] hover:bg-[#FF6B82]/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <GlassButton variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)}>
                  انصراف
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleSaveEntry}>
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
