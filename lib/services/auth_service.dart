// lib/services/auth_service.dart

import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../models/auth_exception.dart';
import '../models/user.dart';

/// Résultat d'une connexion réussie.
class LoginResult {
  final User user;
  final String? token;

  const LoginResult({required this.user, this.token});
}

/// Service d'authentification : communique avec l'API REST.
///
/// Le mot de passe est envoyé à l'API (en HTTPS en production) qui le vérifie
/// avec son hachage bcrypt. Aucun mot de passe n'est stocké dans l'application.
class AuthService {
  final http.Client _client;

  AuthService({http.Client? client}) : _client = client ?? http.Client();

  /// Envoie les identifiants à l'endpoint /login.
  /// Lève une [AuthException] en cas d'échec.
  Future<LoginResult> login(String email, String password) async {
    final http.Response response;
    try {
      // Envoi en form-urlencoded : compatible avec notre API Node
      // et avec l'API PHP d'origine ($_POST['email'], $_POST['password']).
      response = await _client
          .post(
            ApiConfig.loginUri,
            headers: {'Accept': 'application/json'},
            body: {'email': email, 'password': password},
          )
          .timeout(ApiConfig.timeout);
    } on TimeoutException {
      throw const AuthException(
        AuthErrorType.timeout,
        'Le serveur ne répond pas. Réessayez plus tard.',
      );
    } on Exception {
      // ClientException, erreur TLS... : le serveur est injoignable.
      throw const AuthException(
        AuthErrorType.network,
        'Impossible de joindre le serveur. Vérifiez votre connexion.',
      );
    }

    if (response.statusCode == 429) {
      throw const AuthException(
        AuthErrorType.tooManyRequests,
        'Trop de tentatives. Patientez quelques minutes.',
      );
    }
    if (response.statusCode >= 500) {
      throw const AuthException(
        AuthErrorType.server,
        'Erreur du serveur. Réessayez plus tard.',
      );
    }

    final json = _decode(response.body);

    // Le statut applicatif est dans le JSON ("status": 200 ou 400).
    if (json['status']?.toString() == '200') {
      return LoginResult(
        user: User.fromJson(json),
        token: json['token']?.toString(),
      );
    }

    throw const AuthException(
      AuthErrorType.invalidCredentials,
      'Email ou mot de passe incorrect.',
    );
  }

  /// Récupère le profil associé à un token (endpoint /me).
  /// Retourne null si le token est invalide ou expiré.
  Future<User?> fetchProfile(String token) async {
    try {
      final response = await _client
          .get(
            ApiConfig.meUri,
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer $token',
            },
          )
          .timeout(ApiConfig.timeout);

      if (response.statusCode != 200) return null;
      return User.fromJson(_decode(response.body));
    } on TimeoutException {
      return null;
    } on http.ClientException {
      return null;
    } on AuthException {
      return null;
    }
  }

  /// Décode le corps de la réponse en objet JSON.
  Map<String, dynamic> _decode(String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) return decoded;
    } on FormatException {
      // traité ci-dessous
    }
    throw const AuthException(
      AuthErrorType.server,
      'Réponse du serveur invalide.',
    );
  }

  void dispose() => _client.close();
}
