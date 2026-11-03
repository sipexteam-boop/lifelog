import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../models/task.dart';
import '../utils/persian_numbers.dart';
import '../widgets/glass_card.dart';
import 'task_edit_sheet.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'all';
  String _selectedPriority = 'all';
  bool _isBulkMode = false;
  final Set<String> _selectedIds = {};

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    final filteredTasks = state.tasks.where((t) {
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = t.title.toLowerCase().contains(q);
        final matchDesc = t.description?.toLowerCase().contains(q) ?? false;
        if (!matchTitle && !matchDesc) return false;
      }
      if (_selectedCategory != 'all' && t.category != _selectedCategory) return false;
      if (_selectedPriority != 'all' && t.priority != _selectedPriority) return false;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title & Bulk Toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'مدیریت کارها',
                      style: TextStyle(
                        fontFamily: 'Vazirmatn',
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${PersianNumbers.toPersian(filteredTasks.length)} کار ثبت‌شده',
                      style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      _isBulkMode = !_isBulkMode;
                      _selectedIds.clear();
                    });
                  },
                  icon: Icon(_isBulkMode ? Icons.close : Icons.checklist_rounded, size: 16, color: AppColors.accent),
                  label: Text(
                    _isBulkMode ? 'خروج' : 'انتخاب گروهی',
                    style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.accent),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Bulk Actions Bar
            if (_isBulkMode) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${PersianNumbers.toPersian(_selectedIds.length)} مورد انتخاب شد',
                      style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
                    ),
                    Row(
                      children: [
                        ElevatedButton(
                          onPressed: _selectedIds.isEmpty
                              ? null
                              : () {
                                  state.bulkCompleteTasks(_selectedIds.toList());
                                  setState(() {
                                    _selectedIds.clear();
                                    _isBulkMode = false;
                                  });
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.success,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          ),
                          child: const Text('تکمیل همه', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: Colors.black)),
                        ),
                        const SizedBox(width: 6),
                        ElevatedButton(
                          onPressed: _selectedIds.isEmpty
                              ? null
                              : () {
                                  state.bulkDeleteTasks(_selectedIds.toList());
                                  setState(() {
                                    _selectedIds.clear();
                                    _isBulkMode = false;
                                  });
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          ),
                          child: const Text('حذف موارد', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: Colors.white)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Search Bar
            TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'جستجو در عنوان یا توضیحات...',
                hintStyle: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textMuted),
                prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 20),
                filled: true,
                fillColor: AppColors.surfaceCard,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.glassBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.glassBorder),
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Tasks List
            if (filteredTasks.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Text('کاری یافت نشد.', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textMuted)),
                ),
              )
            else
              ...filteredTasks.map((task) {
                final isSelected = _selectedIds.contains(task.id);

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.accent.withOpacity(0.15) : AppColors.surfaceCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppColors.accent : AppColors.glassBorder,
                    ),
                  ),
                  child: Row(
                    children: [
                      if (_isBulkMode)
                        Checkbox(
                          value: isSelected,
                          activeColor: AppColors.accent,
                          onChanged: (checked) {
                            setState(() {
                              if (checked == true) {
                                _selectedIds.add(task.id);
                              } else {
                                _selectedIds.remove(task.id);
                              }
                            });
                          },
                        )
                      else
                        IconButton(
                          onPressed: () => state.toggleTaskComplete(task),
                          icon: Icon(
                            task.isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                            color: task.isCompleted ? AppColors.success : AppColors.textMuted,
                          ),
                        ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              task.title,
                              style: TextStyle(
                                fontFamily: 'Vazirmatn',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                                color: task.isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                              ),
                            ),
                            if (task.description != null && task.description!.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                task.description!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Text(
                                  task.plannedDate,
                                  style: const TextStyle(fontSize: 10, color: AppColors.accent, fontFamily: 'Vazirmatn'),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.06),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    task.category,
                                    style: const TextStyle(fontSize: 9, color: AppColors.textSecondary, fontFamily: 'Vazirmatn'),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      if (!_isBulkMode)
                        IconButton(
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => TaskEditSheet(taskToEdit: task),
                            );
                          },
                          icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.textMuted),
                        ),
                    ],
                  ),
                );
              }),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
