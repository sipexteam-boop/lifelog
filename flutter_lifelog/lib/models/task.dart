import 'dart:convert';

class Subtask {
  final String id;
  final String title;
  bool completed;

  Subtask({
    required this.id,
    required this.title,
    this.completed = false,
  });

  bool get isCompleted => completed;
  set isCompleted(bool val) => completed = val;

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'completed': completed ? 1 : 0,
  };

  factory Subtask.fromMap(Map<String, dynamic> map) => Subtask(
    id: map['id'] ?? '',
    title: map['title'] ?? '',
    completed: map['completed'] == 1 || map['completed'] == true,
  );
}

class Task {
  final String id;
  String title;
  String? description;
  String category; // work, personal, health, learning, finance, creative, other
  List<String> tags;
  String priority; // low, medium, high, urgent
  String status; // planned, in_progress, paused, completed, cancelled
  int progress; // 0-100
  String plannedDate; // YYYY-MM-DD
  String? plannedStartTime; // HH:mm
  String? plannedEndTime; // HH:mm
  String? actualStartTime;
  String? actualEndTime;
  List<Subtask> subtasks;
  String? notes;
  String recurrence; // none, daily, weekdays, weekly, monthly
  bool reminderEnabled;
  int? reminderMinutesBefore;
  int focusMinutesTotal;
  String? linkedGoalId;
  String createdAt;
  String updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    this.category = 'work',
    this.tags = const [],
    this.priority = 'medium',
    this.status = 'planned',
    this.progress = 0,
    required this.plannedDate,
    this.plannedStartTime,
    this.plannedEndTime,
    this.actualStartTime,
    this.actualEndTime,
    this.subtasks = const [],
    this.notes,
    this.recurrence = 'none',
    this.reminderEnabled = false,
    this.reminderMinutesBefore,
    this.focusMinutesTotal = 0,
    this.linkedGoalId,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isCompleted => status == 'completed';

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category,
    'tags': jsonEncode(tags),
    'priority': priority,
    'status': status,
    'progress': progress,
    'plannedDate': plannedDate,
    'plannedStartTime': plannedStartTime,
    'plannedEndTime': plannedEndTime,
    'actualStartTime': actualStartTime,
    'actualEndTime': actualEndTime,
    'subtasks': jsonEncode(subtasks.map((s) => s.toMap()).toList()),
    'notes': notes,
    'recurrence': recurrence,
    'reminderEnabled': reminderEnabled ? 1 : 0,
    'reminderMinutesBefore': reminderMinutesBefore,
    'focusMinutesTotal': focusMinutesTotal,
    'linkedGoalId': linkedGoalId,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
  };

  factory Task.fromMap(Map<String, dynamic> map) {
    List<String> parsedTags = [];
    if (map['tags'] != null) {
      try {
        final decoded = jsonDecode(map['tags']);
        if (decoded is List) parsedTags = decoded.map((e) => e.toString()).toList();
      } catch (_) {}
    }

    List<Subtask> parsedSubtasks = [];
    if (map['subtasks'] != null) {
      try {
        final decoded = jsonDecode(map['subtasks']);
        if (decoded is List) {
          parsedSubtasks = decoded.map((e) => Subtask.fromMap(Map<String, dynamic>.from(e))).toList();
        }
      } catch (_) {}
    }

    return Task(
      id: map['id'] ?? '',
      title: map['title'] ?? '',
      description: map['description'],
      category: map['category'] ?? 'work',
      tags: parsedTags,
      priority: map['priority'] ?? 'medium',
      status: map['status'] ?? 'planned',
      progress: map['progress'] ?? 0,
      plannedDate: map['plannedDate'] ?? '',
      plannedStartTime: map['plannedStartTime'],
      plannedEndTime: map['plannedEndTime'],
      actualStartTime: map['actualStartTime'],
      actualEndTime: map['actualEndTime'],
      subtasks: parsedSubtasks,
      notes: map['notes'],
      recurrence: map['recurrence'] ?? 'none',
      reminderEnabled: map['reminderEnabled'] == 1 || map['reminderEnabled'] == true,
      reminderMinutesBefore: map['reminderMinutesBefore'],
      focusMinutesTotal: map['focusMinutesTotal'] ?? 0,
      linkedGoalId: map['linkedGoalId'],
      createdAt: map['createdAt'] ?? DateTime.now().toIso8601String(),
      updatedAt: map['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }
}
