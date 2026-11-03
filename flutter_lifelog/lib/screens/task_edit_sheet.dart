import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/task.dart';
import '../theme/app_colors.dart';
import '../widgets/glass_button.dart';

class TaskEditSheet extends StatefulWidget {
  final Task? taskToEdit;
  final String? initialDate;

  const TaskEditSheet({super.key, this.taskToEdit, this.initialDate});

  @override
  State<TaskEditSheet> createState() => _TaskEditSheetState();
}

class _TaskEditSheetState extends State<TaskEditSheet> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _subtaskController = TextEditingController();

  String _category = 'work';
  String _priority = 'medium';
  late String _plannedDate;
  String _startTime = '09:00';
  String _endTime = '10:00';
  List<Subtask> _subtasks = [];

  @override
  void initState() {
    super.initState();
    if (widget.taskToEdit != null) {
      final t = widget.taskToEdit!;
      _titleController.text = t.title;
      _descController.text = t.description ?? '';
      _category = t.category;
      _priority = t.priority;
      _plannedDate = t.plannedDate;
      _startTime = t.plannedStartTime ?? '09:00';
      _endTime = t.plannedEndTime ?? '10:00';
      _subtasks = List.from(t.subtasks);
    } else {
      final now = DateTime.now();
      _plannedDate = widget.initialDate ??
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    }
  }

  void _addSubtask() {
    final text = _subtaskController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _subtasks.add(Subtask(
          id: 'st_${DateTime.now().millisecondsSinceEpoch}',
          title: text,
        ));
        _subtaskController.clear();
      });
    }
  }

  void _saveTask() {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    final state = context.read<AppState>();
    final isEditing = widget.taskToEdit != null;

    final task = Task(
      id: isEditing ? widget.taskToEdit!.id : 'task_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      description: _descController.text.trim().isNotEmpty ? _descController.text.trim() : null,
      category: _category,
      priority: _priority,
      status: isEditing ? widget.taskToEdit!.status : 'planned',
      progress: isEditing ? widget.taskToEdit!.progress : 0,
      plannedDate: _plannedDate,
      plannedStartTime: _startTime,
      plannedEndTime: _endTime,
      subtasks: _subtasks,
      createdAt: isEditing ? widget.taskToEdit!.createdAt : DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    state.saveTask(task);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.taskToEdit != null;

    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
      child: Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface.withOpacity(0.95),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'ویرایش کار' : 'ایجاد کار جدید',
                    style: const TextStyle(
                      fontFamily: 'Vazirmatn',
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Title Input
              TextField(
                controller: _titleController,
                autofocus: true,
                style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'عنوان کار *',
                  labelStyle: const TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.surfaceCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 12),

              // Description Input
              TextField(
                controller: _descController,
                maxLines: 2,
                style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'توضیحات و یادداشت‌ها',
                  labelStyle: const TextStyle(fontFamily: 'Vazirmatn', color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.surfaceCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 14),

              // Category & Priority
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _category,
                      dropdownColor: AppColors.surfaceCard,
                      decoration: InputDecoration(
                        labelText: 'دسته‌بندی',
                        filled: true,
                        fillColor: AppColors.surfaceCard,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'work', child: Text('کار و پروژه')),
                        DropdownMenuItem(value: 'personal', child: Text('شخصی')),
                        DropdownMenuItem(value: 'health', child: Text('سلامتی')),
                        DropdownMenuItem(value: 'learning', child: Text('آموزش')),
                        DropdownMenuItem(value: 'finance', child: Text('مالی')),
                      ],
                      onChanged: (val) => setState(() => _category = val ?? 'work'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _priority,
                      dropdownColor: AppColors.surfaceCard,
                      decoration: InputDecoration(
                        labelText: 'اولویت',
                        filled: true,
                        fillColor: AppColors.surfaceCard,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'low', child: Text('پایین')),
                        DropdownMenuItem(value: 'medium', child: Text('متوسط')),
                        DropdownMenuItem(value: 'high', child: Text('بالا')),
                        DropdownMenuItem(value: 'urgent', child: Text('فوری')),
                      ],
                      onChanged: (val) => setState(() => _priority = val ?? 'medium'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Subtasks input
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _subtaskController,
                      style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'افزودن زیرکار...',
                        filled: true,
                        fillColor: AppColors.surfaceCard,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onSubmitted: (_) => _addSubtask(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _addSubtask,
                    icon: const Icon(Icons.add, size: 18),
                  ),
                ],
              ),

              // Subtasks list
              if (_subtasks.isNotEmpty) ...[
                const SizedBox(height: 8),
                ..._subtasks.map((st) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      children: [
                        Checkbox(
                          value: st.completed,
                          activeColor: AppColors.success,
                          onChanged: (val) => setState(() => st.completed = val ?? false),
                        ),
                        Expanded(
                          child: Text(
                            st.title,
                            style: TextStyle(
                              fontFamily: 'Vazirmatn',
                              fontSize: 12,
                              decoration: st.completed ? TextDecoration.lineThrough : null,
                              color: st.completed ? AppColors.textMuted : AppColors.textPrimary,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => setState(() => _subtasks.remove(st)),
                          icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  );
                }),
              ],

              const SizedBox(height: 18),

              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (isEditing)
                    TextButton.icon(
                      onPressed: () {
                        context.read<AppState>().deleteTask(widget.taskToEdit!.id);
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.delete, color: AppColors.error, size: 18),
                      label: const Text('حذف کار', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.error)),
                    )
                  else
                    const SizedBox.shrink(),
                  GlassButton(
                    onPressed: _saveTask,
                    child: Text(isEditing ? 'ذخیره تغییرات' : 'ثبت کار'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
