class FocusSession {
  final String id;
  final String? taskId;
  final String? taskTitle;
  final String? category;
  final String startTime;
  final String endTime;
  final int durationMinutes;
  final bool completed;
  final String? notes;

  FocusSession({
    required this.id,
    this.taskId,
    this.taskTitle,
    this.category = 'work',
    required this.startTime,
    required this.endTime,
    required this.durationMinutes,
    this.completed = true,
    this.notes,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'taskId': taskId,
    'taskTitle': taskTitle,
    'category': category,
    'startTime': startTime,
    'endTime': endTime,
    'durationMinutes': durationMinutes,
    'completed': completed ? 1 : 0,
    'notes': notes,
  };

  factory FocusSession.fromMap(Map<String, dynamic> map) => FocusSession(
    id: map['id'] ?? '',
    taskId: map['taskId'],
    taskTitle: map['taskTitle'],
    category: map['category'] ?? 'work',
    startTime: map['startTime'] ?? '',
    endTime: map['endTime'] ?? '',
    durationMinutes: map['durationMinutes'] ?? 0,
    completed: map['completed'] == 1 || map['completed'] == true,
    notes: map['notes'],
  );
}

class InboxItem {
  final String id;
  String text;
  final String createdAt;
  String? category;
  bool processed;

  InboxItem({
    required this.id,
    required this.text,
    required this.createdAt,
    this.category = 'work',
    this.processed = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'text': text,
    'createdAt': createdAt,
    'category': category,
    'processed': processed ? 1 : 0,
  };

  factory InboxItem.fromMap(Map<String, dynamic> map) => InboxItem(
    id: map['id'] ?? '',
    text: map['text'] ?? '',
    createdAt: map['createdAt'] ?? '',
    category: map['category'] ?? 'work',
    processed: map['processed'] == 1 || map['processed'] == true,
  );
}
