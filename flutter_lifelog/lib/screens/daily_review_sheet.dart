import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/daily_review.dart';
import '../theme/app_colors.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_button.dart';

class DailyReviewSheet extends StatefulWidget {
  final String? customDate;

  const DailyReviewSheet({super.key, this.customDate});

  @override
  State<DailyReviewSheet> createState() => _DailyReviewSheetState();
}

class _DailyReviewSheetState extends State<DailyReviewSheet> {
  int _satisfaction = 80;
  int _mood = 80;
  int _energy = 75;
  int _focus = 80;
  int _productivity = 75;
  int _sleepQuality = 85;
  final _notesController = TextEditingController();
  final _winController = TextEditingController();
  List<String> _wins = [];

  @override
  void initState() {
    super.initState();
    final state = context.read<AppState>();
    final targetDate = widget.customDate ?? state.todayIso;
    final existing = state.dailyReviews.where((r) => r.date == targetDate).firstOrNull;

    if (existing != null) {
      _satisfaction = existing.satisfaction;
      _mood = existing.mood;
      _energy = existing.energy;
      _focus = existing.focus;
      _productivity = existing.productivity;
      _sleepQuality = existing.sleepQuality;
      _notesController.text = existing.notes ?? '';
      _wins = List.from(existing.wins);
    }
  }

  void _addWin() {
    final text = _winController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _wins.add(text);
        _winController.clear();
      });
    }
  }

  void _saveReview() {
    final state = context.read<AppState>();
    final targetDate = widget.customDate ?? state.todayIso;

    final review = DailyReview(
      id: targetDate,
      date: targetDate,
      satisfaction: _satisfaction,
      mood: _mood,
      energy: _energy,
      focus: _focus,
      productivity: _productivity,
      sleepQuality: _sleepQuality,
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
      wins: _wins,
      updatedAt: DateTime.now().toIso8601String(),
    );

    state.saveDailyReview(review);
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('مرور روزانه با موفقیت در پایگاه داده محلی ذخیره شد.'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final avgScore = ((_satisfaction + _mood + _energy + _focus + _productivity + _sleepQuality) / 6).round();

    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
      child: Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface.withOpacity(0.95),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.auto_awesome, color: AppColors.accent, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'مرور روزانه و ارزیابی ۶ شاخص',
                        style: TextStyle(
                          fontFamily: 'Vazirmatn',
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Average Score Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('میانگین کیفیت امروز یاسین', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    Text(
                      '${PersianNumbers.toPersian(avgScore)} / ۱۰۰',
                      style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.accent),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 6 Metrics Sliders
              _buildSliderRow('رضایت از روز', _satisfaction, (v) => setState(() => _satisfaction = v), AppColors.accent),
              _buildSliderRow('حال روحی', _mood, (v) => setState(() => _mood = v), AppColors.success),
              _buildSliderRow('سطح انرژی', _energy, (v) => setState(() => _energy = v), AppColors.warning),
              _buildSliderRow('تمرکز و کار عمیق', _focus, (v) => setState(() => _focus = v), AppColors.secondaryAccent),
              _buildSliderRow('بهره‌وری تسک‌ها', _productivity, (v) => setState(() => _productivity = v), AppColors.accent),
              _buildSliderRow('کیفیت خواب دیشب', _sleepQuality, (v) => setState(() => _sleepQuality = v), const Color(0xFF38BDF8)),

              const SizedBox(height: 14),

              // Wins & Highlights
              const Text('دستاوردها یا نکات مثبت امروز (Wins)', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _winController,
                      style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'یک نکته مثبت یا پیشرفت...',
                        filled: true,
                        fillColor: AppColors.surfaceCard,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onSubmitted: (_) => _addWin(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(onPressed: _addWin, icon: const Icon(Icons.add, size: 18)),
                ],
              ),
              if (_wins.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _wins.map((w) {
                    return Chip(
                      label: Text('✓ $w', style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.success)),
                      backgroundColor: AppColors.success.withOpacity(0.12),
                      side: BorderSide(color: AppColors.success.withOpacity(0.3)),
                      onDeleted: () => setState(() => _wins.remove(w)),
                    );
                  }).toList(),
                ),
              ],

              const SizedBox(height: 14),

              // Notes
              TextField(
                controller: _notesController,
                maxLines: 3,
                style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'تأملات و یادداشت جمع‌بندی روز',
                  filled: true,
                  fillColor: AppColors.surfaceCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),

              const SizedBox(height: 18),

              // Save button
              SizedBox(
                width: double.infinity,
                child: GlassButton(
                  onPressed: _saveReview,
                  child: const Text('ذخیره مرور روزانه'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSliderRow(String label, int value, ValueChanged<int> onChanged, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                Text('${PersianNumbers.toPersian(value)}%', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: color)),
              ],
            ),
            Slider(
              value: value.toDouble(),
              min: 0,
              max: 100,
              activeColor: color,
              inactiveColor: Colors.white.withOpacity(0.1),
              onChanged: (v) => onChanged(v.round()),
            ),
          ],
        ),
      ),
    );
  }
}
