class Habit {
  final String id;
  String title;
  String? description;
  String category;
  String? color;
  String frequency; // daily, weekdays, weekly
  int targetDaysPerWeek;
  String createdAt;
  bool archived;

  Habit({
    required this.id,
    required this.title,
    this.description,
    this.category = 'health',
    this.color,
    this.frequency = 'daily',
    this.targetDaysPerWeek = 7,
    required this.createdAt,
    this.archived = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category,
    'color': color,
    'frequency': frequency,
    'targetDaysPerWeek': targetDaysPerWeek,
    'createdAt': createdAt,
    'archived': archived ? 1 : 0,
  };

  factory Habit.fromMap(Map<String, dynamic> map) => Habit(
    id: map['id'] ?? '',
    title: map['title'] ?? '',
    description: map['description'],
    category: map['category'] ?? 'health',
    color: map['color'],
    frequency: map['frequency'] ?? 'daily',
    targetDaysPerWeek: map['targetDaysPerWeek'] ?? 7,
    createdAt: map['createdAt'] ?? DateTime.now().toIso8601String(),
    archived: map['archived'] == 1 || map['archived'] == true,
  );
}

class HabitLog {
  final String id; // `${habitId}_${date}`
  final String habitId;
  final String date; // YYYY-MM-DD
  final bool completed;
  final String timestamp;

  HabitLog({
    required this.id,
    required this.habitId,
    required this.date,
    required this.completed,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'habitId': habitId,
    'date': date,
    'completed': completed ? 1 : 0,
    'timestamp': timestamp,
  };

  factory HabitLog.fromMap(Map<String, dynamic> map) => HabitLog(
    id: map['id'] ?? '',
    habitId: map['habitId'] ?? '',
    date: map['date'] ?? '',
    completed: map['completed'] == 1 || map['completed'] == true,
    timestamp: map['timestamp'] ?? DateTime.now().toIso8601String(),
  );
}
