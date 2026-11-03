import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../utils/crypto_utils.dart';
import '../services/biometric_service.dart';
import '../database/app_database.dart';
import '../widgets/glass_card.dart';
import '../widgets/glass_button.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _nameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final state = context.read<AppState>();
    _nameController.text = state.settings.userName;
  }

  void _saveName() {
    final name = _nameController.text.trim();
    if (name.isNotEmpty) {
      context.read<AppState>().updateUserName(name);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('نام کاربری ذخیره شد.'), backgroundColor: AppColors.success),
      );
    }
  }

  void _showSetPinDialog() {
    final pinController = TextEditingController();
    final confirmController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('تعیین رمز عبور (PIN)', style: TextStyle(fontFamily: 'Vazirmatn', fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 6,
              decoration: const InputDecoration(labelText: 'رمز عبور ۴ یا ۶ رقمی'),
            ),
            TextField(
              controller: confirmController,
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 6,
              decoration: const InputDecoration(labelText: 'تکرار رمز عبور'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('انصراف')),
          ElevatedButton(
            onPressed: () {
              final pin = pinController.text.trim();
              if (pin.length < 4 || pin != confirmController.text.trim()) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('رمز عبور معتبر نیست یا تکرار آن یکسان نیست.')),
                );
                return;
              }
              final hash = CryptoUtils.hashPin(pin);
              final state = context.read<AppState>();
              final updated = state.settings;
              updated.enablePin = true;
              updated.pinHash = hash;
              state.updateSettings(updated);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قفل با رمز عبور فعال شد.'), backgroundColor: AppColors.success),
              );
            },
            child: const Text('ذخیره'),
          ),
        ],
      ),
    );
  }

  void _showClearDataDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('پاکسازی کلیه داده‌های لوکال', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.error, fontWeight: FontWeight.bold)),
        content: const Text(
          'آیا از پاکسازی تمام کارها، عادات، یادداشت‌ها و آمار پایگاه داده محلی SQLite اطمینان دارید؟ این عملیات برگشت‌پذیر نیست.',
          style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('انصراف')),
          ElevatedButton(
            onPressed: () {
              context.read<AppState>().clearAllData();
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تمام داده‌ها پاکسازی شدند.')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('بله، حذف کن', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('تنظیمات و امنیت LifeLog'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Display Name Card
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('نام کاربر (پیش‌فرض: یاسین)', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _nameController,
                          style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary),
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: AppColors.surfaceCard,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GlassButton(
                        onPressed: _saveName,
                        child: const Text('ذخیره'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Security & Protection
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.shield_outlined, color: AppColors.success, size: 20),
                      SizedBox(width: 8),
                      Text('امنیت محلی و حفاظت از اطلاعات', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('قفل برنامه با رمز عبور (PIN)', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary)),
                          Text('رمزنگاری هش محلی SHA-256', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                      if (state.settings.enablePin)
                        TextButton(
                          onPressed: () {
                            final s = state.settings;
                            s.enablePin = false;
                            s.pinHash = null;
                            state.updateSettings(s);
                          },
                          child: const Text('غیرفعال‌سازی', style: TextStyle(fontFamily: 'Vazirmatn', color: AppColors.error)),
                        )
                      else
                        ElevatedButton(
                          onPressed: _showSetPinDialog,
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent),
                          child: const Text('تنظیم PIN', style: TextStyle(fontFamily: 'Vazirmatn', color: Colors.black, fontSize: 12)),
                        ),
                    ],
                  ),
                  const Divider(color: Color(0x15FFFFFF), height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('احراز هویت بیومتریک', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 13, color: AppColors.textPrimary)),
                          Text('اثرانگشت و چهره با سنسور سخت‌افزاری اندروید', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                      Switch(
                        value: state.settings.enableBiometrics,
                        activeColor: AppColors.accent,
                        onChanged: (val) async {
                          final canBio = await BiometricService.isBiometricAvailable();
                          if (!canBio && val) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('حسگر بیومتریک در این دستگاه در دسترس نیست.')),
                            );
                            return;
                          }
                          final s = state.settings;
                          s.enableBiometrics = val;
                          state.updateSettings(s);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Local Database & Pure Offline Policy
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.storage_rounded, color: AppColors.warning, size: 20),
                      SizedBox(width: 8),
                      Text('پایگاه داده محلی SQLite (۱۰۰٪ آفلاین)', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'تمام اطلاعات کارها، عادات، یادداشت‌های ژورنال و خواب به صورت کاملاً ایزوله در حافظه داخلی دستگاه شما قرار دارد. هیچ اتصال اینترنتی، سرور، بک‌اند یا تبادل ابری انجام نمی‌شود.',
                    style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 11, color: AppColors.textSecondary, height: 1.6),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final json = await AppDatabase.instance.exportBackupJson();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('فایل پشتیبان JSON با موفقیت در دیتابیس آماده شد.'), backgroundColor: AppColors.success),
                            );
                          },
                          icon: const Icon(Icons.download, size: 16, color: AppColors.accent),
                          label: const Text('پشتیبان JSON', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.accent)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => state.seedData(),
                          icon: const Icon(Icons.refresh, size: 16, color: AppColors.success),
                          label: const Text('داده‌های نمونه', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.success)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _showClearDataDialog,
                      icon: const Icon(Icons.delete_forever, size: 16, color: AppColors.error),
                      label: const Text('پاکسازی کامل دیتابیس', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.error)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // About App
            const Center(
              child: Column(
                children: [
                  Text('LifeLog Native Android — یاسین', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  SizedBox(height: 2),
                  Text('نسخه ۱.۰.۰ — Flutter 3.24 & SQLite', style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 10, color: AppColors.textMuted)),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
