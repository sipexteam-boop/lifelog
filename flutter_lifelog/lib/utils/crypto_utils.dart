import 'dart:convert';
import 'package:crypto/crypto.dart';

class CryptoUtils {
  static String hashPin(String pin) {
    final salt = 'lifelog_yasin_salt_2026';
    final bytes = utf8.encode('$salt$pin$salt');
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  static bool verifyPin(String enteredPin, String expectedHash) {
    return hashPin(enteredPin) == expectedHash;
  }
}
