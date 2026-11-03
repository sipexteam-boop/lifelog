import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import '../models/task.dart';
import '../models/habit.dart';
import '../models/goal.dart';
import '../models/daily_review.dart';
import '../models/journal_entry.dart';
import '../models/sleep_session.dart';
import '../models/focus_session.dart';
import '../models/inbox_item.dart';
import '../models/app_settings.dart';
import 'seed_data.dart';

class AppDatabase {
  static final AppDatabase instance = AppDatabase._init();
  static Database? _database;

  AppDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('lifelog_native.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        tags TEXT,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER NOT NULL,
        plannedDate TEXT NOT NULL,
        plannedStartTime TEXT,
        plannedEndTime TEXT,
        actualStartTime TEXT,
        actualEndTime TEXT,
        subtasks TEXT,
        notes TEXT,
        recurrence TEXT,
        reminderEnabled INTEGER,
        reminderMinutesBefore INTEGER,
        focusMinutesTotal INTEGER,
        linkedGoalId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE habits (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        color TEXT,
        frequency TEXT NOT NULL,
        targetDaysPerWeek INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        archived INTEGER NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE habit_logs (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        targetDate TEXT NOT NULL,
        progress INTEGER NOT NULL,
        milestones TEXT,
        color TEXT,
        isArchived INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE daily_reviews (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        satisfaction INTEGER NOT NULL,
        mood INTEGER NOT NULL,
        energy INTEGER NOT NULL,
        focus INTEGER NOT NULL,
        productivity INTEGER NOT NULL,
        sleepQuality INTEGER NOT NULL,
        notes TEXT,
        wins TEXT,
        updatedAt TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE journal_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        tags TEXT,
        isPinned INTEGER NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE sleep_sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        bedtime TEXT NOT NULL,
        wakeTime TEXT,
        durationMinutes INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        notes TEXT,
        isActive INTEGER NOT NULL,
        createdAt TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY,
        taskId TEXT,
        taskTitle TEXT,
        category TEXT,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        durationMinutes INTEGER NOT NULL,
        completed INTEGER NOT NULL,
        notes TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE inbox_items (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        category TEXT,
        processed INTEGER NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    ''');

    // Create indices for fast queries
    await db.execute('CREATE INDEX idx_tasks_date ON tasks(plannedDate)');
    await db.execute('CREATE INDEX idx_tasks_status ON tasks(status)');
    await db.execute('CREATE INDEX idx_habit_logs_date ON habit_logs(date)');
    await db.execute('CREATE INDEX idx_reviews_date ON daily_reviews(date)');
    await db.execute('CREATE INDEX idx_sleep_date ON sleep_sessions(date)');

    // Seed realistic initial demo data for Yasin
    await SeedData.seedDatabase(db);
  }

  // --- Tasks ---
  Future<List<Task>> getTasks() async {
    final db = await database;
    final res = await db.query('tasks', orderBy: 'plannedDate DESC');
    return res.map((m) => Task.fromMap(m)).toList();
  }

  Future<void> saveTask(Task task) async {
    final db = await database;
    await db.insert(
      'tasks',
      task.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> deleteTask(String id) async {
    final db = await database;
    await db.delete('tasks', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> bulkUpdateTasks(List<Task> tasks) async {
    final db = await database;
    final batch = db.batch();
    for (final t in tasks) {
      batch.insert('tasks', t.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkDeleteTasks(List<String> ids) async {
    final db = await database;
    final batch = db.batch();
    for (final id in ids) {
      batch.delete('tasks', where: 'id = ?', whereArgs: [id]);
    }
    await batch.commit(noResult: true);
  }

  // --- Habits ---
  Future<List<Habit>> getHabits() async {
    final db = await database;
    final res = await db.query('habits', where: 'archived = 0');
    return res.map((m) => Habit.fromMap(m)).toList();
  }

  Future<void> saveHabit(Habit habit) async {
    final db = await database;
    await db.insert('habits', habit.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteHabit(String id) async {
    final db = await database;
    await db.delete('habits', where: 'id = ?', whereArgs: [id]);
    await db.delete('habit_logs', where: 'habitId = ?', whereArgs: [id]);
  }

  Future<List<HabitLog>> getHabitLogs() async {
    final db = await database;
    final res = await db.query('habit_logs');
    return res.map((m) => HabitLog.fromMap(m)).toList();
  }

  Future<bool> toggleHabitLog(String habitId, String date) async {
    final db = await database;
    final logId = '${habitId}_$date';
    final existing = await db.query('habit_logs', where: 'id = ?', whereArgs: [logId]);

    if (existing.isNotEmpty && existing.first['completed'] == 1) {
      await db.delete('habit_logs', where: 'id = ?', whereArgs: [logId]);
      return false;
    } else {
      final log = HabitLog(
        id: logId,
        habitId: habitId,
        date: date,
        completed: true,
        timestamp: DateTime.now().toIso8601String(),
      );
      await db.insert('habit_logs', log.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
      return true;
    }
  }

  // --- Goals ---
  Future<List<Goal>> getGoals() async {
    final db = await database;
    final res = await db.query('goals', where: 'isArchived = 0');
    return res.map((m) => Goal.fromMap(m)).toList();
  }

  Future<void> saveGoal(Goal goal) async {
    final db = await database;
    await db.insert('goals', goal.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteGoal(String id) async {
    final db = await database;
    await db.delete('goals', where: 'id = ?', whereArgs: [id]);
  }

  // --- Daily Reviews ---
  Future<List<DailyReview>> getDailyReviews() async {
    final db = await database;
    final res = await db.query('daily_reviews', orderBy: 'date DESC');
    return res.map((m) => DailyReview.fromMap(m)).toList();
  }

  Future<DailyReview?> getDailyReviewByDate(String date) async {
    final db = await database;
    final res = await db.query('daily_reviews', where: 'date = ?', whereArgs: [date]);
    if (res.isNotEmpty) return DailyReview.fromMap(res.first);
    return null;
  }

  Future<void> saveDailyReview(DailyReview review) async {
    final db = await database;
    await db.insert('daily_reviews', review.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // --- Journal ---
  Future<List<JournalEntry>> getJournalEntries() async {
    final db = await database;
    final res = await db.query('journal_entries', orderBy: 'createdAt DESC');
    return res.map((m) => JournalEntry.fromMap(m)).toList();
  }

  Future<void> saveJournalEntry(JournalEntry entry) async {
    final db = await database;
    await db.insert('journal_entries', entry.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteJournalEntry(String id) async {
    final db = await database;
    await db.delete('journal_entries', where: 'id = ?', whereArgs: [id]);
  }

  // --- Sleep ---
  Future<List<SleepSession>> getSleepSessions() async {
    final db = await database;
    final res = await db.query('sleep_sessions', orderBy: 'bedtime DESC');
    return res.map((m) => SleepSession.fromMap(m)).toList();
  }

  Future<SleepSession?> getActiveSleepSession() async {
    final db = await database;
    final res = await db.query('sleep_sessions', where: 'isActive = 1');
    if (res.isNotEmpty) return SleepSession.fromMap(res.first);
    return null;
  }

  Future<SleepSession> startSleepSession() async {
    final active = await getActiveSleepSession();
    if (active != null) {
      throw Exception('یک جلسه خواب فعال از قبل وجود دارد.');
    }
    final now = DateTime.now();
    final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final session = SleepSession(
      id: 'sleep_${DateTime.now().millisecondsSinceEpoch}',
      date: dateStr,
      bedtime: now.toIso8601String(),
      durationMinutes: 0,
      quality: 80,
      isActive: true,
      createdAt: now.toIso8601String(),
    );
    final db = await database;
    await db.insert('sleep_sessions', session.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
    return session;
  }

  Future<SleepSession> endSleepSession(String id, int quality, String? notes) async {
    final db = await database;
    final res = await db.query('sleep_sessions', where: 'id = ?', whereArgs: [id]);
    if (res.isEmpty) throw Exception('جلسه خواب یافت نشد.');
    final session = SleepSession.fromMap(res.first);
    final now = DateTime.now();
    final start = DateTime.parse(session.bedtime);
    final duration = now.difference(start).inMinutes;

    session.wakeTime = now.toIso8601String();
    session.durationMinutes = duration > 0 ? duration : 0;
    session.quality = quality.clamp(0, 100);
    session.notes = notes;
    session.isActive = false;

    await db.update('sleep_sessions', session.toMap(), where: 'id = ?', whereArgs: [id]);
    return session;
  }

  Future<void> saveManualSleepSession(SleepSession session) async {
    final db = await database;
    await db.insert('sleep_sessions', session.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteSleepSession(String id) async {
    final db = await database;
    await db.delete('sleep_sessions', where: 'id = ?', whereArgs: [id]);
  }

  // --- Focus ---
  Future<List<FocusSession>> getFocusSessions() async {
    final db = await database;
    final res = await db.query('focus_sessions', orderBy: 'startTime DESC');
    return res.map((m) => FocusSession.fromMap(m)).toList();
  }

  Future<void> saveFocusSession(FocusSession session) async {
    final db = await database;
    await db.insert('focus_sessions', session.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // --- Inbox ---
  Future<List<InboxItem>> getInboxItems() async {
    final db = await database;
    final res = await db.query('inbox_items', orderBy: 'createdAt DESC');
    return res.map((m) => InboxItem.fromMap(m)).toList();
  }

  Future<void> saveInboxItem(InboxItem item) async {
    final db = await database;
    await db.insert('inbox_items', item.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteInboxItem(String id) async {
    final db = await database;
    await db.delete('inbox_items', where: 'id = ?', whereArgs: [id]);
  }

  // --- Settings ---
  Future<AppSettings> getSettings() async {
    final db = await database;
    final res = await db.query('settings', where: 'key = ?', whereArgs: ['app_config']);
    if (res.isNotEmpty) {
      try {
        final decoded = jsonDecode(res.first['value'] as String);
        return AppSettings.fromMap(Map<String, dynamic>.from(decoded));
      } catch (_) {}
    }
    return AppSettings(); // defaults to Yasin
  }

  Future<void> saveSettings(AppSettings settings) async {
    final db = await database;
    await db.insert(
      'settings',
      {'key': 'app_config', 'value': jsonEncode(settings.toMap())},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // --- Local Backup Export / Import (Pure JSON, 100% On-Device) ---
  Future<String> exportBackupJson() async {
    final tasks = await getTasks();
    final habits = await getHabits();
    final habitLogs = await getHabitLogs();
    final goals = await getGoals();
    final reviews = await getDailyReviews();
    final journal = await getJournalEntries();
    final sleep = await getSleepSessions();
    final focus = await getFocusSessions();
    final inbox = await getInboxItems();
    final settings = await getSettings();

    final backup = {
      'appName': 'LifeLog Native Android',
      'version': '1.0.0',
      'exportedAt': DateTime.now().toIso8601String(),
      'owner': settings.userName,
      'data': {
        'tasks': tasks.map((t) => t.toMap()).toList(),
        'habits': habits.map((h) => h.toMap()).toList(),
        'habitLogs': habitLogs.map((l) => l.toMap()).toList(),
        'goals': goals.map((g) => g.toMap()).toList(),
        'dailyReviews': reviews.map((r) => r.toMap()).toList(),
        'journalEntries': journal.map((j) => j.toMap()).toList(),
        'sleepSessions': sleep.map((s) => s.toMap()).toList(),
        'focusSessions': focus.map((f) => f.toMap()).toList(),
        'inboxItems': inbox.map((i) => i.toMap()).toList(),
        'settings': settings.toMap(),
      }
    };

    return jsonEncode(backup);
  }

  Future<bool> importBackupJson(String jsonStr) async {
    try {
      final decoded = jsonDecode(jsonStr);
      final data = decoded['data'] as Map<String, dynamic>;
      final db = await database;

      await db.transaction((txn) async {
        await txn.delete('tasks');
        await txn.delete('habits');
        await txn.delete('habit_logs');
        await txn.delete('goals');
        await txn.delete('daily_reviews');
        await txn.delete('journal_entries');
        await txn.delete('sleep_sessions');
        await txn.delete('focus_sessions');
        await txn.delete('inbox_items');

        if (data['tasks'] != null) {
          for (final t in data['tasks']) {
            await txn.insert('tasks', Map<String, dynamic>.from(t));
          }
        }
        if (data['habits'] != null) {
          for (final h in data['habits']) {
            await txn.insert('habits', Map<String, dynamic>.from(h));
          }
        }
        if (data['habitLogs'] != null) {
          for (final l in data['habitLogs']) {
            await txn.insert('habit_logs', Map<String, dynamic>.from(l));
          }
        }
        if (data['goals'] != null) {
          for (final g in data['goals']) {
            await txn.insert('goals', Map<String, dynamic>.from(g));
          }
        }
        if (data['dailyReviews'] != null) {
          for (final r in data['dailyReviews']) {
            await txn.insert('daily_reviews', Map<String, dynamic>.from(r));
          }
        }
        if (data['journalEntries'] != null) {
          for (final j in data['journalEntries']) {
            await txn.insert('journal_entries', Map<String, dynamic>.from(j));
          }
        }
        if (data['sleepSessions'] != null) {
          for (final s in data['sleepSessions']) {
            await txn.insert('sleep_sessions', Map<String, dynamic>.from(s));
          }
        }
        if (data['focusSessions'] != null) {
          for (final f in data['focusSessions']) {
            await txn.insert('focus_sessions', Map<String, dynamic>.from(f));
          }
        }
        if (data['inboxItems'] != null) {
          for (final i in data['inboxItems']) {
            await txn.insert('inbox_items', Map<String, dynamic>.from(i));
          }
        }
        if (data['settings'] != null) {
          final loadedSettings = AppSettings.fromMap(Map<String, dynamic>.from(data['settings']));
          await txn.insert('settings', {'key': 'app_config', 'value': jsonEncode(loadedSettings.toMap())});
        }
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> clearAllData() async {
    final db = await database;
    await db.delete('tasks');
    await db.delete('habits');
    await db.delete('habit_logs');
    await db.delete('goals');
    await db.delete('daily_reviews');
    await db.delete('journal_entries');
    await db.delete('sleep_sessions');
    await db.delete('focus_sessions');
    await db.delete('inbox_items');
  }
}
