import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final NotificationService instance = NotificationService._internal();
  NotificationService._internal();
  factory NotificationService() => instance;

  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);

    await _notificationsPlugin.initialize(initSettings);
  }

  static Future<void> initialize() async {
    await instance.init();
  }

  Future<void> show({
    required int id,
    required String title,
    required String body,
  }) async {
    await showNotification(id: id, title: title, body: body);
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

    const details = NotificationDetails(android: androidDetails);
    await _notificationsPlugin.show(id, title, body, details);
  }
}
