# LifeLog — Native Android Flutter Application

LifeLog is a private, personal operating system engineered as a 100% offline native Android application using Flutter and Dart.

Target Application ID: `com.yasin.lifelog`  
Personalized Default User: **یاسین**  
Default Language: Persian (Farsi) with complete RTL and Jalali calendar support  
Design System: Dark Glassmorphism (`#070A12`, `#101521`, `#91A8FF`, `#7C5CFC`, `#35D6A0`, `#FFBD69`, `#FF6B82`)  
Storage: Fully on-device SQLite database (`lifelog_native.db`)  
Connectivity: Zero remote server, zero internet permission (`android.permission.INTERNET` is omitted)  

---

## 🚀 Key Features

1. **Today Dashboard**:
   - Personalized Persian greetings for **یاسین** ("صبح بخیر یاسین", "یاسین، امروز چه برنامه‌ای داری؟", "سلام یاسین!").
   - Daily completion percentage, productivity score, mood & energy, overdue task alerts, active timeline, habit checklist, sleep widget.
2. **Advanced Task Management**:
   - Complete CRUD, priorities (Urgent, High, Medium, Low), statuses (Planned, In Progress, Paused, Completed, Cancelled).
   - Subtasks with progress bars, planned start/end, actual timestamps, categories, and tags.
3. **Interactive Jalali Calendar**:
   - Full Gregorian <-> Jalali mathematical conversion, leap year algorithm, day/month views with event indicators.
4. **Time & Focus Tracker**:
   - Pomodoro & custom deep work timers, live stopwatch, task linkage, and session history.
5. **Sleep & Vitality Log**:
   - Active sleep session timer, manual entry, sleep duration & quality (1–5) calculation, overlap prevention.
6. **Habits & Long-Term Goals**:
   - Daily habit tracking, positive streaks, target frequencies.
   - Strategic goals with milestones, progress calculations, and target dates.
7. **Daily Evening Review**:
   - 6 vital metrics scored 0–100 (Productivity, Mood, Energy, Focus, Stress, Physical).
   - Reflection prompts, key wins, and tomorrow's top priorities.
8. **Private Journal**:
   - Personal reflections, mood rating, tags, pinned entries, keyword search.
9. **Quick Capture Inbox**:
   - Rapid thought capture with one-tap conversion to structured tasks.
10. **Native Biometric & PIN Security**:
    - Fingerprint / Face authentication via Android `BiometricPrompt` (`local_auth`).
    - Local salted SHA-256 PIN lock screen.
11. **Local SQLite Backup & Restore**:
    - Export complete database to unencrypted or password-encrypted JSON file.
    - Zero cloud sync or remote servers.

---

## 🛠 Project Structure

```
flutter_lifelog/
├── android/
│   ├── app/
│   │   ├── build.gradle                   # App ID: com.yasin.lifelog, target SDK 34
│   │   └── src/main/
│   │       ├── AndroidManifest.xml        # Zero INTERNET permission, biometric support
│   │       ├── kotlin/com/yasin/lifelog/
│   │       │   └── MainActivity.kt        # FlutterFragmentActivity for biometrics
│   │       └── res/values/styles.xml      # Dark glassmorphic splash theme
│   ├── build.gradle
│   └── settings.gradle
├── assets/
│   └── fonts/                             # Vazirmatn Persian typography
├── lib/
│   ├── database/
│   │   ├── app_database.dart              # SQLite schema, indices, CRUD & JSON import/export
│   │   └── seed_data.dart                 # Initial personalized seed data for یاسین
│   ├── models/                            # Strongly-typed data models (Task, Habit, Goal, etc.)
│   ├── providers/
│   │   └── app_state.dart                 # Central state management & reactive metrics
│   ├── services/
│   │   ├── biometric_service.dart         # Local biometric authentication
│   │   └── notification_service.dart      # Local schedule notifications
│   ├── theme/
│   │   └── app_colors.dart                # Dark Glassmorphism color palette & ThemeData
│   ├── utils/
│   │   ├── jalali_calendar.dart           # Mathematical Shamsi date converter
│   │   ├── persian_numbers.dart           # Persian numeral translation
│   │   └── crypto_utils.dart              # SHA-256 PIN hashing with local salt
│   ├── widgets/                           # GlassCard, GlassButton, CircularProgress, etc.
│   ├── screens/                           # 12 complete functional native screens
│   └── main.dart                          # App entry point, MultiProvider, RTL directionality
├── test/
│   └── widget_test.dart                   # Unit tests for Jalali dates and Task serialization
├── .github/
│   └── workflows/
│       └── build_apk.yml                  # Automated GitHub Actions APK build workflow
└── pubspec.yaml                           # Flutter dependencies & font definitions
```

---

## 📦 How to Build the Native Android APK

### Option 1: Automated Build via GitHub Actions (Recommended)

1. Push this repository to GitHub.
2. Navigate to the **Actions** tab.
3. The workflow `.github/workflows/build_apk.yml` will automatically trigger, build the release APK using Flutter 3.24 and Java 17, and upload `app-release.apk` as a downloadable artifact.
4. Download the artifact and install it directly onto your Android device.

### Option 2: Local Build via Flutter CLI

If you have Flutter installed on your machine:

```bash
# 1. Navigate to the Flutter project
cd flutter_lifelog

# 2. Fetch packages
flutter pub get

# 3. Run unit tests
flutter test

# 4. Build release APK
flutter build apk --release

# The compiled APK will be generated at:
# flutter_lifelog/build/app/outputs/flutter-apk/app-release.apk
```

To install directly to a connected Android phone:
```bash
flutter run --release
# or
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔒 Absolute Privacy & Offline Guarantee

- **No Remote Calls**: The app does not ping any telemetry, remote server, or analytics.
- **No Internet Permission**: The `android.permission.INTERNET` flag is intentionally omitted from `AndroidManifest.xml`.
- **Local Storage**: All data lives inside the sandboxed SQLite database file in `/data/data/com.yasin.lifelog/databases/lifelog_native.db`.
