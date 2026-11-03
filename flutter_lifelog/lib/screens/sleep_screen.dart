import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../models/sleep_session.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_card.dart';
import '../widgets/glass_button.dart';

class SleepScreen extends StatefulWidget {
  const SleepScreen({super.key});

  @override
  State<SleepScreen> createState() => _SleepScreenState();
}

class _SleepScreenState extends State<SleepScreen> {
  Timer? _liveTimer;
  int _elapsedSeconds = 0;

  @override
  void initState() {
    super.initState();
    _startLiveTimer();
  }

  void _startLiveTimer() {
    _liveTimer?.cancel();
    _liveTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final state = context.read<AppState>();
      final active = state.activeSleepSession;
      if (active != null) {
        final start = DateTime.parse(active.bedtime);
        setState(() {
          _elapsedSeconds = DateTime.now().difference(start).inSeconds;
        });
      }
    });
  }

  @override
  void dispose() {
    _liveTimer?.cancel();
    super.dispose();
  }

  void _showEndSleepDialog(SleepSession session) {
    int quality = 85;
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.glassBorder),
          ),
          title: const Text('پایان خواب و ثبت ارزیابی', style: TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('کیفیت خواب', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13)),
                  Text('${PersianNumbers.toPersian(quality)}%', style: const TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                ],
              ),
              Slider(
                value: quality.toDouble(),
                min: 0,
                max: 100,
                activeColor: const Color(0xFF38BDF8),
                onChanged: (v) => setDialogState(() => quality = v.round()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: notesController,
                style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12),
                decoration: InputDecoration(
                  labelText: 'یادداشت بیداری (اختیاری)',
                  filled: true,
                  fillColor: AppColors.surfaceCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('انصراف', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textMuted)),
            ),
            ElevatedButton(
              onPressed: () {
                context.read<AppState>().endSleep(session.id, quality, notesController.text.trim());
                Navigator.pop(ctx);
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
              child: const Text('ثبت و پایان خواب', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  void _showManualEntryDialog() {
    final now = DateTime.now();
    String dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    int hours = 7;
    int mins = 30;
    int quality = 80;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.glassBorder),
          ),
          title: const Text('ثبت دستی رکورد خواب', style: TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('مدت زمان خواب', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13)),
                  Text('${PersianNumbers.toPersian(hours)} ساعت و ${PersianNumbers.toPersian(mins)} دقیقه',
                      style: const TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold, color: AppColors.accent)),
                ],
              ),
              Slider(
                value: hours.toDouble(),
                min: 3,
                max: 12,
                divisions: 9,
                activeColor: AppColors.accent,
                onChanged: (v) => setDialogState(() => hours = v.round()),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('کیفیت خواب', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13)),
                  Text('${PersianNumbers.toPersian(quality)}%', style: const TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                ],
              ),
              Slider(
                value: quality.toDouble(),
                min: 0,
                max: 100,
                activeColor: const Color(0xFF38BDF8),
                onChanged: (v) => setDialogState(() => quality = v.round()),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('انصراف', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textMuted)),
            ),
            ElevatedButton(
              onPressed: () {
                final totalMins = (hours * 60) + mins;
                final bedtime = now.subtract(Duration(minutes: totalMins));
                final session = SleepSession(
                  id: 'sleep_${DateTime.now().millisecondsSinceEpoch}',
                  date: dateStr,
                  bedtime: bedtime.toIso8601String(),
                  wakeTime: now.toIso8601String(),
                  durationMinutes: totalMins,
                  quality: quality,
                  isActive: false,
                  createdAt: DateTime.now().toIso8601String(),
                );
                context.read<AppState>().saveManualSleep(session);
                Navigator.pop(ctx);
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent),
              child: const Text('ذخیره', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final active = state.activeSleepSession;

    final hours = _elapsedSeconds ~/ 3600;
    final mins = (_elapsedSeconds % 3600) ~/ 60;
    final secs = _elapsedSeconds % 60;
    final timeStr =
        '${hours.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';

    final endedSessions = state.sleepSessions.where((s) => !s.isActive).toList();
    final avgMinutes = endedSessions.isNotEmpty
        ? (endedSessions.fold(0, (sum, s) => sum + s.durationMinutes) / endedSessions.length).round()
        : 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('ردیابی خواب یاسین'),
        actions: [
          IconButton(
            onPressed: _showManualEntryDialog,
            icon: const Icon(Icons.add, color: AppColors.accent),
            tooltip: 'ثبت دستی خواب',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            // Active Session Card
            if (active != null)
              GlassCard(
                glowColor: const Color(0xFF38BDF8),
                child: Column(
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.nightlight_round, color: Color(0xFF38BDF8), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'جلسه خواب فعال است...',
                          style: TextStyle(
                            fontFamily: 'Vazirmatn',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF38BDF8),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      PersianNumbers.toPersian(timeStr),
                      style: const TextStyle(
                        fontFamily: 'Vazirmatn',
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      onPressed: () => _showEndSleepDialog(active),
                      icon: const Icon(Icons.wb_sunny_rounded, color: Colors.black),
                      label: const Text('بیدار شدم (پایان خواب)', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    ),
                  ],
                ),
              )
            else
              GlassCard(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('آماده خواب شبانه هستید یاسین؟', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                        SizedBox(height: 2),
                        Text('محاسبه دقیق مدت خواب تا صبح', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                    GlassButton(
                      onPressed: () => state.startSleep(),
                      icon: const Icon(Icons.play_arrow_rounded, color: Colors.black, size: 18),
                      child: const Text('شروع خواب'),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 16),

            // Average Stats Card
            Row(
              children: [
                Expanded(
                  child: GlassCard(
                    child: Column(
                      children: [
                        const Text('میانگین خواب', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Text(
                          '${PersianNumbers.toPersian(avgMinutes ~/ 60)}h ${PersianNumbers.toPersian(avgMinutes % 60)}m',
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: GlassCard(
                    child: Column(
                      children: [
                        const Text('تعداد شب‌های ثبت‌شده', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Text(
                          '${PersianNumbers.toPersian(endedSessions.length)} شب',
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF38BDF8)),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // History List
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('تاریخچه خواب‌های گذشته', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const SizedBox(height: 10),
                  if (endedSessions.isEmpty)
                    const Center(child: Padding(padding: EdgeInsets.all(16), child: Text('رکوردی ثبت نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textMuted))))
                  else
                    ...endedSessions.map((s) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.glassBorder),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.nightlight_round, color: Color(0xFF38BDF8), size: 18),
                                const SizedBox(width: 8),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(s.date, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                    if (s.notes != null)
                                      Text(s.notes!, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textMuted)),
                                  ],
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('${PersianNumbers.toPersian(s.durationMinutes ~/ 60)}h ${PersianNumbers.toPersian(s.durationMinutes % 60)}m', style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                Text('کیفیت: ${PersianNumbers.toPersian(s.quality)}%', style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.success)),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
