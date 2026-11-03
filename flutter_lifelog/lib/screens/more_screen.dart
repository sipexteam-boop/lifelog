import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../widgets/glass_card.dart';
import 'journal_screen.dart';
import 'focus_timer_sheet.dart';
import 'sleep_screen.dart';
import 'habits_goals_screen.dart';
import 'inbox_screen.dart';
import 'daily_review_sheet.dart';
import 'settings_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final menuItems = [
      {
        'title': 'ژورنال و خاطرات یاسین',
        'subtitle': 'ثبت احساسات، خاطرات و تأملات شخصی روزانه',
        'icon': Icons.menu_book_rounded,
        'color': AppColors.accent,
        'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const JournalScreen())),
      },
      {
        'title': 'تایمر تمرکز و کار عمیق',
        'subtitle': 'پومودورو، کار عمیق و انضباط فردی',
        'icon': Icons.timer_outlined,
        'color': AppColors.secondaryAccent,
        'action': () => showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (_) => const FocusTimerSheet(),
            ),
      },
      {
        'title': 'پایش خواب شبانه',
        'subtitle': 'جلسه خواب زنده، کیفیت بازیابی و میانگین هفتگی',
        'icon': Icons.nightlight_round,
        'color': const Color(0xFF38BDF8),
        'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SleepScreen())),
      },
      {
        'title': 'عادت‌ها و اهداف استراتژیک',
        'subtitle': 'پیگیری زنجیره‌ها، گام‌ها و نقاط عطف',
        'icon': Icons.local_fire_department_rounded,
        'color': AppColors.success,
        'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HabitsGoalsScreen())),
      },
      {
        'title': 'اینباکس سریع',
        'subtitle': 'ثبت فوری افکار و ایده‌ها بدون نیاز به تاریخ',
        'icon': Icons.inbox_rounded,
        'color': AppColors.warning,
        'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const InboxScreen())),
      },
      {
        'title': 'مرور روزانه ۶ شاخص',
        'subtitle': 'ارزیابی رضایت، خواب، تمرکز و انرژی',
        'icon': Icons.auto_awesome,
        'color': AppColors.accent,
        'action': () => showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (_) => const DailyReviewSheet(),
            ),
      },
      {
        'title': 'تنظیمات و امنیت محلی',
        'subtitle': 'نام، قفل PIN و بایومتریک، پشتیبان‌گیری و پایگاه داده',
        'icon': Icons.settings_outlined,
        'color': AppColors.textPrimary,
        'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen())),
      },
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'بیشتر',
            style: TextStyle(
              fontFamily: 'Vazirmatn',
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'ابزارهای تکمیلی سیستم عامل شخصی LifeLog یاسین',
            style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),

          ...menuItems.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GlassCard(
                onTap: item['action'] as VoidCallback,
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['title'] as String, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                          Text(item['subtitle'] as String, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 14),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
