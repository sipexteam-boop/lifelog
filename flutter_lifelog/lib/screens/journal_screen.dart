import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../models/journal_entry.dart';
import '../widgets/glass_card.dart';
import '../widgets/glass_button.dart';

class JournalScreen extends StatefulWidget {
  const JournalScreen({super.key});

  @override
  State<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends State<JournalScreen> {
  String _searchQuery = '';

  void _showEntryDialog({JournalEntry? entryToEdit}) {
    final titleController = TextEditingController(text: entryToEdit?.title ?? '');
    final contentController = TextEditingController(text: entryToEdit?.content ?? '');
    String mood = entryToEdit?.mood ?? 'great';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.glassBorder),
          ),
          title: Text(entryToEdit == null ? 'یادداشت جدید ژورنال یاسین' : 'ویرایش یادداشت',
              style: const TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: titleController,
                  style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'عنوان',
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: mood,
                  dropdownColor: AppColors.surfaceCard,
                  decoration: InputDecoration(
                    labelText: 'حال و هوا (Mood)',
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'great', child: Text('عالی و پرانرژی')),
                    DropdownMenuItem(value: 'good', child: Text('خوب و آرام')),
                    DropdownMenuItem(value: 'neutral', child: Text('معمولی')),
                    DropdownMenuItem(value: 'down', child: Text('کم‌انرژی / خسته')),
                    DropdownMenuItem(value: 'inspired', child: Text('الهام‌بخش')),
                  ],
                  onChanged: (v) => setDialogState(() => mood = v ?? 'great'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: contentController,
                  maxLines: 5,
                  style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'متن دل‌نوشته و تأملات شخصی',
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('انصراف', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textMuted)),
            ),
            ElevatedButton(
              onPressed: () {
                final title = titleController.text.trim();
                final content = contentController.text.trim();
                if (title.isEmpty && content.isEmpty) return;

                final state = context.read<AppState>();
                final isEditing = entryToEdit != null;

                final entry = JournalEntry(
                  id: isEditing ? entryToEdit.id : 'journal_${DateTime.now().millisecondsSinceEpoch}',
                  date: isEditing ? entryToEdit.date : state.todayIso,
                  createdAt: isEditing ? entryToEdit.createdAt : DateTime.now().toIso8601String(),
                  title: title.isNotEmpty ? title : 'بدون عنوان',
                  content: content,
                  mood: mood,
                  isPinned: isEditing ? entryToEdit.isPinned : false,
                  updatedAt: DateTime.now().toIso8601String(),
                );

                state.saveJournalEntry(entry);
                Navigator.pop(ctx);
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent),
              child: const Text('ذخیره', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    final filtered = state.journalEntries.where((e) {
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        return e.title.toLowerCase().contains(q) || e.content.toLowerCase().contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('ژورنال اختصاصی یاسین'),
        actions: [
          IconButton(
            onPressed: () => _showEntryDialog(),
            icon: const Icon(Icons.add, color: AppColors.accent),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            // Search Bar
            TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'جستجو در یادداشت‌های ژورنال...',
                prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 20),
                filled: true,
                fillColor: AppColors.surfaceCard,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 16),

            if (filtered.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Text('هنوز یادداشتی ثبت نشده است.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textMuted)),
                ),
              )
            else
              ...filtered.map((e) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GlassCard(
                    onTap: () => _showEntryDialog(entryToEdit: e),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(e.title, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                            Text(e.date, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textSecondary)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          e.content,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textSecondary, height: 1.5),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.accent.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(e.mood, style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.accent)),
                            ),
                            IconButton(
                              onPressed: () => state.deleteJournalEntry(e.id),
                              icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
