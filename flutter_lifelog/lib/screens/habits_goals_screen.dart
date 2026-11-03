import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../models/habit.dart';
import '../models/goal.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_card.dart';

class HabitsGoalsScreen extends StatefulWidget {
  const HabitsGoalsScreen({super.key});

  @override
  State<HabitsGoalsScreen> createState() => _HabitsGoalsScreenState();
}

class _HabitsGoalsScreenState extends State<HabitsGoalsScreen> {
  int _tabIndex = 0; // 0=Habits, 1=Goals

  void _showNewHabitDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('تعریف عادت جدید برای یاسین', style: TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: 'عنوان عادت *'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'توضیحات و هدف انگیزه'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('انصراف')),
          ElevatedButton(
            onPressed: () {
              final title = titleController.text.trim();
              if (title.isEmpty) return;
              final habit = Habit(
                id: 'habit_${DateTime.now().millisecondsSinceEpoch}',
                title: title,
                description: descController.text.trim(),
                createdAt: DateTime.now().toIso8601String(),
              );
              context.read<AppState>().saveHabit(habit);
              Navigator.pop(ctx);
            },
            child: const Text('ایجاد'),
          ),
        ],
      ),
    );
  }

  void _showNewGoalDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('هدف استراتژیک جدید یاسین', style: TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: 'عنوان هدف *'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'توضیحات و نقشه راه'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('انصراف')),
          ElevatedButton(
            onPressed: () {
              final title = titleController.text.trim();
              if (title.isEmpty) return;
              final now = DateTime.now();
              final goal = Goal(
                id: 'goal_${DateTime.now().millisecondsSinceEpoch}',
                title: title,
                description: descController.text.trim(),
                targetDate: '${now.year + 1}-01-01',
                progress: 0,
                createdAt: now.toIso8601String(),
                updatedAt: now.toIso8601String(),
              );
              context.read<AppState>().saveGoal(goal);
              Navigator.pop(ctx);
            },
            child: const Text('ثبت هدف'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('عادت‌ها و اهداف یاسین'),
        actions: [
          IconButton(
            onPressed: _tabIndex == 0 ? _showNewHabitDialog : _showNewGoalDialog,
            icon: const Icon(Icons.add, color: AppColors.accent),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            // Tabs Row
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() => _tabIndex = 0),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _tabIndex == 0 ? AppColors.success : AppColors.surfaceCard,
                    ),
                    child: Text('عادت‌ها (${PersianNumbers.toPersian(state.habits.length)})',
                        style: TextStyle(fontFamily: 'Vazirmatn', color: _tabIndex == 0 ? Colors.black : AppColors.textPrimary)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() => _tabIndex = 1),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _tabIndex == 1 ? AppColors.accent : AppColors.surfaceCard,
                    ),
                    child: Text('اهداف (${PersianNumbers.toPersian(state.goals.length)})',
                        style: TextStyle(fontFamily: 'Vazirmatn', color: _tabIndex == 1 ? Colors.black : AppColors.textPrimary)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Content
            if (_tabIndex == 0) ...[
              if (state.habits.isEmpty)
                const Center(child: Padding(padding: EdgeInsets.all(40), child: Text('عادتی تعریف نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textMuted))))
              else
                ...state.habits.map((habit) {
                  final isDone = state.habitLogs.any((l) => l.habitId == habit.id && l.date == state.todayIso && l.completed);
                  final streak = state.calculateStreak(habit.id);

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GlassCard(
                      child: Row(
                        children: [
                          IconButton(
                            onPressed: () => state.toggleHabitLog(habit.id, state.todayIso),
                            icon: Icon(
                              isDone ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                              color: isDone ? AppColors.success : AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  habit.title,
                                  style: TextStyle(
                                    fontFamily: 'Vazirmatn',
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    decoration: isDone ? TextDecoration.lineThrough : null,
                                    color: isDone ? AppColors.textMuted : AppColors.textPrimary,
                                  ),
                                ),
                                if (habit.description != null)
                                  Text(habit.description!, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.local_fire_department_rounded, color: AppColors.warning, size: 16),
                                const SizedBox(width: 4),
                                Text('${PersianNumbers.toPersian(streak)} روز', style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.warning)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
            ] else ...[
              if (state.goals.isEmpty)
                const Center(child: Padding(padding: EdgeInsets.all(40), child: Text('هدفی ثبت نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textMuted))))
              else
                ...state.goals.map((goal) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GlassCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(goal.title, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                              Text('${PersianNumbers.toPersian(goal.progress)}%', style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.accent)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          LinearProgressIndicator(
                            value: goal.progress / 100.0,
                            backgroundColor: Colors.white.withOpacity(0.08),
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(8),
                            minHeight: 6,
                          ),
                          if (goal.description != null) ...[
                            const SizedBox(height: 8),
                            Text(goal.description!, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                          ],
                        ],
                      ),
                    ),
                  );
                }),
            ],
          ],
        ),
      ),
    );
  }
}
