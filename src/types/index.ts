/**
 * LifeLog Data Models & Type Definitions
 */

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'finance' | 'creative' | 'other';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  tags: string[];
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-100
  plannedDate: string; // YYYY-MM-DD (Gregorian ISO for consistency in DB)
  plannedStartTime?: string; // HH:mm
  plannedEndTime?: string; // HH:mm
  actualStartTime?: string;
  actualEndTime?: string;
  subtasks: Subtask[];
  notes?: string;
  recurrence: RecurrenceType;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number;
  focusMinutesTotal?: number;
  linkedGoalId?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  color?: string;
  icon?: string;
  frequency: 'daily' | 'weekdays' | 'weekly';
  targetDaysPerWeek: number; // e.g. 7 for daily, 5 for weekdays, 3 for thrice weekly
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string; // format: `${habitId}_${date}`
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  timestamp: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  targetDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  milestones: GoalMilestone[];
  color?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  satisfaction: number; // 0-100
  mood: number; // 0-100
  energy: number; // 0-100
  focus: number; // 0-100
  productivity: number; // 0-100
  sleepQuality: number; // 0-100
  notes?: string;
  wins?: string[];
  challenges?: string[];
  updatedAt: string;
}

export type JournalMood = 'great' | 'good' | 'neutral' | 'down' | 'tired' | 'stressed' | 'inspired';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  title: string;
  content: string;
  mood: JournalMood;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export interface SleepSession {
  id: string;
  date: string; // night of YYYY-MM-DD
  bedtime: string; // ISO
  wakeTime?: string; // ISO (undefined if session is currently active)
  durationMinutes: number; // computed when ended
  quality: number; // 0-100
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  category?: TaskCategory;
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface InboxItem {
  id: string;
  text: string;
  createdAt: string;
  category?: TaskCategory;
  processed: boolean;
}

export interface AppSettings {
  language: 'fa' | 'en';
  theme: 'dark' | 'light';
  calendarSystem: 'jalali' | 'gregorian';
  enablePin: boolean;
  pinHash?: string;
  lastPinUnlockTime?: number;
  notificationsEnabled: boolean;
  dailyReviewReminderTime: string; // HH:mm
  sleepReminderTime: string; // HH:mm
  userName: string;
  syncApiEndpoint?: string;
  lastSyncTimestamp?: string;
}

export type MainNavTab = 'today' | 'calendar' | 'tasks' | 'analytics' | 'more';
