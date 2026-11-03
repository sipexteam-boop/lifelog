/**
 * Realistic Demo Seeder for LifeLog
 * Seeds rich, authentic data across all modules into IndexedDB
 */

import { db } from './storage';
import { getTodayIso, formatIsoDate } from './calendar';
import { Task, Habit, Goal, DailyReview, JournalEntry, SleepSession, FocusSession, InboxItem } from '../types';

export async function seedRealisticData(): Promise<void> {
  const today = new Date();
  const todayIso = getTodayIso();

  const getDateStr = (offsetDays: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return formatIsoDate(d);
  };

  // 1. Habits
  const habits: Habit[] = [
    {
      id: 'h_water',
      title: 'نوشیدن ۲ لیتر آب',
      description: 'حفظ هیدراتاسیون مناسب در طول روز',
      category: 'health',
      color: '#38BDF8',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      createdAt: getDateStr(-14),
    },
    {
      id: 'h_reading',
      title: 'مطالعه ۳۰ دقیقه کتاب',
      description: 'کتاب‌های توسعه فردی و مدیریت محصول',
      category: 'learning',
      color: '#91A8FF',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      createdAt: getDateStr(-14),
    },
    {
      id: 'h_workout',
      title: 'ورزش و تمرین بدنی',
      description: 'ورزش هوازی یا قدرتی صبحگاهی',
      category: 'health',
      color: '#35D6A0',
      frequency: 'weekdays',
      targetDaysPerWeek: 5,
      createdAt: getDateStr(-14),
    },
    {
      id: 'h_meditation',
      title: '۱۰ دقیقه ذهن‌آگاهی و مدیتیشن',
      description: 'تنفس عمیق و آرام‌سازی قبل از شروع کار',
      category: 'personal',
      color: '#7C5CFC',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      createdAt: getDateStr(-14),
    },
    {
      id: 'h_deepwork',
      title: '۲ ساعت کار عمیق بدون حواس‌پرتی',
      description: 'مسدودسازی شبکه‌های اجتماعی در ساعات اولیه روز',
      category: 'work',
      color: '#FFBD69',
      frequency: 'weekdays',
      targetDaysPerWeek: 5,
      createdAt: getDateStr(-14),
    },
  ];

  for (const h of habits) {
    await db.saveHabit(h);
  }

  // Habit logs for past 7 days
  for (let i = -6; i <= 0; i++) {
    const dStr = getDateStr(i);
    // Log water for all days
    await db.toggleHabitLog('h_water', dStr);
    // Reading for most days
    if (i !== -4) await db.toggleHabitLog('h_reading', dStr);
    // Workout weekdays
    if (i !== -2 && i !== -5) await db.toggleHabitLog('h_workout', dStr);
    // Meditation
    if (i !== -3) await db.toggleHabitLog('h_meditation', dStr);
    // Deep work (skip today so user can check it off!)
    if (i < 0 && i !== -2) await db.toggleHabitLog('h_deepwork', dStr);
  }

  // 2. Goals
  const goals: Goal[] = [
    {
      id: 'g_flutter',
      title: 'طراحی و استقرار نسخه جدید معماری اپلیکیشن',
      description: 'پیاده‌سازی ماژولار و بهینه‌سازی عملکرد با تایپ‌استریپت و آماده‌سازی برای مهاجرت',
      category: 'work',
      targetDate: getDateStr(30),
      progress: 65,
      color: '#91A8FF',
      isArchived: false,
      milestones: [
        { id: 'm1', title: 'طراحی ساختار دیتابیس لوکال و مهاجرت‌ها', completed: true },
        { id: 'm2', title: 'پیاده‌سازی رابط کاربری گلس‌مورفیسم دارک', completed: true },
        { id: 'm3', title: 'اتصال موتور تقویم جلالی با محاسبات جهش', completed: true },
        { id: 'm4', title: 'تست‌های احراز هویت و رمزنگاری پین', completed: false },
      ],
      createdAt: getDateStr(-20),
      updatedAt: getDateStr(-1),
    },
    {
      id: 'g_fitness',
      title: 'کاهش درصد چربی و ۵ کیلومتر دویدن مداوم',
      description: 'برنامه ورزشی هفتگی و رژیم غذایی پروتئینی باکیفیت',
      category: 'health',
      targetDate: getDateStr(60),
      progress: 40,
      color: '#35D6A0',
      isArchived: false,
      milestones: [
        { id: 'm21', title: 'دویدن ۳ کیلومتر زیر ۲۰ دقیقه', completed: true },
        { id: 'm22', title: 'تثبیت مصرف روزانه ۲ لیتر آب', completed: true },
        { id: 'm23', title: 'ثبت رکورد ۵ کیلومتر دویدن', completed: false },
      ],
      createdAt: getDateStr(-30),
      updatedAt: getDateStr(-2),
    },
    {
      id: 'g_french',
      title: 'پایان سطح متوسط زبان فرانسه و آلمانی',
      description: 'مطالعه روزانه دروس دولینگو و پادکست‌های صوتی',
      category: 'learning',
      targetDate: getDateStr(90),
      progress: 25,
      color: '#FFBD69',
      isArchived: false,
      milestones: [
        { id: 'm31', title: 'اتمام گرامر پایه و زمان گذشته', completed: true },
        { id: 'm32', title: 'یادگیری ۱۰۰۰ واژه پرکاربرد', completed: false },
      ],
      createdAt: getDateStr(-40),
      updatedAt: getDateStr(-3),
    },
  ];

  for (const g of goals) {
    await db.saveGoal(g);
  }

  // 3. Tasks (Today, Past, Upcoming)
  const tasks: Task[] = [
    // Today's tasks
    {
      id: 't_today_1',
      title: 'بررسی شاخص‌های هفتگی و تهیه گزارش پیشرفت',
      description: 'بررسی نمودار تمرکز، خواب و انجام عادات هفته گذشته',
      category: 'work',
      tags: ['گزارش', 'هفتگی', 'مدیریت'],
      priority: 'high',
      status: 'completed',
      progress: 100,
      plannedDate: todayIso,
      plannedStartTime: '09:00',
      plannedEndTime: '10:30',
      actualStartTime: '09:05',
      actualEndTime: '10:20',
      subtasks: [
        { id: 'st1', title: 'استخراج داده‌های خواب و انرژی', completed: true },
        { id: 'st2', title: 'تحلیل همبستگی تمرکز و کیفیت روز', completed: true },
      ],
      notes: 'کیفیت تمرکز در این جلسه بسیار بالا بود.',
      recurrence: 'none',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      focusMinutesTotal: 75,
      linkedGoalId: 'g_flutter',
      createdAt: getDateStr(-1),
      updatedAt: todayIso,
    },
    {
      id: 't_today_2',
      title: 'جلسه بازبینی رابط کاربری گلس‌مورفیسم دارک',
      description: 'بررسی کنتراست رنگ‌های #91A8FF و #7C5CFC روی پس‌زمینه #070A12',
      category: 'work',
      tags: ['طراحی', 'UI/UX', 'Linear'],
      priority: 'urgent',
      status: 'in_progress',
      progress: 50,
      plannedDate: todayIso,
      plannedStartTime: '11:00',
      plannedEndTime: '12:30',
      subtasks: [
        { id: 'st3', title: 'بررسی حالت راست‌چین (RTL) و فونت وزیرمتن', completed: true },
        { id: 'st4', title: 'بهینه‌سازی ابعاد دکمه‌ها و فاصله امن موبایل', completed: false },
      ],
      recurrence: 'none',
      reminderEnabled: true,
      focusMinutesTotal: 45,
      createdAt: getDateStr(-1),
      updatedAt: todayIso,
    },
    {
      id: 't_today_3',
      title: 'تمرین هوازی و پیاده‌روی سریع عصرگاهی',
      description: '۴۵ دقیقه در پارک نزدیک یا تردمیل با شیب ملایم',
      category: 'health',
      tags: ['سلامتی', 'ورزش'],
      priority: 'medium',
      status: 'planned',
      progress: 0,
      plannedDate: todayIso,
      plannedStartTime: '18:00',
      plannedEndTime: '18:45',
      subtasks: [],
      recurrence: 'daily',
      reminderEnabled: true,
      reminderMinutesBefore: 30,
      linkedGoalId: 'g_fitness',
      createdAt: todayIso,
      updatedAt: todayIso,
    },
    {
      id: 't_today_4',
      title: 'مرور روزانه و نگارش ژورنال شخصی',
      description: 'ثبت نمرات ۶ گانه رضایت، حال روحی، انرژی، تمرکز و دستاوردهای روز',
      category: 'personal',
      tags: ['ژورنال', 'مرور_روزانه', 'آرامش'],
      priority: 'high',
      status: 'planned',
      progress: 0,
      plannedDate: todayIso,
      plannedStartTime: '21:30',
      plannedEndTime: '22:00',
      subtasks: [],
      recurrence: 'daily',
      reminderEnabled: true,
      createdAt: todayIso,
      updatedAt: todayIso,
    },

    // Overdue task from yesterday
    {
      id: 't_overdue_1',
      title: 'ساماندهی یادداشت‌های صوتی اینباکس و دسته‌بندی ایده‌ها',
      description: 'انتقال ایده‌های خام ثبت شده در اینباکس به پروژه‌ها یا حذف موارد غیرضروری',
      category: 'personal',
      tags: ['اینباکس', 'سازماندهی'],
      priority: 'medium',
      status: 'planned',
      progress: 0,
      plannedDate: getDateStr(-1),
      plannedStartTime: '16:00',
      plannedEndTime: '17:00',
      subtasks: [],
      recurrence: 'none',
      reminderEnabled: false,
      createdAt: getDateStr(-2),
      updatedAt: getDateStr(-1),
    },

    // Upcoming tasks for tomorrow
    {
      id: 't_upcoming_1',
      title: 'بررسی امنیت داده‌ها و مکانیزم رمزگذاری پین لوکال',
      description: 'اطمینان از هش امن SHA-256 در وب و آمادگی ذخیره‌سازی کلید برای نسخه فلاتر',
      category: 'work',
      tags: ['امنیت', 'کدنویسی'],
      priority: 'high',
      status: 'planned',
      progress: 0,
      plannedDate: getDateStr(1),
      plannedStartTime: '10:00',
      plannedEndTime: '11:30',
      subtasks: [],
      recurrence: 'none',
      reminderEnabled: true,
      createdAt: todayIso,
      updatedAt: todayIso,
    },
    {
      id: 't_upcoming_2',
      title: 'خرید تجهیزات و کتاب جدید پادکست',
      category: 'finance',
      tags: ['خرید', 'توسعه_فردی'],
      priority: 'low',
      status: 'planned',
      progress: 0,
      plannedDate: getDateStr(2),
      plannedStartTime: '15:00',
      plannedEndTime: '16:30',
      subtasks: [],
      recurrence: 'none',
      reminderEnabled: false,
      createdAt: todayIso,
      updatedAt: todayIso,
    },
  ];

  for (const t of tasks) {
    await db.saveTask(t);
  }

  // 4. Daily Reviews for past 6 days
  const pastReviews: DailyReview[] = [
    {
      id: getDateStr(-6),
      date: getDateStr(-6),
      satisfaction: 82,
      mood: 85,
      energy: 78,
      focus: 80,
      productivity: 85,
      sleepQuality: 88,
      notes: 'شروع عالی هفته، انرژی بالا و کارایی چشمگیر در تمام تسک‌ها.',
      wins: ['تکمیل تسک‌های مهم صبح', 'ورزش پرانرژی'],
      updatedAt: getDateStr(-6),
    },
    {
      id: getDateStr(-5),
      date: getDateStr(-5),
      satisfaction: 75,
      mood: 72,
      energy: 70,
      focus: 76,
      productivity: 78,
      sleepQuality: 75,
      notes: 'روز کاری پرمشغله همراه با جلسات متعدد تیمی.',
      wins: ['ارائه موفق گزارش'],
      updatedAt: getDateStr(-5),
    },
    {
      id: getDateStr(-4),
      date: getDateStr(-4),
      satisfaction: 88,
      mood: 90,
      energy: 85,
      focus: 92,
      productivity: 90,
      sleepQuality: 82,
      notes: 'یکی از پربارترین روزهای هفته با ۲ ساعت فوکوس دیپ‌ورک پیوسته.',
      wins: ['حل چالش الگوریتم تقویم شمسی', 'مدیتیشن آرامش‌بخش'],
      updatedAt: getDateStr(-4),
    },
    {
      id: getDateStr(-3),
      date: getDateStr(-3),
      satisfaction: 68,
      mood: 65,
      energy: 60,
      focus: 64,
      productivity: 70,
      sleepQuality: 60,
      notes: 'کمی احساس خستگی ناشی از خواب ناکافی شب گذشته.',
      wins: ['پایان تسک‌های ضروری'],
      updatedAt: getDateStr(-3),
    },
    {
      id: getDateStr(-2),
      date: getDateStr(-2),
      satisfaction: 90,
      mood: 92,
      energy: 88,
      focus: 86,
      productivity: 88,
      sleepQuality: 92,
      notes: 'جبران کم‌خوابی و بازگشت کامل انرژی و روحیه عالی.',
      wins: ['ورزش صبحگاهی ۴۰ دقیقه', 'مطالعه فصل ۵ کتاب'],
      updatedAt: getDateStr(-2),
    },
    {
      id: getDateStr(-1),
      date: getDateStr(-1),
      satisfaction: 84,
      mood: 80,
      energy: 82,
      focus: 88,
      productivity: 85,
      sleepQuality: 84,
      notes: 'پیشرفت محسوس در معماری محصول و رضایت از دستاوردهای تیمی.',
      wins: ['تکمیل پیش‌نویس برنامه ماه آینده'],
      updatedAt: getDateStr(-1),
    },
  ];

  for (const r of pastReviews) {
    await db.saveDailyReview(r);
  }

  // 5. Journal Entries
  const journalEntries: JournalEntry[] = [
    {
      id: 'j_1',
      date: getDateStr(-1),
      createdAt: `${getDateStr(-1)}T22:30:00.000Z`,
      title: 'قدرت انضباط شخصی در مقایسه با انگیزه لحظه‌ای',
      content:
        'امروز عمیقاً درک کردم که انگیزه مثل یک جرقه اولیه است، اما این عادت‌ها و سیستم‌ها هستند که آتش را زنده نگه می‌دارند. وقتی سیستم مدیریت زندگی ساده و روان باشد و در برابر چالش‌های روزمره پاسخگویی سریعی داشته باشیم، استرس ذهن به شکل چشمگیری افت می‌کند.',
      mood: 'inspired',
      tags: ['توسعه_فردی', 'انضباط', 'بینش'],
      isPinned: true,
      updatedAt: `${getDateStr(-1)}T22:30:00.000Z`,
    },
    {
      id: 'j_2',
      date: getDateStr(-3),
      createdAt: `${getDateStr(-3)}T21:45:00.000Z`,
      title: 'تأمل در باب کیفیت خواب و بازیابی ذهن',
      content:
        'دیشب خواب سبکی داشتم و اثر مستقیم آن را روی تصمیم‌گیری‌ها و میزان صبوری‌ام دیدم. امشب نیم ساعت زودتر به رختخواب خواهم رفت و تلفن همراه را یک ساعت قبل از خواب کنار می‌گذارم.',
      mood: 'down',
      tags: ['سلامتی', 'خواب', 'آگاهی'],
      isPinned: false,
      updatedAt: `${getDateStr(-3)}T21:45:00.000Z`,
    },
    {
      id: 'j_3',
      date: getDateStr(-5),
      createdAt: `${getDateStr(-5)}T23:10:00.000Z`,
      title: 'خلق تجربیات کاربری ملموس با شیشه و نور',
      content:
        'استفاده از الگوهای Glassmorphism تیره با حاشیه‌های بسیار ظریف و شفاف حس کاربری فوق‌العاده آرامی به اپلیکیشن می‌دهد. احساس تعادل بین زیبایی و کارایی همان چیزی است که به دنبالش بودم.',
      mood: 'great',
      tags: ['طراحی', 'زیبایی‌شناسی'],
      isPinned: false,
      updatedAt: `${getDateStr(-5)}T23:10:00.000Z`,
    },
  ];

  for (const j of journalEntries) {
    await db.saveJournalEntry(j);
  }

  // 6. Sleep Sessions
  const sleepSessions: SleepSession[] = [
    {
      id: 'sl_1',
      date: getDateStr(-1),
      bedtime: `${getDateStr(-1)}T23:30:00.000Z`,
      wakeTime: `${todayIso}T07:15:00.000Z`,
      durationMinutes: 465, // 7h 45m
      quality: 88,
      notes: 'خواب عمیق و بیداری سرحال همراه با نور ملایم صبح.',
      isActive: false,
      createdAt: `${getDateStr(-1)}T23:30:00.000Z`,
    },
    {
      id: 'sl_2',
      date: getDateStr(-2),
      bedtime: `${getDateStr(-2)}T23:45:00.000Z`,
      wakeTime: `${getDateStr(-1)}T07:30:00.000Z`,
      durationMinutes: 465,
      quality: 85,
      notes: 'خواب باکیفیت و بدون وقفه.',
      isActive: false,
      createdAt: `${getDateStr(-2)}T23:45:00.000Z`,
    },
    {
      id: 'sl_3',
      date: getDateStr(-3),
      bedtime: `${getDateStr(-3)}T01:00:00.000Z`,
      wakeTime: `${getDateStr(-2)}T06:45:00.000Z`,
      durationMinutes: 345, // 5h 45m
      quality: 62,
      notes: 'خواب دیرهنگام به دلیل مطالعه کتاب.',
      isActive: false,
      createdAt: `${getDateStr(-3)}T01:00:00.000Z`,
    },
    {
      id: 'sl_4',
      date: getDateStr(-4),
      bedtime: `${getDateStr(-4)}T23:15:00.000Z`,
      wakeTime: `${getDateStr(-3)}T07:15:00.000Z`,
      durationMinutes: 480, // 8h
      quality: 90,
      notes: 'عالی، خواب عمیق طولانی.',
      isActive: false,
      createdAt: `${getDateStr(-4)}T23:15:00.000Z`,
    },
    {
      id: 'sl_5',
      date: getDateStr(-5),
      bedtime: `${getDateStr(-5)}T23:50:00.000Z`,
      wakeTime: `${getDateStr(-4)}T07:05:00.000Z`,
      durationMinutes: 435, // 7h 15m
      quality: 78,
      isActive: false,
      createdAt: `${getDateStr(-5)}T23:50:00.000Z`,
    },
  ];

  for (const s of sleepSessions) {
    await db.saveManualSleepSession(s);
  }

  // 7. Focus Sessions
  const focusSessions: FocusSession[] = [
    {
      id: 'fs_1',
      taskId: 't_today_1',
      taskTitle: 'بررسی شاخص‌های هفتگی و تهیه گزارش پیشرفت',
      category: 'work',
      startTime: `${todayIso}T09:05:00.000Z`,
      endTime: `${todayIso}T09:50:00.000Z`,
      durationMinutes: 45,
      completed: true,
      notes: 'تمرکز بالا روی شاخص‌های تحلیلی',
    },
    {
      id: 'fs_2',
      taskId: 't_today_1',
      taskTitle: 'بررسی شاخص‌های هفتگی و تهیه گزارش پیشرفت',
      category: 'work',
      startTime: `${todayIso}T09:55:00.000Z`,
      endTime: `${todayIso}T10:25:00.000Z`,
      durationMinutes: 30,
      completed: true,
    },
    {
      id: 'fs_3',
      taskId: 't_today_2',
      taskTitle: 'جلسه بازبینی رابط کاربری گلس‌مورفیسم دارک',
      category: 'work',
      startTime: `${todayIso}T11:00:00.000Z`,
      endTime: `${todayIso}T11:45:00.000Z`,
      durationMinutes: 45,
      completed: true,
    },
    {
      id: 'fs_4',
      taskTitle: 'بررسی مقالات علمی خواب REM و بهره‌وری',
      category: 'learning',
      startTime: `${getDateStr(-1)}T15:00:00.000Z`,
      endTime: `${getDateStr(-1)}T15:50:00.000Z`,
      durationMinutes: 50,
      completed: true,
    },
    {
      id: 'fs_5',
      taskTitle: 'کدنویسی ماژول رمزنگاری کلاینت',
      category: 'work',
      startTime: `${getDateStr(-2)}T10:00:00.000Z`,
      endTime: `${getDateStr(-2)}T11:00:00.000Z`,
      durationMinutes: 60,
      completed: true,
    },
  ];

  for (const f of focusSessions) {
    await db.saveFocusSession(f);
  }

  // 8. Inbox Items
  const inboxItems: InboxItem[] = [
    {
      id: 'inb_1',
      text: 'بررسی متدولوژی PARA در کنار ابزار LifeLog برای دسته‌بندی فایل‌های مرجع',
      createdAt: `${todayIso}T08:15:00.000Z`,
      category: 'learning',
      processed: false,
    },
    {
      id: 'inb_2',
      text: 'خرید باتری شارژی برای ماوس ارگونومیک و پد مچ دست',
      createdAt: `${getDateStr(-1)}T14:20:00.000Z`,
      category: 'personal',
      processed: false,
    },
    {
      id: 'inb_3',
      text: 'پیشنهاد جلسه اشتراک دانش با تیم بک‌اند درباره پروتکل همگام‌سازی MySQL',
      createdAt: `${getDateStr(-2)}T18:00:00.000Z`,
      category: 'work',
      processed: true,
    },
  ];

  for (const inb of inboxItems) {
    await db.saveInboxItem(inb);
  }
}
