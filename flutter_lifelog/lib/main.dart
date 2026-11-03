import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'database/app_database.dart';
import 'providers/app_state.dart';
import 'services/notification_service.dart';
import 'theme/app_colors.dart';
import 'screens/today_screen.dart';
import 'screens/calendar_screen.dart';
import 'screens/tasks_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/more_screen.dart';
import 'screens/pin_lock_screen.dart';
import 'widgets/bottom_nav_bar.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge to edge immersive styling
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.background,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize SQLite local storage and native notifications
  final db = AppDatabase.instance;
  await db.database;
  await NotificationService.instance.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()..init()),
      ],
      child: const LifeLogApp(),
    ),
  );
}

class LifeLogApp extends StatelessWidget {
  const LifeLogApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, state, child) {
        final isFarsi = state.settings.language == 'fa';
        return MaterialApp(
          title: 'LifeLog',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.darkTheme,
          locale: Locale(state.settings.language, isFarsi ? 'IR' : 'US'),
          supportedLocales: const [
            Locale('fa', 'IR'),
            Locale('en', 'US'),
          ],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: Directionality(
            textDirection: isFarsi ? TextDirection.rtl : TextDirection.ltr,
            child: const AppRootGate(),
          ),
        );
      },
    );
  }
}

class AppRootGate extends StatelessWidget {
  const AppRootGate({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    if (state.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(
            color: AppColors.accent,
            strokeWidth: 2.5,
          ),
        ),
      );
    }

    // AppState manages the locking/unlocking lifecycle
    if (state.isLocked) {
      return const PinLockScreen();
    }

    return const MainNavigationScaffold();
  }
}

class MainNavigationScaffold extends StatelessWidget {
  const MainNavigationScaffold({super.key});

  static const List<Widget> _screens = [
    TodayScreen(),
    CalendarScreen(),
    TasksScreen(),
    AnalyticsScreen(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final currentIndex = state.activeNavIndex;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background ambient light glow
          Positioned(
            top: -120,
            left: -60,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accent.withOpacity(0.12),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 60,
            right: -80,
            child: Container(
              width: 360,
              height: 360,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.secondaryAccent.withOpacity(0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Indexed stack to preserve screen states smoothly
          SafeArea(
            bottom: false,
            child: IndexedStack(
              index: currentIndex,
              children: _screens,
            ),
          ),

          // Floating Glass Bottom Navigation
          const Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: BottomNavBarWidget(),
          ),
        ],
      ),
    );
  }
}
