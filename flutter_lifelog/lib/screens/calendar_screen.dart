import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../utils/jalali_calendar.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_card.dart';
import 'task_edit_sheet.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late JalaliDate _currentJalali;
  late DateTime _selectedDate;
  String _calendarMode = 'jalali'; // 'jalali' or 'gregorian'

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _currentJalali = JalaliCalendar.fromDateTime(_selectedDate);
  }

  void _prevMonth() {
    setState(() {
      if (_currentJalali.month == 1) {
        _currentJalali = JalaliDate(_currentJalali.year - 1, 12, 1);
      } else {
        _currentJalali = JalaliDate(_currentJalali.year, _currentJalali.month - 1, 1);
      }
    });
  }

  void _nextMonth() {
    setState(() {
      if (_currentJalali.month == 12) {
        _currentJalali = JalaliDate(_currentJalali.year + 1, 1, 1);
      } else {
        _currentJalali = JalaliDate(_currentJalali.year, _currentJalali.month + 1, 1);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final selectedIso =
        '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
    final selectedTasks = state.tasks.where((t) => t.plannedDate == selectedIso).toList();

    final monthDays = JalaliCalendar.getMonthDays(_currentJalali.year, _currentJalali.month);
    final firstDayGreg = JalaliCalendar.jalaliToGregorian(_currentJalali.year, _currentJalali.month, 1);
    final startWeekday = JalaliCalendar.getPersianWeekdayIndex(firstDayGreg);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Mode Switch (Jalali vs Gregorian)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'تقویم و گاه‌شماری',
                style: TextStyle(
                  fontFamily: 'Vazirmatn',
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.glassBorder),
                ),
                child: Row(
                  children: [
                    _buildModeButton('شمسی', 'jalali'),
                    _buildModeButton('میلادی', 'gregorian'),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Month Header Card
          GlassCard(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${JalaliCalendar.monthNamesFa[_currentJalali.month - 1]} ${PersianNumbers.toPersian(_currentJalali.year)}',
                      style: const TextStyle(
                        fontFamily: 'Vazirmatn',
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          onPressed: _prevMonth,
                          icon: const Icon(Icons.arrow_back_ios_rounded, size: 16, color: AppColors.accent),
                        ),
                        IconButton(
                          onPressed: _nextMonth,
                          icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppColors.accent),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Weekday Headers
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: JalaliCalendar.weekdaysShortFa.map((d) {
                    return Text(
                      d,
                      style: const TextStyle(
                        fontFamily: 'Vazirmatn',
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textMuted,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),

                // Days Grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                  ),
                  itemCount: startWeekday + monthDays,
                  itemBuilder: (context, index) {
                    if (index < startWeekday) {
                      return const SizedBox.shrink();
                    }
                    final dayNum = index - startWeekday + 1;
                    final cellGreg = JalaliCalendar.jalaliToGregorian(_currentJalali.year, _currentJalali.month, dayNum);
                    final cellIso =
                        '${cellGreg.year}-${cellGreg.month.toString().padLeft(2, '0')}-${cellGreg.day.toString().padLeft(2, '0')}';
                    final isSelected = cellIso == selectedIso;
                    final hasTasks = state.tasks.any((t) => t.plannedDate == cellIso);

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedDate = cellGreg;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.accent
                              : (cellIso == state.todayIso ? AppColors.accent.withOpacity(0.15) : Colors.transparent),
                          borderRadius: BorderRadius.circular(12),
                          border: isSelected
                              ? Border.all(color: AppColors.accent)
                              : (cellIso == state.todayIso ? Border.all(color: AppColors.accent.withOpacity(0.4)) : null),
                        ),
                        alignment: Alignment.center,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              PersianNumbers.toPersian(dayNum),
                              style: TextStyle(
                                fontFamily: 'Vazirmatn',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? const Color(0xFF070A12) : AppColors.textPrimary,
                              ),
                            ),
                            if (hasTasks)
                              Container(
                                width: 4,
                                height: 4,
                                margin: const EdgeInsets.only(top: 2),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF070A12) : AppColors.accent,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Selected Date Tasks List
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'کارهای روز انتخاب‌شده',
                          style: TextStyle(
                            fontFamily: 'Vazirmatn',
                            fontSize: 11,
                            color: AppColors.accent,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          JalaliCalendar.formatFull(_selectedDate),
                          style: const TextStyle(
                            fontFamily: 'Vazirmatn',
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => TaskEditSheet(initialDate: selectedIso),
                        );
                      },
                      icon: const Icon(Icons.add, size: 14, color: Color(0xFF070A12)),
                      label: const Text('افزودن', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: Color(0xFF070A12))),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accent,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (selectedTasks.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text('کاری برای این تاریخ ثبت نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textMuted)),
                    ),
                  )
                else
                  ...selectedTasks.map((task) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.glassBorder),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            onPressed: () => state.toggleTaskComplete(task),
                            icon: Icon(
                              task.isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                              color: task.isCompleted ? AppColors.success : AppColors.textMuted,
                              size: 20,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              task.title,
                              style: TextStyle(
                                fontFamily: 'Vazirmatn',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                                color: task.isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                              ),
                            ),
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

  Widget _buildModeButton(String label, String mode) {
    final isSelected = _calendarMode == mode;
    return GestureDetector(
      onTap: () => setState(() => _calendarMode = mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Vazirmatn',
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? const Color(0xFF070A12) : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}
