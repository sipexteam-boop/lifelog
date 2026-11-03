import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_colors.dart';
import '../utils/crypto_utils.dart';
import '../services/biometric_service.dart';
import '../utils/persian_numbers.dart';

class PinLockScreen extends StatefulWidget {
  const PinLockScreen({super.key});

  @override
  State<PinLockScreen> createState() => _PinLockScreenState();
}

class _PinLockScreenState extends State<PinLockScreen> {
  String _enteredPin = '';
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    _checkBiometricsOnLaunch();
  }

  Future<void> _checkBiometricsOnLaunch() async {
    final state = context.read<AppState>();
    if (state.settings.enableBiometrics) {
      final success = await BiometricService.authenticate();
      if (success && mounted) {
        state.unlockApp();
      }
    }
  }

  void _onDigit(String digit) {
    if (_enteredPin.length >= 6) return;
    setState(() {
      _enteredPin += digit;
      _errorMsg = null;
    });

    final state = context.read<AppState>();
    final targetHash = state.settings.pinHash;

    if (_enteredPin.length >= 4 && targetHash != null) {
      if (CryptoUtils.verifyPin(_enteredPin, targetHash)) {
        state.unlockApp();
      } else if (_enteredPin.length == 6) {
        setState(() {
          _errorMsg = 'رمز عبور اشتباه است.';
          _enteredPin = '';
        });
      }
    }
  }

  void _onDelete() {
    if (_enteredPin.isNotEmpty) {
      setState(() {
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
        _errorMsg = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Lock Icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                  ),
                  child: const Icon(Icons.lock_outline_rounded, color: AppColors.accent, size: 30),
                ),
                const SizedBox(height: 16),

                Text(
                  'خوش‌آمدید ${state.settings.userName}',
                  style: const TextStyle(
                    fontFamily: 'Vazirmatn',
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'رمز عبور امنیتی خود را وارد کنید',
                  style: TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.textSecondary),
                ),

                const SizedBox(height: 24),

                // PIN Dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(4, (index) {
                    final isFilled = index < _enteredPin.length;
                    return Container(
                      width: 14,
                      height: 14,
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: isFilled ? AppColors.accent : Colors.white.withOpacity(0.1),
                        shape: BoxShape.circle,
                        boxShadow: isFilled
                            ? [
                                BoxShadow(
                                  color: AppColors.accent.withOpacity(0.5),
                                  blurRadius: 8,
                                )
                              ]
                            : null,
                      ),
                    );
                  }),
                ),

                if (_errorMsg != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _errorMsg!,
                    style: const TextStyle(fontFamily: 'Vazirmatn', fontSize: 12, color: AppColors.error),
                  ),
                ],

                const SizedBox(height: 32),

                // Numpad Grid
                Container(
                  width: 280,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: ['1', '2', '3'].map((d) => _buildNumButton(d)).toList(),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: ['4', '5', '6'].map((d) => _buildNumButton(d)).toList(),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: ['7', '8', '9'].map((d) => _buildNumButton(d)).toList(),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          if (state.settings.enableBiometrics)
                            IconButton(
                              onPressed: () async {
                                final ok = await BiometricService.authenticate();
                                if (ok && mounted) state.unlockApp();
                              },
                              icon: const Icon(Icons.fingerprint, color: AppColors.accent, size: 28),
                            )
                          else
                            const SizedBox(width: 56),
                          _buildNumButton('0'),
                          IconButton(
                            onPressed: _onDelete,
                            icon: const Icon(Icons.backspace_outlined, color: AppColors.textMuted, size: 22),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNumButton(String digit) {
    return GestureDetector(
      onTap: () => _onDigit(digit),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.glassBorder),
        ),
        alignment: Alignment.center,
        child: Text(
          PersianNumbers.toPersian(digit),
          style: const TextStyle(
            fontFamily: 'Vazirmatn',
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}
