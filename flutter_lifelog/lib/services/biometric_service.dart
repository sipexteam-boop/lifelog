import 'package:local_auth/local_auth.dart';

class BiometricService {
  static final BiometricService instance = BiometricService._internal();
  BiometricService._internal();
  factory BiometricService() => instance;

  static final LocalAuthentication _auth = LocalAuthentication();

  Future<bool> checkAvailability() async => isBiometricAvailable();

  static Future<bool> isBiometricAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();
      return canCheck && isDeviceSupported;
    } catch (_) {
      return false;
    }
  }

  Future<bool> auth({String reason = 'لطفاً برای ورود به LifeLog هویت خود را تأیید کنید'}) async =>
      authenticate(reason: reason);

  static Future<bool> authenticate({String reason = 'لطفاً برای ورود به LifeLog هویت خود را تأیید کنید'}) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }
}
