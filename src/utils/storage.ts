/**
 * IndexedDB Storage Engine for LifeLog
 * High reliability, type-safe, transactional persistence with migration support
 */

import {
  Task,
  Habit,
  HabitLog,
  Goal,
  DailyReview,
  JournalEntry,
  SleepSession,
  FocusSession,
  InboxItem,
  AppSettings,
} from '../types';

const DB_NAME = 'lifelog_db';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'fa',
  theme: 'dark',
  calendarSystem: 'jalali',
  enablePin: false,
  pinHash: undefined,
  notificationsEnabled: true,
  dailyReviewReminderTime: '21:30',
  sleepReminderTime: '23:00',
  userName: 'یاسین',
  syncApiEndpoint: '',
};

class StorageEngine {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tasks
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('plannedDate', 'plannedDate', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('category', 'category', { unique: false });
          taskStore.createIndex('priority', 'priority', { unique: false });
        }

        // Habits
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }

        // Habit Logs
        if (!db.objectStoreNames.contains('habit_logs')) {
          const habitLogStore = db.createObjectStore('habit_logs', { keyPath: 'id' });
          habitLogStore.createIndex('date', 'date', { unique: false });
          habitLogStore.createIndex('habitId', 'habitId', { unique: false });
        }

        // Goals
        if (!db.objectStoreNames.contains('goals')) {
          const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalStore.createIndex('category', 'category', { unique: false });
        }

        // Daily Reviews
        if (!db.objectStoreNames.contains('daily_reviews')) {
          const reviewStore = db.createObjectStore('daily_reviews', { keyPath: 'id' });
          reviewStore.createIndex('date', 'date', { unique: true });
        }

        // Journal Entries
        if (!db.objectStoreNames.contains('journal_entries')) {
          const journalStore = db.createObjectStore('journal_entries', { keyPath: 'id' });
          journalStore.createIndex('date', 'date', { unique: false });
          journalStore.createIndex('isPinned', 'isPinned', { unique: false });
        }

        // Sleep Sessions
        if (!db.objectStoreNames.contains('sleep_sessions')) {
          const sleepStore = db.createObjectStore('sleep_sessions', { keyPath: 'id' });
          sleepStore.createIndex('date', 'date', { unique: false });
          sleepStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // Focus Sessions
        if (!db.objectStoreNames.contains('focus_sessions')) {
          const focusStore = db.createObjectStore('focus_sessions', { keyPath: 'id' });
          focusStore.createIndex('startTime', 'startTime', { unique: false });
        }

        // Inbox Items
        if (!db.objectStoreNames.contains('inbox_items')) {
          const inboxStore = db.createObjectStore('inbox_items', { keyPath: 'id' });
          inboxStore.createIndex('createdAt', 'createdAt', { unique: false });
          inboxStore.createIndex('processed', 'processed', { unique: false });
        }

        // App Settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.initDB();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic Helpers
  async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearStore(storeName: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Tasks API ---
  async getTasks(): Promise<Task[]> {
    return this.getAll<Task>('tasks');
  }

  async getTasksByDate(isoDate: string): Promise<Task[]> {
    const all = await this.getTasks();
    return all.filter((t) => t.plannedDate === isoDate);
  }

  async saveTask(task: Task): Promise<void> {
    await this.put('tasks', task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.delete('tasks', id);
  }

  async bulkUpdateTasks(tasks: Task[]): Promise<void> {
    const store = await this.getStore('tasks', 'readwrite');
    return new Promise((resolve, reject) => {
      let remaining = tasks.length;
      if (remaining === 0) return resolve();
      for (const t of tasks) {
        const req = store.put(t);
        req.onsuccess = () => {
          remaining--;
          if (remaining === 0) resolve();
        };
        req.onerror = () => reject(req.error);
      }
    });
  }

  async bulkDeleteTasks(ids: string[]): Promise<void> {
    const store = await this.getStore('tasks', 'readwrite');
    return new Promise((resolve, reject) => {
      let remaining = ids.length;
      if (remaining === 0) return resolve();
      for (const id of ids) {
        const req = store.delete(id);
        req.onsuccess = () => {
          remaining--;
          if (remaining === 0) resolve();
        };
        req.onerror = () => reject(req.error);
      }
    });
  }

  // --- Habits API ---
  async getHabits(): Promise<Habit[]> {
    return this.getAll<Habit>('habits');
  }

  async saveHabit(habit: Habit): Promise<void> {
    await this.put('habits', habit);
  }

  async deleteHabit(id: string): Promise<void> {
    await this.delete('habits', id);
    // Also remove related habit logs
    const logs = await this.getAll<HabitLog>('habit_logs');
    const toDelete = logs.filter((l) => l.habitId === id);
    for (const log of toDelete) {
      await this.delete('habit_logs', log.id);
    }
  }

  async getHabitLogs(): Promise<HabitLog[]> {
    return this.getAll<HabitLog>('habit_logs');
  }

  async toggleHabitLog(habitId: string, date: string): Promise<boolean> {
    const logId = `${habitId}_${date}`;
    const existing = await this.getById<HabitLog>('habit_logs', logId);
    if (existing && existing.completed) {
      await this.delete('habit_logs', logId);
      return false;
    } else {
      const newLog: HabitLog = {
        id: logId,
        habitId,
        date,
        completed: true,
        timestamp: new Date().toISOString(),
      };
      await this.put('habit_logs', newLog);
      return true;
    }
  }

  // --- Goals API ---
  async getGoals(): Promise<Goal[]> {
    return this.getAll<Goal>('goals');
  }

  async saveGoal(goal: Goal): Promise<void> {
    await this.put('goals', goal);
  }

  async deleteGoal(id: string): Promise<void> {
    await this.delete('goals', id);
  }

  // --- Daily Reviews API ---
  async getDailyReviews(): Promise<DailyReview[]> {
    return this.getAll<DailyReview>('daily_reviews');
  }

  async getDailyReviewByDate(date: string): Promise<DailyReview | null> {
    return this.getById<DailyReview>('daily_reviews', date);
  }

  async saveDailyReview(review: DailyReview): Promise<void> {
    await this.put('daily_reviews', review);
  }

  // --- Journal API ---
  async getJournalEntries(): Promise<JournalEntry[]> {
    const entries = await this.getAll<JournalEntry>('journal_entries');
    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    await this.put('journal_entries', entry);
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await this.delete('journal_entries', id);
  }

  // --- Sleep API ---
  async getSleepSessions(): Promise<SleepSession[]> {
    const sessions = await this.getAll<SleepSession>('sleep_sessions');
    return sessions.sort((a, b) => new Date(b.bedtime).getTime() - new Date(a.bedtime).getTime());
  }

  async getActiveSleepSession(): Promise<SleepSession | null> {
    const sessions = await this.getSleepSessions();
    return sessions.find((s) => s.isActive) || null;
  }

  async startSleepSession(bedtimeIso = new Date().toISOString()): Promise<SleepSession> {
    const active = await this.getActiveSleepSession();
    if (active) {
      throw new Error('یک جلسه خواب فعال در حال حاضر وجود دارد.');
    }
    const sessionDate = bedtimeIso.split('T')[0];
    const session: SleepSession = {
      id: `sleep_${Date.now()}`,
      date: sessionDate,
      bedtime: bedtimeIso,
      durationMinutes: 0,
      quality: 80,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await this.put('sleep_sessions', session);
    return session;
  }

  async endSleepSession(sessionId: string, quality: number, notes?: string): Promise<SleepSession> {
    const session = await this.getById<SleepSession>('sleep_sessions', sessionId);
    if (!session) throw new Error('جلسه خواب یافت نشد.');
    const now = new Date();
    const start = new Date(session.bedtime);
    const durationMinutes = Math.max(0, Math.round((now.getTime() - start.getTime()) / 60000));
    
    session.wakeTime = now.toISOString();
    session.durationMinutes = durationMinutes;
    session.quality = Math.max(0, Math.min(100, quality));
    session.notes = notes;
    session.isActive = false;

    await this.put('sleep_sessions', session);
    return session;
  }

  async saveManualSleepSession(session: SleepSession): Promise<void> {
    await this.put('sleep_sessions', session);
  }

  async deleteSleepSession(id: string): Promise<void> {
    await this.delete('sleep_sessions', id);
  }

  // --- Focus Sessions API ---
  async getFocusSessions(): Promise<FocusSession[]> {
    return this.getAll<FocusSession>('focus_sessions');
  }

  async saveFocusSession(session: FocusSession): Promise<void> {
    await this.put('focus_sessions', session);
  }

  // --- Inbox API ---
  async getInboxItems(): Promise<InboxItem[]> {
    const items = await this.getAll<InboxItem>('inbox_items');
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async saveInboxItem(item: InboxItem): Promise<void> {
    await this.put('inbox_items', item);
  }

  async deleteInboxItem(id: string): Promise<void> {
    await this.delete('inbox_items', id);
  }

  // --- Settings API ---
  async getSettings(): Promise<AppSettings> {
    const res = await this.getById<{ key: string; value: AppSettings }>('settings', 'app_config');
    if (res && res.value) {
      return { ...DEFAULT_SETTINGS, ...res.value };
    }
    return DEFAULT_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.put('settings', { key: 'app_config', value: settings });
  }

  // --- Backup & Restore (Full JSON Export / Import) ---
  async exportAllData(): Promise<string> {
    const [tasks, habits, habitLogs, goals, dailyReviews, journalEntries, sleepSessions, focusSessions, inboxItems, settings] =
      await Promise.all([
        this.getTasks(),
        this.getHabits(),
        this.getHabitLogs(),
        this.getGoals(),
        this.getDailyReviews(),
        this.getJournalEntries(),
        this.getSleepSessions(),
        this.getFocusSessions(),
        this.getInboxItems(),
        this.getSettings(),
      ]);

    const backup = {
      version: 1,
      appName: 'LifeLog',
      exportedAt: new Date().toISOString(),
      data: {
        tasks,
        habits,
        habitLogs,
        goals,
        dailyReviews,
        journalEntries,
        sleepSessions,
        focusSessions,
        inboxItems,
        settings,
      },
    };

    return JSON.stringify(backup, null, 2);
  }

  async importAllData(jsonStr: string): Promise<{ success: boolean; error?: string }> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !parsed.data) {
        return { success: false, error: 'فرمت فایل پشتیبان نامعتبر است.' };
      }
      const { tasks, habits, habitLogs, goals, dailyReviews, journalEntries, sleepSessions, focusSessions, inboxItems, settings } = parsed.data;

      // Clear existing stores
      await Promise.all([
        this.clearStore('tasks'),
        this.clearStore('habits'),
        this.clearStore('habit_logs'),
        this.clearStore('goals'),
        this.clearStore('daily_reviews'),
        this.clearStore('journal_entries'),
        this.clearStore('sleep_sessions'),
        this.clearStore('focus_sessions'),
        this.clearStore('inbox_items'),
      ]);

      // Repopulate
      if (Array.isArray(tasks)) {
        for (const t of tasks) await this.saveTask(t);
      }
      if (Array.isArray(habits)) {
        for (const h of habits) await this.saveHabit(h);
      }
      if (Array.isArray(habitLogs)) {
        for (const l of habitLogs) await this.put('habit_logs', l);
      }
      if (Array.isArray(goals)) {
        for (const g of goals) await this.saveGoal(g);
      }
      if (Array.isArray(dailyReviews)) {
        for (const r of dailyReviews) await this.saveDailyReview(r);
      }
      if (Array.isArray(journalEntries)) {
        for (const j of journalEntries) await this.saveJournalEntry(j);
      }
      if (Array.isArray(sleepSessions)) {
        for (const s of sleepSessions) await this.saveManualSleepSession(s);
      }
      if (Array.isArray(focusSessions)) {
        for (const f of focusSessions) await this.saveFocusSession(f);
      }
      if (Array.isArray(inboxItems)) {
        for (const i of inboxItems) await this.saveInboxItem(i);
      }
      if (settings) {
        await this.saveSettings({ ...DEFAULT_SETTINGS, ...settings });
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'خطای بارگذاری فایل پشتیبان' };
    }
  }

  async clearAllData(): Promise<void> {
    await Promise.all([
      this.clearStore('tasks'),
      this.clearStore('habits'),
      this.clearStore('habit_logs'),
      this.clearStore('goals'),
      this.clearStore('daily_reviews'),
      this.clearStore('journal_entries'),
      this.clearStore('sleep_sessions'),
      this.clearStore('focus_sessions'),
      this.clearStore('inbox_items'),
    ]);
  }
}

export const db = new StorageEngine();
