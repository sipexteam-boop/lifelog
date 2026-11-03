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

    test('Persian numerals mapping', () {
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
        category: TaskCategory.work,
        priority: TaskPriority.high,
        status: TaskStatus.inProgress,
        plannedStart: DateTime(2025, 4, 1, 9, 0),
        plannedEnd: DateTime(2025, 4, 1, 10, 30),
        tags: ['flutter', 'code-review'],
        subtasks: [
          Subtask(id: 'sub-1', title: 'تست SQLite', isCompleted: true),
          Subtask(id: 'sub-2', title: 'تست تم دارک گلس', isCompleted: false),
        ],
        createdAt: DateTime(2025, 4, 1, 8, 30),
        updatedAt: DateTime(2025, 4, 1, 8, 30),
      );

      final map = task.toMap();
      final restored = Task.fromMap(map);

      expect(restored.id, task.id);
      expect(restored.title, task.title);
      expect(restored.category, TaskCategory.work);
      expect(restored.priority, TaskPriority.high);
      expect(restored.status, TaskStatus.inProgress);
      expect(restored.subtasks.length, 2);
      expect(restored.subtasks[0].isCompleted, true);
      expect(restored.subtasks[1].isCompleted, false);
      expect(restored.tags.contains('flutter'), true);
    });
  });
}
