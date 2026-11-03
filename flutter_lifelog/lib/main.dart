import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'database/app_database.dart';
import 'providers/app_state.dart';
import 'services/biometric_service.dart';
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

class AppRootGate extends StatefulWidget {
  const AppRootGate({super.key});

  @override
  State<AppRootGate> createState() => _AppRootGateState();
}

class _AppRootGateState extends State<AppRootGate> {
  bool _isUnlocked = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkSecurityLock();
    });
  }

  void _checkSecurityLock() async {
    final state = Provider.of<AppState>(context, listen: false);
    if (!state.settings.securityLockEnabled) {
      setState(() => _isUnlocked = true);
      return;
    }

    // Auto-prompt biometric if available
    if (state.settings.biometricEnabled) {
      final bio = BiometricService.instance;
      final available = await bio.isBiometricAvailable();
      if (available) {
        final success = await bio.authenticate(
          reason: 'احراز هویت بیومتریک برای ورود به برنامه لایف‌لاگ',
        );
        if (success && mounted) {
          setState(() => _isUnlocked = true);
          return;
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    if (state.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(
            color: AppColors.primaryAccent,
            strokeWidth: 2.5,
          ),
        ),
      );
    }

    if (state.settings.securityLockEnabled && !_isUnlocked) {
      return PinLockScreen(
        onSuccess: () {
          setState(() => _isUnlocked = true);
        },
      );
    }

    return const MainNavigationScaffold();
  }
}

class MainNavigationScaffold extends StatefulWidget {
  const MainNavigationScaffold({super.key});

  @override
  State<MainNavigationScaffold> createState() => _MainNavigationScaffoldState();
}

class _MainNavigationScaffoldState extends State<MainNavigationScaffold> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    TodayScreen(),
    CalendarScreen(),
    TasksScreen(),
    AnalyticsScreen(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
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
                    AppColors.primaryAccent.withValues(alpha: 0.12),
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
                    AppColors.secondaryAccent.withValues(alpha: 0.08),
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
              index: _currentIndex,
              children: _screens,
            ),
          ),

          // Floating Glass Bottom Navigation
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ModernBottomNavBar(
              currentIndex: _currentIndex,
              onTap: (index) {
                setState(() => _currentIndex = index);
              },
            ),
          ),
        ],
      ),
    );
  }
}
