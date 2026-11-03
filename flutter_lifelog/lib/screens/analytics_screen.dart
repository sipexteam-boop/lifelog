import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_card.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  int _rangeDays = 7;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    final totalTasks = state.tasks.length;
    final completedTasks = state.tasks.where((t) => t.isCompleted).length;
    final completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).round() : 0;

    final totalFocusMinutes = state.focusSessions.fold(0, (sum, f) => sum + f.durationMinutes);
    final focusHours = (totalFocusMinutes / 60).toStringAsFixed(1);

    final endedSleep = state.sleepSessions.where((s) => !s.isActive).toList();
    final avgSleepMins = endedSleep.isNotEmpty
        ? (endedSleep.fold(0, (sum, s) => sum + s.durationMinutes) / endedSleep.length).round()
        : 0;

    final avgProductivity = state.dailyReviews.isNotEmpty
        ? (state.dailyReviews.fold(0, (sum, r) => sum + r.productivity) / state.dailyReviews.length).round()
        : 0;

    // Categories breakdown
    final Map<String, int> catCounts = {};
    for (final t in state.tasks) {
      catCounts[t.category] = (catCounts[t.category] ?? 0) + 1;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          const Text(
            'گزارش‌ها و تحلیل عملکرد',
            style: TextStyle(
              fontFamily: 'Vazirmatn',
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'تحلیل جامع بهره‌وری، خواب و عادات یاسین',
            style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 16),

          // 4 Core KPI Cards Grid
          Row(
            children: [
              Expanded(
                child: GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.check_circle_rounded, color: AppColors.accent, size: 20),
                      const SizedBox(height: 8),
                      Text('${PersianNumbers.toPersian(completionRate)}%',
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                      const Text('نرخ پایبندی به کارها', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.timer_outlined, color: AppColors.secondaryAccent, size: 20),
                      const SizedBox(height: 8),
                      Text('${PersianNumbers.toPersian(focusHours)}h',
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                      const Text('مجموع ساعات کار عمیق', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.nightlight_round, color: Color(0xFF38BDF8), size: 20),
                      const SizedBox(height: 8),
                      Text('${PersianNumbers.toPersian(avgSleepMins ~/ 60)}h ${PersianNumbers.toPersian(avgSleepMins % 60)}m',
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                      const Text('میانگین مدت خواب', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.trending_up_rounded, color: AppColors.warning, size: 20),
                      const SizedBox(height: 8),
                      Text('${PersianNumbers.toPersian(avgProductivity)}%',
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.warning)),
                      const Text('میانگین امتیاز بهره‌وری', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Categories Breakdown Card
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('توزیع دسته‌بندی کارها', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                const SizedBox(height: 12),
                if (catCounts.isEmpty)
                  const Text('کاری برای تحلیل وجود ندارد.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textMuted))
                else
                  ...catCounts.entries.map((entry) {
                    final percentage = totalTasks > 0 ? (entry.value / totalTasks) : 0.0;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(entry.key, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textPrimary)),
                              Text('${PersianNumbers.toPersian(entry.value)} مورد (${PersianNumbers.toPersian((percentage * 100).round())}%)',
                                  style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          LinearProgressIndicator(
                            value: percentage,
                            backgroundColor: Colors.white.withOpacity(0.08),
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(6),
                            minHeight: 5,
                          ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
