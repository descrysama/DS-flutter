// lib/models/user.dart

/// Utilisateur connecté, construit à partir de la réponse JSON de l'API.
class User {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final int role;

  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: _toInt(json['id']),
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: _toInt(json['role']),
    );
  }

  String get fullName => '$firstName $lastName'.trim();

  /// Initiales affichées dans l'avatar.
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0] : '';
    final last = lastName.isNotEmpty ? lastName[0] : '';
    return (first + last).toUpperCase();
  }

  /// Libellé du rôle (1 = administrateur, 2 = utilisateur).
  String get roleLabel {
    switch (role) {
      case 1:
        return 'Administrateur';
      case 2:
        return 'Utilisateur';
      default:
        return 'Rôle $role';
    }
  }

  // Certaines API renvoient les nombres sous forme de chaînes : on accepte les deux.
  static int _toInt(dynamic value) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}
