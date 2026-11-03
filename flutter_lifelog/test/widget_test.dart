import 'package:flutter_test/flutter_test.dart';
import 'package:lifelog/utils/jalali_calendar.dart';
import 'package:lifelog/utils/persian_numbers.dart';
import 'package:lifelog/models/task.dart';

void main() {
  group('Jalali Calendar & Conversion Tests', () {
    test('Standard Jalali conversion test', () {
      final now = DateTime(2025, 3, 21); // Nowruz 1404
      final jalali = JalaliDate.fromDateTime(now);

      expect(jalali.year, 1404);
      expect(jalali.month, 1);
      expect(jalali.day, 1);
      expect(jalali.monthName, 'فروردین');
    });

    test('Persian numerals mapping and reversal', () {
      expect(PersianNumbers.toPersian('12345'), '۱۲۳۴۵');
      expect(PersianNumbers.toPersian('2025/03/21'), '۲۰۲۵/۰۳/۲۱');
      expect(PersianNumbers.toEnglish('۱۲۳۴۵'), '12345');
    });
  });

  group('Task Model & Serialization Tests', () {
    test('Task model map serialization and deserialization', () {
      final task = Task(
        id: 'task-test-1',
        title: 'بررسی کدهای فلاتر',
        description: 'تست جامع پایگاه‌داده و مدل‌ها',
        category: 'work',
        priority: 'high',
        status: 'in_progress',
        plannedDate: '2025-04-01',
        plannedStartTime: '09:00',
        plannedEndTime: '10:30',
        tags: ['flutter', 'code-review'],
        subtasks: [
          Subtask(id: 'sub-1', title: 'تست SQLite', completed: true),
          Subtask(id: 'sub-2', title: 'تست تم دارک گلس', completed: false),
        ],
        createdAt: '2025-04-01T08:30:00.000Z',
        updatedAt: '2025-04-01T08:30:00.000Z',
      );

      final map = task.toMap();
      final restored = Task.fromMap(map);

      expect(restored.id, task.id);
      expect(restored.title, task.title);
      expect(restored.category, 'work');
      expect(restored.priority, 'high');
      expect(restored.status, 'in_progress');
      expect(restored.subtasks.length, 2);
      expect(restored.subtasks[0].completed, true);
      expect(restored.subtasks[1].completed, false);
      expect(restored.tags.contains('flutter'), true);
    });
  });
}
