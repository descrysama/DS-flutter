// lib/config/api_config.dart

import 'package:flutter/foundation.dart';

/// Configuration de l'accès à l'API REST.
///
/// L'URL peut être fournie au lancement :
///   flutter run --dart-define=API_URL=https://mon-api.example.com
class ApiConfig {
  ApiConfig._();

  static const String _fromEnvironment = String.fromEnvironment('API_URL');

  /// URL de base de l'API (sans "/" final).
  static String get baseUrl {
    if (_fromEnvironment.isNotEmpty) return _fromEnvironment;

    // L'émulateur Android accède à la machine hôte via 10.0.2.2
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  /// Endpoint de connexion (POST email, password).
  static Uri get loginUri => Uri.parse('$baseUrl/login');

  /// Endpoint du profil connecté (GET, protégé par token).
  static Uri get meUri => Uri.parse('$baseUrl/me');

  /// Délai maximum d'attente d'une réponse.
  static const Duration timeout = Duration(seconds: 10);
}
