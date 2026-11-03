import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../utils/jalali_calendar.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_card.dart';
import '../widgets/circular_progress.dart';
import 'daily_review_sheet.dart';
import 'focus_timer_sheet.dart';
import 'sleep_screen.dart';
import 'journal_screen.dart';
import 'habits_goals_screen.dart';
import 'task_edit_sheet.dart';

class TodayScreen extends StatelessWidget {
  const TodayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Personalized Greeting for Yasin
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.auto_awesome, color: AppColors.accent, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        state.greeting,
                        style: const TextStyle(
                          fontFamily: 'Vazirmatn',
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.accent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    state.naturalPersonalizedPrompt,
                    style: const TextStyle(
                      fontFamily: 'Vazirmatn',
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),

              // Review Button
              ElevatedButton.icon(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => const DailyReviewSheet(),
                  );
                },
                icon: const Icon(Icons.sentiment_satisfied_alt_rounded, size: 16, color: AppColors.accent),
                label: const Text(
                  'مرور روز',
                  style: TextStyle(
                    fontFamily: 'Vazirmatn',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.accent,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.surfaceCard,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppColors.glassBorder),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Overdue Alert if any
          if (state.overdueTasks.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.error.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${PersianNumbers.toPersian(state.overdueTasks.length)} کار معوقه نیاز به زمان‌بندی مجدد دارد',
                      style: const TextStyle(
                        fontFamily: 'Vazirmatn',
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.error,
                      ),
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, color: AppColors.error, size: 12),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // KPI Rings Row: Completion & Productivity
          Row(
            children: [
              Expanded(
                child: GlassCard(
                  child: Column(
                    children: [
                      CircularProgressIndicatorWidget(
                        percentage: state.completionPercentage.toDouble(),
                        color: AppColors.accent,
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'تکمیل کارهای روز',
                        style: TextStyle(
                          fontFamily: 'Vazirmatn',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        '${PersianNumbers.toPersian(state.completedTodayTasks.length)} از ${PersianNumbers.toPersian(state.todayTasks.length)} تسک',
                        style: const TextStyle(
                          fontFamily: 'Vazirmatn',
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GlassCard(
                  child: Column(
                    children: [
                      CircularProgressIndicatorWidget(
                        percentage: state.dailyProductivityScore.toDouble(),
                        color: AppColors.secondaryAccent,
                        centerText: PersianNumbers.toPersian(state.dailyProductivityScore),
                        subtext: '/ ۱۰۰',
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'امتیاز بهره‌وری',
                        style: TextStyle(
                          fontFamily: 'Vazirmatn',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const Text(
                        'محاسبه هوشمند محلی',
                        style: TextStyle(
                          fontFamily: 'Vazirmatn',
                          fontSize: 11,
                          color: AppColors.success,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Vitals Row: Focus, Sleep, Energy
          Row(
            children: [
              Expanded(
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => const FocusTimerSheet(),
                    );
                  },
                  child: Column(
                    children: [
                      const Icon(Icons.timer_outlined, color: AppColors.secondaryAccent, size: 20),
                      const SizedBox(height: 6),
                      const Text('تمرکز امروز', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                      const SizedBox(height: 2),
                      Text(
                        '${PersianNumbers.toPersian(state.focusMinutesToday)} دقیقه',
                        style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SleepScreen()));
                  },
                  child: Column(
                    children: [
                      const Icon(Icons.nightlight_round, color: Color(0xFF38BDF8), size: 20),
                      const SizedBox(height: 6),
                      const Text('خواب دیشب', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                      const SizedBox(height: 2),
                      Text(
                        state.lastNightSleep != null
                            ? '${PersianNumbers.toPersian(state.lastNightSleep!.durationMinutes ~/ 60)}h ${PersianNumbers.toPersian(state.lastNightSleep!.durationMinutes % 60)}m'
                            : '۷h ۳۰m',
                        style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => const DailyReviewSheet(),
                    );
                  },
                  child: Column(
                    children: [
                      const Icon(Icons.bolt, color: AppColors.success, size: 20),
                      const SizedBox(height: 6),
                      const Text('حال و انرژی', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                      const SizedBox(height: 2),
                      Text(
                        state.todayReview != null ? '${PersianNumbers.toPersian(state.todayReview!.energy)}%' : 'ثبت نشده',
                        style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.success),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Habits Checklist
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.local_fire_department_rounded, color: AppColors.warning, size: 20),
                        SizedBox(width: 6),
                        Text(
                          'عادات روزانه یاسین',
                          style: TextStyle(
                            fontFamily: 'Vazirmatn',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      '${PersianNumbers.toPersian(state.todayCompletedHabitCount)} / ${PersianNumbers.toPersian(state.habits.length)}',
                      style: const TextStyle(
                        fontFamily: 'Vazirmatn',
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (state.habits.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(12),
                      child: Text('عادت فعالی تعریف نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textMuted)),
                    ),
                  )
                else
                  ...state.habits.map((habit) {
                    final isDone = state.habitLogs.any((l) => l.habitId == habit.id && l.date == state.todayIso && l.completed);

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: InkWell(
                        onTap: () => state.toggleHabitLog(habit.id, state.todayIso),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: isDone ? AppColors.success.withOpacity(0.12) : AppColors.surfaceCard,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDone ? AppColors.success.withOpacity(0.3) : AppColors.glassBorder,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isDone ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                                color: isDone ? AppColors.success : AppColors.textMuted,
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  habit.title,
                                  style: TextStyle(
                                    fontFamily: 'Vazirmatn',
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    decoration: isDone ? TextDecoration.lineThrough : null,
                                    color: isDone ? AppColors.textMuted : AppColors.textPrimary,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.05),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '${PersianNumbers.toPersian(state.calculateStreak(habit.id))} روز',
                                  style: const TextStyle(
                                    fontFamily: 'Vazirmatn',
                                    fontSize: 10,
                                    color: AppColors.warning,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Today's Timeline / Tasks
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.schedule, color: AppColors.accent, size: 20),
                        SizedBox(width: 6),
                        Text(
                          'گاه‌شمار کارهای امروز',
                          style: TextStyle(
                            fontFamily: 'Vazirmatn',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => const TaskEditSheet(),
                        );
                      },
                      icon: const Icon(Icons.add, size: 16, color: AppColors.accent),
                      label: const Text('افزودن', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.accent)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (state.todayTasks.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text('کاری برای امروز ثبت نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textMuted)),
                    ),
                  )
                else
                  ...state.todayTasks.map((task) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.glassBorder),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            onPressed: () => state.toggleTaskComplete(task),
                            icon: Icon(
                              task.isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                              color: task.isCompleted ? AppColors.success : AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  task.title,
                                  style: TextStyle(
                                    fontFamily: 'Vazirmatn',
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                                    color: task.isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    if (task.plannedStartTime != null) ...[
                                      Text(
                                        task.plannedStartTime!,
                                        style: const TextStyle(fontSize: 10, color: AppColors.accent, fontFamily: 'Vazirmatn'),
                                      ),
                                      const SizedBox(width: 8),
                                    ],
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.06),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        task.category,
                                        style: const TextStyle(fontSize: 9, color: AppColors.textSecondary, fontFamily: 'Vazirmatn'),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (_) => TaskEditSheet(taskToEdit: task),
                              );
                            },
                            icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Shortcut Cards: Journal & Habits
          Row(
            children: [
              Expanded(
                child: GlassCard(
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const JournalScreen()));
                  },
                  child: const Row(
                    children: [
                      Icon(Icons.menu_book_rounded, color: AppColors.accent, size: 24),
                      SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ژورنال یاسین', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                          Text('ثبت افکار روزانه', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GlassCard(
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const HabitsGoalsScreen()));
                  },
                  child: const Row(
                    children: [
                      Icon(Icons.flag_rounded, color: AppColors.success, size: 24),
                      SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('اهداف و عادات', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                          Text('پیشرفت اهداف', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
