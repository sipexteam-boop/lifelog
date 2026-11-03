import 'package:flutter/material.dart';
import '../models/task.dart';
import '../models/habit.dart';
import '../models/goal.dart';
import '../models/daily_review.dart';
import '../models/journal_entry.dart';
import '../models/sleep_session.dart';
import '../models/focus_session.dart';
import '../models/inbox_item.dart';
import '../models/app_settings.dart';
import '../database/app_database.dart';
import '../database/seed_data.dart';
import '../utils/jalali_calendar.dart';

class AppState extends ChangeNotifier {
  final AppDatabase _db = AppDatabase.instance;

  AppSettings _settings = AppSettings(userName: 'یاسین');
  List<Task> _tasks = [];
  List<Habit> _habits = [];
  List<HabitLog> _habitLogs = [];
  List<Goal> _goals = [];
  List<DailyReview> _dailyReviews = [];
  List<JournalEntry> _journalEntries = [];
  List<SleepSession> _sleepSessions = [];
  List<FocusSession> _focusSessions = [];
  List<InboxItem> _inboxItems = [];

  bool _isLoading = true;
  bool _isLocked = false;
  int _activeNavIndex = 0; // 0=Today, 1=Calendar, 2=Tasks, 3=Analytics, 4=More

  // Getters
  AppSettings get settings => _settings;
  List<Task> get tasks => _tasks;
  List<Habit> get habits => _habits;
  List<HabitLog> get habitLogs => _habitLogs;
  List<Goal> get goals => _goals;
  List<DailyReview> get dailyReviews => _dailyReviews;
  List<JournalEntry> get journalEntries => _journalEntries;
  List<SleepSession> get sleepSessions => _sleepSessions;
  List<FocusSession> get focusSessions => _focusSessions;
  List<InboxItem> get inboxItems => _inboxItems;

  bool get isLoading => _isLoading;
  bool get isLocked => _isLocked;
  int get activeNavIndex => _activeNavIndex;

