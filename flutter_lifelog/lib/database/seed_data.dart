import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import '../models/task.dart';
import '../models/habit.dart';
import '../models/goal.dart';
import '../models/daily_review.dart';
import '../models/journal_entry.dart';
import '../models/sleep_session.dart';
import '../models/focus_session.dart';
import '../models/inbox_item.dart';
import '../models/app_settings.dart';

class SeedData {
  static Future<void> seedDatabase(Database db) async {
    final now = DateTime.now();
    String getDateStr(int offsetDays) {
      final d = now.add(Duration(days: offsetDays));
      return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    }

    final todayIso = getDateStr(0);

    // 1. Initial Settings for Yasin
    final yasinSettings = AppSettings(
      userName: 'یاسین',
      language: 'fa',
      calendarSystem: 'jalali',
      theme: 'dark',
      enablePin: false,
      enableBiometrics: false,
      notificationsEnabled: true,
      dailyReviewReminderTime: '21:30',
      sleepReminderTime: '23:00',
    );
    await db.insert(
      'settings',
      {'key': 'app_config', 'value': jsonEncode(yasinSettings.toMap())},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // 2. Habits
    final habits = [
      Habit(
        id: 'h_water',
        title: 'نوشیدن ۲ لیتر آب',
        description: 'حفظ شادابی و سلامت جسم در طول روز',
        category: 'health',
        color: '#38BDF8',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        createdAt: getDateStr(-14),
      ),
      Habit(
        id: 'h_reading',
        title: 'مطالعه ۳۰ دقیقه کتاب',
        description: 'توسعه فردی و مدیریت محصول',
        category: 'learning',
        color: '#91A8FF',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        createdAt: getDateStr(-14),
      ),
      Habit(
        id: 'h_workout',
        title: 'ورزش و تمرین بدنی',
        description: 'تمرین قدرتی یا هوازی صبحگاهی',
        category: 'health',
        color: '#35D6A0',
        frequency: 'weekdays',
        targetDaysPerWeek: 5,
        createdAt: getDateStr(-14),
      ),
      Habit(
        id: 'h_meditation',
        title: '۱۰ دقیقه آرام‌سازی و تنفس عمیق',
        description: 'آرامش ذهن قبل از شروع کارهای فکری',
        category: 'personal',
        color: '#7C5CFC',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        createdAt: getDateStr(-14),
      ),
    ];

    for (final h in habits) {
      await db.insert('habits', h.toMap());
    }

    // Habit logs
    for (int i = -6; i <= 0; i++) {
      final dStr = getDateStr(i);
      await db.insert('habit_logs', HabitLog(id: 'h_water_$dStr', habitId: 'h_water', date: dStr, completed: true, timestamp: now.toIso8601String()).toMap());
      if (i != -4) {
        await db.insert('habit_logs', HabitLog(id: 'h_reading_$dStr', habitId: 'h_reading', date: dStr, completed: true, timestamp: now.toIso8601String()).toMap());
      }
      if (i != -2 && i != -5) {
        await db.insert('habit_logs', HabitLog(id: 'h_workout_$dStr', habitId: 'h_workout', date: dStr, completed: true, timestamp: now.toIso8601String()).toMap());
      }
    }

    // 3. Goals for Yasin
    final goals = [
      Goal(
        id: 'g_native',
        title: 'تکمیل و انتشار اپلیکیشن بومی LifeLog اندروید',
        description: 'معماری ۱۰۰٪ آفلاین محلی و رابط کاربری دارک گلس‌مورفیسم برای یاسین',
        category: 'work',
        targetDate: getDateStr(30),
        progress: 75,
        milestones: [
          GoalMilestone(id: 'm1', title: 'طراحی ساختار دیتابیس SQLite', completed: true),
          GoalMilestone(id: 'm2', title: 'پیاده‌سازی تقویم شمسی جلالی', completed: true),
          GoalMilestone(id: 'm3', title: 'خروجی فایل APK نهایی با گیت‌هاب اکشنز', completed: false),
        ],
        createdAt: getDateStr(-20),
        updatedAt: getDateStr(-1),
      ),
      Goal(
        id: 'g_fitness',
        title: 'دویدن ۵ کیلومتر مداوم و ارتقای آمادگی جسمانی',
        description: 'تمرینات منظم هفتگی و تغذیه سالم',
        category: 'health',
        targetDate: getDateStr(60),
        progress: 45,
        milestones: [
          GoalMilestone(id: 'm21', title: 'دویدن ۳ کیلومتر زیر ۲۰ دقیقه', completed: true),
          GoalMilestone(id: 'm22', title: 'ثبت رکورد ۵ کیلومتر بدون توقف', completed: false),
        ],
        createdAt: getDateStr(-30),
        updatedAt: getDateStr(-2),
      ),
    ];

    for (final g in goals) {
      await db.insert('goals', g.toMap());
    }

    // 4. Tasks for Yasin
    final tasks = [
      Task(
        id: 't_yasin_1',
        title: 'بررسی شاخص‌های تمرکز و عملکرد هفتگی',
        description: 'تحلیل همبستگی خواب و بهره‌وری روزهای گذشته',
        category: 'work',
        tags: ['مدیریت', 'هفتگی'],
        priority: 'high',
        status: 'completed',
        progress: 100,
        plannedDate: todayIso,
        plannedStartTime: '09:00',
        plannedEndTime: '10:30',
        subtasks: [
          Subtask(id: 'st1', title: 'بررسی آمار خواب', completed: true),
          Subtask(id: 'st2', title: 'تحلیل ساعات کار عمیق', completed: true),
        ],
        focusMinutesTotal: 60,
        createdAt: getDateStr(-1),
        updatedAt: todayIso,
      ),
      Task(
        id: 't_yasin_2',
        title: 'کدنویسی ماژول ردیابی خواب و بایومتریک اندروید',
        description: 'تست اثرانگشت و قفل لوکال بدون ارسال داده به اینترنت',
        category: 'work',
        tags: ['اندروید', 'توسعه'],
        priority: 'urgent',
        status: 'in_progress',
        progress: 60,
        plannedDate: todayIso,
        plannedStartTime: '11:00',
        plannedEndTime: '12:45',
        subtasks: [
          Subtask(id: 'st3', title: 'اتصال local_auth فلاتر', completed: true),
          Subtask(id: 'st4', title: 'بررسی عملکرد در حالت آفلاین', completed: false),
        ],
        focusMinutesTotal: 45,
        createdAt: todayIso,
        updatedAt: todayIso,
      ),
      Task(
        id: 't_yasin_3',
        title: 'پیاده‌روی عصرگاهی و هوازی سبک',
        description: '۴۰ دقیقه پیاده‌روی سریع در هوای آزاد',
        category: 'health',
        tags: ['سلامتی', 'ورزش'],
        priority: 'medium',
        status: 'planned',
        progress: 0,
        plannedDate: todayIso,
        plannedStartTime: '18:00',
        plannedEndTime: '18:45',
        createdAt: todayIso,
        updatedAt: todayIso,
      ),
      Task(
        id: 't_yasin_4',
        title: 'مرور ۶ شاخص روزانه و نگارش ژورنال شخصی',
        description: 'ثبت احساسات، رضایت و دستاوردهای امروز در پایگاه داده محلی',
        category: 'personal',
        tags: ['ژورنال', 'مرور_روزانه'],
        priority: 'high',
        status: 'planned',
        progress: 0,
        plannedDate: todayIso,
        plannedStartTime: '21:30',
        plannedEndTime: '22:00',
        createdAt: todayIso,
        updatedAt: todayIso,
      ),
    ];

    for (final t in tasks) {
      await db.insert('tasks', t.toMap());
    }

    // 5. Daily Reviews
    for (int i = -5; i <= -1; i++) {
      final dStr = getDateStr(i);
      final rev = DailyReview(
        id: dStr,
        date: dStr,
        satisfaction: 80 + (i % 3) * 5,
        mood: 85 + (i % 2) * 5,
        energy: 78 + (i % 3) * 4,
        focus: 82 + (i % 2) * 6,
        productivity: 84 + (i % 3) * 3,
        sleepQuality: 80 + (i % 4) * 4,
        notes: 'روز پربار کاری یاسین و انضباط کامل در اجرای برنامه‌ها.',
        wins: ['تکمیل تسک‌های اولویت‌دار', 'ورزش منظم'],
        updatedAt: dStr,
      );
      await db.insert('daily_reviews', rev.toMap());
    }

    // 6. Sleep Sessions
    for (int i = -5; i <= -1; i++) {
      final dStr = getDateStr(i);
      final wakeStr = getDateStr(i + 1);
      final s = SleepSession(
        id: 'sleep_$i',
        date: dStr,
        bedtime: '${dStr}T23:30:00.000Z',
        wakeTime: '${wakeStr}T07:15:00.000Z',
        durationMinutes: 465,
        quality: 85,
        notes: 'خواب عمیق و بیداری بانشاط یاسین.',
        isActive: false,
        createdAt: '${dStr}T23:30:00.000Z',
      );
      await db.insert('sleep_sessions', s.toMap());
    }

    // 7. Journal Entry
    final j = JournalEntry(
      id: 'j_yasin_1',
      date: getDateStr(-1),
      createdAt: '${getDateStr(-1)}T22:30:00.000Z',
      title: 'ارزش سیستم‌های آفلاین و آرامش حریم خصوصی',
      content: 'داشتن یک سیستم عامل شخصی که همه داده‌ها فقط در گوشی خود یاسین بماند و بدون اینترنت کار کند، بهترین حس استقلال و تمرکز را می‌دهد. برنامه‌ها وقتی در آرامش اجرا می‌شوند بیشترین خروجی را دارند.',
      mood: 'inspired',
      tags: ['بینش', 'توسعه_فردی', 'یاسین'],
      isPinned: true,
      updatedAt: '${getDateStr(-1)}T22:30:00.000Z',
    );
    await db.insert('journal_entries', j.toMap());

    // 8. Focus Sessions
    final f = FocusSession(
      id: 'fs_yasin_1',
      taskId: 't_yasin_1',
      taskTitle: 'بررسی شاخص‌های تمرکز و عملکرد هفتگی',
      category: 'work',
      startTime: '${todayIso}T09:05:00.000Z',
      endTime: '${todayIso}T09:55:00.000Z',
      durationMinutes: 50,
      completed: true,
      notes: 'جلسه تمرکز عالی یاسین',
    );
    await db.insert('focus_sessions', f.toMap());

    // 9. Inbox Item
    final inb = InboxItem(
      id: 'inb_yasin_1',
      text: 'بررسی تنظیمات یادآورهای لوکال اندروید برای ساعات پایانی شب',
      createdAt: '${todayIso}T08:30:00.000Z',
      category: 'personal',
      processed: false,
    );
    await db.insert('inbox_items', inb.toMap());
  }
}
