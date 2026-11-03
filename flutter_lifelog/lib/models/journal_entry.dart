import 'dart:convert';

class JournalEntry {
  final String id;
  final String date;
  final String createdAt;
  String title;
  String content;
  String mood; // great, good, neutral, down, tired, stressed, inspired
  List<String> tags;
  bool isPinned;
  String updatedAt;

  JournalEntry({
    required this.id,
    required this.date,
    required this.createdAt,
    required this.title,
    required this.content,
    this.mood = 'great',
    this.tags = const [],
    this.isPinned = false,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'date': date,
    'createdAt': createdAt,
    'title': title,
    'content': content,
    'mood': mood,
    'tags': jsonEncode(tags),
    'isPinned': isPinned ? 1 : 0,
    'updatedAt': updatedAt,
  };

  factory JournalEntry.fromMap(Map<String, dynamic> map) {
    List<String> parsedTags = [];
    if (map['tags'] != null) {
      try {
        final decoded = jsonDecode(map['tags']);
        if (decoded is List) parsedTags = decoded.map((e) => e.toString()).toList();
      } catch (_) {}
    }

    return JournalEntry(
      id: map['id'] ?? '',
      date: map['date'] ?? '',
      createdAt: map['createdAt'] ?? DateTime.now().toIso8601String(),
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      mood: map['mood'] ?? 'great',
      tags: parsedTags,
      isPinned: map['isPinned'] == 1 || map['isPinned'] == true,
      updatedAt: map['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }
}
