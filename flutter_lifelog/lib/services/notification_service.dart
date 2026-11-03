import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);

    await _notificationsPlugin.initialize(initSettings);
  }

  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'lifelog_channel',
      'یادآورهای LifeLog',
      channelDescription: 'یادآور تسک‌ها، مرور روزانه و ردیابی خواب',
      importance: Importance.max,
      priority: Priority.high,
      color: Color(0xFF91A8FF),
    );

    const details = NotificationSettings(android: androidDetails);
    await _notificationsPlugin.show(id, title, body, const NotificationDetails(android: androidDetails));
  }
}
