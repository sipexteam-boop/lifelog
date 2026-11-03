import 'dart:convert';

class GoalMilestone {
  final String id;
  String title;
  bool completed;

  GoalMilestone({
    required this.id,
    required this.title,
    this.completed = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'completed': completed ? 1 : 0,
  };

  factory GoalMilestone.fromMap(Map<String, dynamic> map) => GoalMilestone(
    id: map['id'] ?? '',
    title: map['title'] ?? '',
    completed: map['completed'] == 1 || map['completed'] == true,
  );
}

class Goal {
  final String id;
  String title;
  String? description;
  String category;
  String targetDate;
  int progress; // 0-100
  List<GoalMilestone> milestones;
  String? color;
  bool isArchived;
  String createdAt;
  String updatedAt;

  Goal({
    required this.id,
    required this.title,
    this.description,
    this.category = 'work',
    required this.targetDate,
    this.progress = 0,
    this.milestones = const [],
    this.color,
    this.isArchived = false,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category,
    'targetDate': targetDate,
    'progress': progress,
    'milestones': jsonEncode(milestones.map((m) => m.toMap()).toList()),
    'color': color,
    'isArchived': isArchived ? 1 : 0,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
  };

  factory Goal.fromMap(Map<String, dynamic> map) {
    List<GoalMilestone> parsedMilestones = [];
    if (map['milestones'] != null) {
      try {
        final decoded = jsonDecode(map['milestones']);
        if (decoded is List) {
          parsedMilestones = decoded.map((m) => GoalMilestone.fromMap(Map<String, dynamic>.from(m))).toList();
        }
      } catch (_) {}
    }

    return Goal(
      id: map['id'] ?? '',
      title: map['title'] ?? '',
      description: map['description'],
      category: map['category'] ?? 'work',
      targetDate: map['targetDate'] ?? '',
      progress: map['progress'] ?? 0,
      milestones: parsedMilestones,
      color: map['color'],
      isArchived: map['isArchived'] == 1 || map['isArchived'] == true,
      createdAt: map['createdAt'] ?? DateTime.now().toIso8601String(),
      updatedAt: map['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }
}
