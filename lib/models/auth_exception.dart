// lib/models/auth_exception.dart

/// Types d'erreurs possibles lors de l'authentification.
enum AuthErrorType {
  invalidCredentials,
  network,
  timeout,
  tooManyRequests,
  server,
}

/// Erreur levée par [AuthService], avec un message lisible pour l'utilisateur.
class AuthException implements Exception {
  final AuthErrorType type;
  final String message;

  const AuthException(this.type, this.message);

  @override
  String toString() => 'AuthException($type): $message';
}
