import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/focus_session.dart';
import '../theme/app_colors.dart';
import '../utils/persian_numbers.dart';
import '../widgets/circular_progress.dart';
import '../widgets/glass_button.dart';

class FocusTimerSheet extends StatefulWidget {
  const FocusTimerSheet({super.key});

  @override
  State<FocusTimerSheet> createState() => _FocusTimerSheetState();
}

class _FocusTimerSheetState extends State<FocusTimerSheet> {
  int _totalSeconds = 25 * 60;
  int _secondsRemaining = 25 * 60;
  bool _isRunning = false;
  bool _isPaused = false;
  String? _selectedTaskId;

  Timer? _timer;
  DateTime? _startTimestamp;

  void _switchMode(int minutes) {
    if (_isRunning) return;
    setState(() {
      _totalSeconds = minutes * 60;
      _secondsRemaining = minutes * 60;
    });
  }

  void _startTimer() {
    setState(() {
      _isRunning = true;
      _isPaused = false;
      _startTimestamp = DateTime.now();
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        _onFinish();
      }
    });
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() {
      _isPaused = true;
    });
  }

  void _resumeTimer() {
    setState(() {
      _isPaused = false;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        _onFinish();
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
      _isPaused = false;
      _secondsRemaining = _totalSeconds;
    });
  }

  void _onFinish() {
    _timer?.cancel();
    final durationMins = (_totalSeconds / 60).round();
    final state = context.read<AppState>();

    final session = FocusSession(
      id: 'fs_${DateTime.now().millisecondsSinceEpoch}',
      taskId: _selectedTaskId,
      taskTitle: state.tasks.where((t) => t.id == _selectedTaskId).firstOrNull?.title,
      startTime: _startTimestamp?.toIso8601String() ?? DateTime.now().toIso8601String(),
      endTime: DateTime.now().toIso8601String(),
      durationMinutes: durationMins,
      completed: true,
    );

    state.saveFocusSession(session);
    setState(() {
      _isRunning = false;
      _secondsRemaining = _totalSeconds;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('جلسه تمرکز یاسین ($durationMins دقیقه) با موفقیت ثبت شد! 🎉'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final minutes = _secondsRemaining ~/ 60;
    final seconds = _secondsRemaining % 60;
    final timeStr =
        '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    final progress = _totalSeconds > 0
        ? ((_totalSeconds - _secondsRemaining) / _totalSeconds) * 100
        : 0.0;

    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
      child: Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(context).padding.bottom + 24,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface.withOpacity(0.95),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.timer_outlined, color: AppColors.accent, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'تایمر تمرکز و کار عمیق',
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
            const SizedBox(height: 16),

            // Mode Selector
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildModeTab('پومودورو (۲۵د)', 25, _totalSeconds == 25 * 60),
                const SizedBox(width: 8),
                _buildModeTab('کار عمیق (۵۰د)', 50, _totalSeconds == 50 * 60),
                const SizedBox(width: 8),
                _buildModeTab('استراحت (۵د)', 5, _totalSeconds == 5 * 60),
              ],
            ),
            const SizedBox(height: 24),

            // Circular Visual Timer
            CircularProgressIndicatorWidget(
              percentage: progress,
              size: 160,
              strokeWidth: 10,
              color: AppColors.accent,
              centerText: PersianNumbers.toPersian(timeStr),
              subtext: _isRunning ? (_isPaused ? 'متوقف‌شده' : 'در حال تمرکز') : 'آماده شروع',
            ),
            const SizedBox(height: 20),

            // Task Selector
            DropdownButtonFormField<String>(
              value: _selectedTaskId,
              dropdownColor: AppColors.surfaceCard,
              decoration: InputDecoration(
                labelText: 'اتصال به کار (اختیاری)',
                filled: true,
                fillColor: AppColors.surfaceCard,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
              items: [
                const DropdownMenuItem(value: null, child: Text('بدون اتصال به کار خاص')),
                ...state.tasks.where((t) => !t.isCompleted).map((t) {
                  return DropdownMenuItem(value: t.id, child: Text(t.title, overflow: TextOverflow.ellipsis));
                }),
              ],
              onChanged: _isRunning ? null : (val) => setState(() => _selectedTaskId = val),
            ),
            const SizedBox(height: 20),

            // Controls
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (!_isRunning)
                  GlassButton(
                    onPressed: _startTimer,
                    icon: const Icon(Icons.play_arrow_rounded, color: Color(0xFF070A12)),
                    child: const Text('شروع تمرکز'),
                  )
                else ...[
                  if (_isPaused)
                    ElevatedButton.icon(
                      onPressed: _resumeTimer,
                      icon: const Icon(Icons.play_arrow_rounded, color: Colors.black),
                      label: const Text('ادامه', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black)),
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                    )
                  else
                    ElevatedButton.icon(
                      onPressed: _pauseTimer,
                      icon: const Icon(Icons.pause_rounded, color: Colors.black),
                      label: const Text('توقف موقت', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black)),
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning),
                    ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: _stopTimer,
                    icon: const Icon(Icons.stop_rounded, color: AppColors.error),
                    label: const Text('لغو', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.error)),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.error)),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeTab(String label, int minutes, bool isSelected) {
    return GestureDetector(
      onTap: () => _switchMode(minutes),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent : AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.accent : AppColors.glassBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Vazirmatn',
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? const Color(0xFF070A12) : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
