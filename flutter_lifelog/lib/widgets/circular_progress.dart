import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../utils/persian_numbers.dart';

class CircularProgressIndicatorWidget extends StatelessWidget {
  final double percentage; // 0 - 100
  final double size;
  final double strokeWidth;
  final Color color;
  final String? centerText;
  final String? subtext;

  const CircularProgressIndicatorWidget({
    super.key,
    required this.percentage,
    this.size = 100,
    this.strokeWidth = 8,
    this.color = AppColors.accent,
    this.centerText,
    this.subtext,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _CircularProgressPainter(
              percentage: percentage,
              strokeWidth: strokeWidth,
              color: color,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                centerText ?? '${PersianNumbers.toPersian(percentage.round())}%',
                style: const TextStyle(
                  fontFamily: 'Vazirmatn',
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              if (subtext != null)
                Text(
                  subtext!,
                  style: const TextStyle(
                    fontFamily: 'Vazirmatn',
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CircularProgressPainter extends CustomPainter {
  final double percentage;
  final double strokeWidth;
  final Color color;

  _CircularProgressPainter({
    required this.percentage,
    required this.strokeWidth,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Background track
    final trackPaint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, trackPaint);

    // Active arc
    final sweepAngle = 2 * pi * (percentage.clamp(0.0, 100.0) / 100.0);
    final activePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      sweepAngle,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _CircularProgressPainter oldDelegate) {
    return oldDelegate.percentage != percentage || oldDelegate.color != color;
  }
}
