// lib/services/token_storage.dart

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Stockage sécurisé du token d'authentification
/// (Keychain sur iOS/macOS, Keystore chiffré sur Android).
class TokenStorage {
  static const _tokenKey = 'auth_token';

  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
    } catch (_) {
      // Stockage indisponible (ex. plateforme non configurée) : la session
      // fonctionne quand même, elle ne sera simplement pas restaurée.
    }
  }

  Future<String?> readToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _tokenKey);
    } catch (_) {
      // rien à faire
    }
  }
}
