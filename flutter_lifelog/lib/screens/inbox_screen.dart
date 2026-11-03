import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../models/inbox_item.dart';
import '../widgets/glass_card.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  final _textController = TextEditingController();

  void _submit() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    final item = InboxItem(
      id: 'inb_${DateTime.now().millisecondsSinceEpoch}',
      text: text,
      createdAt: DateTime.now().toIso8601String(),
    );

    context.read<AppState>().saveInboxItem(item);
    _textController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('اینباکس سریع یاسین'),
      ),
      body: Column(
        children: [
          // Input bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'ثبت فوری فکر، ایده یا تسک بدون تاریخ...',
                      filled: true,
                      fillColor: AppColors.surfaceCard,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onSubmitted: (_) => _submit(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _submit,
                  icon: const Icon(Icons.send_rounded, size: 20),
                  style: IconButton.styleFrom(backgroundColor: AppColors.accent),
                ),
              ],
            ),
          ),

          // Items list
          Expanded(
            child: state.inboxItems.isEmpty
                ? const Center(
                    child: Text('اینباکس شما خالی است! ذهن شما آرام و رهاست.',
                        style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textMuted)),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: state.inboxItems.length,
                    itemBuilder: (context, index) {
                      final item = state.inboxItems[index];

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: GlassCard(
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  item.text,
                                  style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary),
                                ),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                onPressed: () {
                                  state.convertInboxToTask(item);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('ایده به یک کار تبدیل شد.')),
                                  );
                                },
                                icon: const Icon(Icons.check_circle_outline, size: 14, color: Colors.black),
                                label: const Text('تبدیل به کار', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: Colors.black)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.accent,
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                ),
                              ),
                              IconButton(
                                onPressed: () => state.deleteInboxItem(item.id),
                                icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
