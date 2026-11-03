class SleepSession {
  final String id;
  final String date; // night of YYYY-MM-DD
  final String bedtime; // ISO
  String? wakeTime; // ISO
  int durationMinutes;
  int quality; // 0-100
  String? notes;
  bool isActive;
  final String createdAt;

  SleepSession({
    required this.id,
    required this.date,
    required this.bedtime,
    this.wakeTime,
    this.durationMinutes = 0,
    this.quality = 80,
    this.notes,
    this.isActive = false,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'date': date,
    'bedtime': bedtime,
    'wakeTime': wakeTime,
    'durationMinutes': durationMinutes,
    'quality': quality,
    'notes': notes,
    'isActive': isActive ? 1 : 0,
    'createdAt': createdAt,
  };

  factory SleepSession.fromMap(Map<String, dynamic> map) => SleepSession(
    id: map['id'] ?? '',
    date: map['date'] ?? '',
    bedtime: map['bedtime'] ?? '',
    wakeTime: map['wakeTime'],
    durationMinutes: map['durationMinutes'] ?? 0,
    quality: map['quality'] ?? 80,
    notes: map['notes'],
    isActive: map['isActive'] == 1 || map['isActive'] == true,
    createdAt: map['createdAt'] ?? DateTime.now().toIso8601String(),
  );
}
