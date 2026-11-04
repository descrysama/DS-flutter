// lib/providers/auth_provider.dart

import 'package:flutter/foundation.dart';

import '../models/auth_exception.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/token_storage.dart';

/// État de l'authentification, partagé dans toute l'application via Provider.
class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  final TokenStorage _tokenStorage;

  AuthProvider({AuthService? authService, TokenStorage? tokenStorage})
      : _authService = authService ?? AuthService(),
        _tokenStorage = tokenStorage ?? TokenStorage();

  User? _user;
  bool _isLoading = false;
  String? _errorMessage;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Au démarrage : si un token valide est stocké, on restaure la session.
  Future<void> restoreSession() async {
    final token = await _tokenStorage.readToken();
    if (token != null) {
      _user = await _authService.fetchProfile(token);
      if (_user == null) await _tokenStorage.deleteToken();
    }
    notifyListeners();
  }

  /// Tente une connexion. Retourne true si elle a réussi.
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _authService.login(email, password);
      _user = result.user;
      if (result.token != null) {
        await _tokenStorage.saveToken(result.token!);
      }
      return true;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Déconnexion : suppression du token et de l'utilisateur.
  Future<void> logout() async {
    await _tokenStorage.deleteToken();
    _user = null;
    _errorMessage = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _authService.dispose();
    super.dispose();
  }
}
