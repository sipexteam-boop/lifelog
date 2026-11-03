import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF070A12);
  static const Color surface = Color(0xFF101521);
  static const Color surfaceCard = Color(0xFF141A29);
  
  static const Color accent = Color(0xFF91A8FF);
  static const Color primaryAccent = Color(0xFF91A8FF);
  static const Color secondaryAccent = Color(0xFF7C5CFC);
  static const Color success = Color(0xFF35D6A0);
  static const Color warning = Color(0xFFFFBD69);
  static const Color error = Color(0xFFFF6B82);

  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  static const Color glassBorder = Color(0x2491A8FF);
  static const Color glassBorderHover = Color(0x4D91A8FF);
  static const Color glassSurface = Color(0xB8101521);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: 'Vazirmatn',
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accent,
        secondary: AppColors.secondaryAccent,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: 'Vazirmatn',
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.accent,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
