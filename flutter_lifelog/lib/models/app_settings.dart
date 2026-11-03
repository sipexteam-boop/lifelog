class AppSettings {
  String userName;
  String language; // 'fa' or 'en'
  String calendarSystem; // 'jalali' or 'gregorian'
  String theme; // 'dark' or 'light'
  bool enablePin;
  String? pinHash;
  bool enableBiometrics;
  bool notificationsEnabled;
  String dailyReviewReminderTime;
  String sleepReminderTime;

  AppSettings({
    this.userName = 'یاسین', // Default user display name: یاسین
    this.language = 'fa',
    this.calendarSystem = 'jalali',
    this.theme = 'dark',
    this.enablePin = false,
    this.pinHash,
    this.enableBiometrics = false,
    this.notificationsEnabled = true,
    this.dailyReviewReminderTime = '21:30',
    this.sleepReminderTime = '23:00',
  });

  Map<String, dynamic> toMap() => {
    'userName': userName,
    'language': language,
    'calendarSystem': calendarSystem,
    'theme': theme,
    'enablePin': enablePin ? 1 : 0,
    'pinHash': pinHash,
    'enableBiometrics': enableBiometrics ? 1 : 0,
    'notificationsEnabled': notificationsEnabled ? 1 : 0,
    'dailyReviewReminderTime': dailyReviewReminderTime,
    'sleepReminderTime': sleepReminderTime,
  };

  factory AppSettings.fromMap(Map<String, dynamic> map) => AppSettings(
    userName: map['userName'] ?? 'یاسین',
    language: map['language'] ?? 'fa',
    calendarSystem: map['calendarSystem'] ?? 'jalali',
    theme: map['theme'] ?? 'dark',
    enablePin: map['enablePin'] == 1 || map['enablePin'] == true,
    pinHash: map['pinHash'],
    enableBiometrics: map['enableBiometrics'] == 1 || map['enableBiometrics'] == true,
    notificationsEnabled: map['notificationsEnabled'] == 1 || map['notificationsEnabled'] == true,
    dailyReviewReminderTime: map['dailyReviewReminderTime'] ?? '21:30',
    sleepReminderTime: map['sleepReminderTime'] ?? '23:00',
  );
}
