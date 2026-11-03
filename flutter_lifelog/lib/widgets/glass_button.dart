import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class GlassButton extends StatelessWidget {
  final Widget child;
  final VoidCallback onPressed;
  final bool isPrimary;
  final Widget? icon;
  final double height;
  final EdgeInsetsGeometry padding;

  const GlassButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.isPrimary = true,
    this.icon,
    this.height = 46,
    this.padding = const EdgeInsets.symmetric(horizontal: 18),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: isPrimary
            ? const LinearGradient(
                colors: [AppColors.accent, AppColors.secondaryAccent],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isPrimary ? null : AppColors.surfaceCard,
        border: Border.all(
          color: isPrimary ? Colors.transparent : AppColors.glassBorder,
          width: 1.0,
        ),
        boxShadow: isPrimary
            ? [
                BoxShadow(
                  color: AppColors.accent.withOpacity(0.35),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: padding,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  icon!,
                  const SizedBox(width: 8),
                ],
                DefaultTextStyle(
                  style: TextStyle(
                    fontFamily: 'Vazirmatn',
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: isPrimary ? const Color(0xFF070A12) : AppColors.textPrimary,
                  ),
                  child: child,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