  String get todayIso {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  // Personalized Greetings for Yasin
  String get greeting {
    final hour = DateTime.now().hour;
    final name = _settings.userName.isNotEmpty ? _settings.userName : 'یاسین';
    if (hour < 12) {
      return 'صبح بخیر $name';
    } else if (hour < 16) {
      return 'ظهر بخیر $name';
    } else if (hour < 20) {
      return 'عصر بخیر $name';
    } else {
      return 'شب بخیر $name';
    }
  }

  String get naturalPersonalizedPrompt {
    final name = _settings.userName.isNotEmpty ? _settings.userName : 'یاسین';
    return '$name، امروز چه برنامه‌ای داری؟';
  }

  // Active sleep session
  SleepSession? get activeSleepSession {
    try {
      return _sleepSessions.firstWhere((s) => s.isActive);
    } catch (_) {
      return null;
    }
  }

  // Today's calculated stats
  List<Task> get todayTasks => _tasks.where((t) => t.plannedDate == todayIso).toList();
  List<Task> get completedTodayTasks => todayTasks.where((t) => t.isCompleted).toList();
  List<Task> get overdueTasks =>
      _tasks.where((t) => t.plannedDate.compareTo(todayIso) < 0 && !t.isCompleted && t.status != 'cancelled').toList();

  int get todayCompletedHabitCount {
    return _habitLogs.where((l) => l.date == todayIso && l.completed).length;
  }

  int get completionPercentage {
    final total = todayTasks.length + _habits.length;
    final completed = completedTodayTasks.length + todayCompletedHabitCount;
    if (total == 0) return 100;
    return ((completed / total) * 100).round();
  }

  int get focusMinutesToday {
    return _focusSessions
        .where((f) => f.startTime.startsWith(todayIso))
        .fold(0, (sum, f) => sum + f.durationMinutes);
  }

  int get dailyProductivityScore {
    final taskScore = todayTasks.isNotEmpty
        ? (completedTodayTasks.length / todayTasks.length) * 40
        : 35.0;
    final habitScore = _habits.isNotEmpty
        ? (todayCompletedHabitCount / _habits.length) * 30
        : 25.0;
    final focusScore = (focusMinutesToday / 90.0 * 30).clamp(0.0, 30.0);
    return (taskScore + habitScore + focusScore).round().clamp(0, 100);
  }

  DailyReview? get todayReview {
    try {
      return _dailyReviews.firstWhere((r) => r.date == todayIso);
    } catch (_) {
      return null;
    }
  }

  SleepSession? get lastNightSleep {
    try {
      return _sleepSessions.firstWhere((s) => !s.isActive);
    } catch (_) {
      return null;
    }
  }

  // Navigation
  void setNavIndex(int index) {
    _activeNavIndex = index;
    notifyListeners();
  }

  // Unlock / Lock
  void unlockApp() {
    _isLocked = false;
    notifyListeners();
  }

  void lockApp() {
    if (_settings.enablePin) {
      _isLocked = true;
      notifyListeners();
    }
  }

  // Initialization
  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    try {
      _settings = await _db.getSettings();
      if (_settings.enablePin && _settings.pinHash != null) {
        _isLocked = true;
      }
      await refreshData();
    } catch (e) {
      debugPrint('Error initializing AppState: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshData() async {
    _tasks = await _db.getTasks();
    _habits = await _db.getHabits();
    _habitLogs = await _db.getHabitLogs();
    _goals = await _db.getGoals();
    _dailyReviews = await _db.getDailyReviews();
    _journalEntries = await _db.getJournalEntries();
    _sleepSessions = await _db.getSleepSessions();
    _focusSessions = await _db.getFocusSessions();
    _inboxItems = await _db.getInboxItems();
    notifyListeners();
  }

  // Task Mutations
  Future<void> saveTask(Task task) async {
    await _db.saveTask(task);
    await refreshData();
  }

  Future<void> toggleTaskComplete(Task task) async {
    final nextStatus = task.isCompleted ? 'planned' : 'completed';
    task.status = nextStatus;
    task.progress = task.isCompleted ? 100 : 0;
    task.updatedAt = DateTime.now().toIso8601String();
    await _db.saveTask(task);
    await refreshData();
  }

  Future<void> deleteTask(String id) async {
    await _db.deleteTask(id);
    await refreshData();
  }

  Future<void> bulkCompleteTasks(List<String> ids) async {
    final toUpdate = _tasks.where((t) => ids.contains(t.id)).toList();
    for (final t in toUpdate) {
      t.status = 'completed';
      t.progress = 100;
      t.updatedAt = DateTime.now().toIso8601String();
    }
    await _db.bulkUpdateTasks(toUpdate);
    await refreshData();
  }

  Future<void> bulkDeleteTasks(List<String> ids) async {
    await _db.bulkDeleteTasks(ids);
    await refreshData();
  }

  // Habit Mutations
  Future<void> saveHabit(Habit habit) async {
    await _db.saveHabit(habit);
    await refreshData();
  }

  Future<void> deleteHabit(String id) async {
    await _db.deleteHabit(id);
    await refreshData();
  }

  Future<void> toggleHabitLog(String habitId, String date) async {
    await _db.toggleHabitLog(habitId, date);
    await refreshData();
  }

  int calculateStreak(String habitId) {
    int streak = 0;
    final now = DateTime.now();
    for (int i = 0; i < 90; i++) {
      final d = now.subtract(Duration(days: i));
      final iso = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      final completed = _habitLogs.any((l) => l.habitId == habitId && l.date == iso && l.completed);
      if (completed) {
        streak++;
      } else if (i == 0) {
        continue; // not yet checked today
      } else {
        break;
      }
    }
    return streak;
  }

  // Goal Mutations
  Future<void> saveGoal(Goal goal) async {
    await _db.saveGoal(goal);
    await refreshData();
  }

  Future<void> deleteGoal(String id) async {
    await _db.deleteGoal(id);
    await refreshData();
  }

  // Daily Review Mutations
  Future<void> saveDailyReview(DailyReview review) async {
    await _db.saveDailyReview(review);
    await refreshData();
  }

  // Sleep Mutations
  Future<SleepSession> startSleep() async {
    final session = await _db.startSleepSession();
    await refreshData();
    return session;
  }

  Future<void> endSleep(String id, int quality, String? notes) async {
    await _db.endSleepSession(id, quality, notes);
    await refreshData();
  }

  Future<void> saveManualSleep(SleepSession session) async {
    await _db.saveManualSleepSession(session);
    await refreshData();
  }

  Future<void> deleteSleepSession(String id) async {
    await _db.deleteSleepSession(id);
    await refreshData();
  }

  // Focus Mutations
  Future<void> saveFocusSession(FocusSession session) async {
    await _db.saveFocusSession(session);
    if (session.taskId != null) {
      try {
        final t = _tasks.firstWhere((task) => task.id == session.taskId);
        t.focusMinutesTotal += session.durationMinutes;
        await _db.saveTask(t);
      } catch (_) {}
    }
    await refreshData();
  }

  // Journal Mutations
  Future<void> saveJournalEntry(JournalEntry entry) async {
    await _db.saveJournalEntry(entry);
    await refreshData();
  }

  Future<void> deleteJournalEntry(String id) async {
    await _db.deleteJournalEntry(id);
    await refreshData();
  }

  // Inbox Mutations
  Future<void> saveInboxItem(InboxItem item) async {
    await _db.saveInboxItem(item);
    await refreshData();
  }

  Future<void> deleteInboxItem(String id) async {
    await _db.deleteInboxItem(id);
    await refreshData();
  }

  Future<void> convertInboxToTask(InboxItem item) async {
    final task = Task(
      id: 'task_${DateTime.now().millisecondsSinceEpoch}',
      title: item.text,
      category: 'work',
      priority: 'medium',
      status: 'planned',
      progress: 0,
      plannedDate: todayIso,
      tags: ['اینباکس'],
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );
    await _db.saveTask(task);
    await _db.deleteInboxItem(item.id);
    await refreshData();
  }

  // Settings
  Future<void> updateSettings(AppSettings newSettings) async {
    _settings = newSettings;
    await _db.saveSettings(newSettings);
    notifyListeners();
  }

  Future<void> updateUserName(String name) async {
    _settings.userName = name;
    await _db.saveSettings(_settings);
    notifyListeners();
  }

  Future<void> clearAllData() async {
    await _db.clearAllData();
    await refreshData();
  }

  Future<void> seedData() async {
    final db = await _db.database;
    await SeedData.seedDatabase(db);
    await refreshData();
  }
}
