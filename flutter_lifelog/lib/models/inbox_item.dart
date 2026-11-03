class InboxItem {
  final String id;
  final String text;
  final String createdAt;
  final String? category;
  final bool processed;

  InboxItem({
    required this.id,
    required this.text,
    required this.createdAt,
    this.category,
    this.processed = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'text': text,
      'createdAt': createdAt,
      'category': category,
      'processed': processed ? 1 : 0,
    };
  }

  factory InboxItem.fromMap(Map<String, dynamic> map) {
    return InboxItem(
      id: map['id'] as String,
      text: map['text'] as String,
      createdAt: map['createdAt'] as String,
      category: map['category'] as String?,
      processed: (map['processed'] is int ? map['processed'] == 1 : map['processed'] == true),
    );
  }

  InboxItem copyWith({
    String? id,
    String? text,
    String? createdAt,
    String? category,
    bool? processed,
  }) {
    return InboxItem(
      id: id ?? this.id,
      text: text ?? this.text,
      createdAt: createdAt ?? this.createdAt,
      category: category ?? this.category,
      processed: processed ?? this.processed,
    );
  }
}
