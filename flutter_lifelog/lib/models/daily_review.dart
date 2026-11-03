import 'dart:convert';

class DailyReview {
  final String id; // YYYY-MM-DD
  final String date; // YYYY-MM-DD
  int satisfaction; // 0-100
  int mood; // 0-100
  int energy; // 0-100
  int focus; // 0-100
  int productivity; // 0-100
  int sleepQuality; // 0-100
  String? notes;
  List<String> wins;
  String updatedAt;

  DailyReview({
    required this.id,
    required this.date,
    this.satisfaction = 80,
    this.mood = 80,
    this.energy = 75,
    this.focus = 80,
    this.productivity = 75,
    this.sleepQuality = 85,
    this.notes,
    this.wins = const [],
    required this.updatedAt,
  });

  int get averageScore => ((satisfaction + mood + energy + focus + productivity + sleepQuality) / 6).round();

  Map<String, dynamic> toMap() => {
    'id': id,
    'date': date,
    'satisfaction': satisfaction,
    'mood': mood,
    'energy': energy,
    'focus': focus,
    'productivity': productivity,
    'sleepQuality': sleepQuality,
    'notes': notes,
    'wins': jsonEncode(wins),
    'updatedAt': updatedAt,
  };

  factory DailyReview.fromMap(Map<String, dynamic> map) {
    List<String> parsedWins = [];
    if (map['wins'] != null) {
      try {
        final decoded = jsonDecode(map['wins']);
        if (decoded is List) parsedWins = decoded.map((e) => e.toString()).toList();
      } catch (_) {}
    }

    return DailyReview(
      id: map['id'] ?? '',
      date: map['date'] ?? '',
      satisfaction: map['satisfaction'] ?? 80,
      mood: map['mood'] ?? 80,
      energy: map['energy'] ?? 75,
      focus: map['focus'] ?? 80,
      productivity: map['productivity'] ?? 75,
      sleepQuality: map['sleepQuality'] ?? 85,
      notes: map['notes'],
      wins: parsedWins,
      updatedAt: map['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }
}
