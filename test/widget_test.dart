// test/widget_test.dart

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';

import 'package:login_app_plus/models/auth_exception.dart';
import 'package:login_app_plus/models/user.dart';
import 'package:login_app_plus/providers/auth_provider.dart';
import 'package:login_app_plus/screens/login_screen.dart';
import 'package:login_app_plus/services/auth_service.dart';
import 'package:login_app_plus/services/token_storage.dart';

/// Stockage en mémoire, pour ne pas dépendre du plugin natif pendant les tests.
class FakeTokenStorage extends TokenStorage {
  String? token;

  @override
  Future<void> saveToken(String token) async => this.token = token;

  @override
  Future<String?> readToken() async => token;

  @override
  Future<void> deleteToken() async => token = null;
}

/// Simule l'API : seul jean@example.com / userpass est accepté.
MockClient fakeApi() {
  return MockClient((request) async {
    final fields = Uri.splitQueryString(request.body);
    if (fields['email'] == 'jean@example.com' && fields['password'] == 'userpass') {
      return http.Response(
        jsonEncode({
          'status': 200,
          'message': 'Success',
          'id': 1,
          'firstName': 'Jean',
          'lastName': 'Dupont',
          'email': 'jean@example.com',
          'role': 2,
          'token': 'abc123',
        }),
        200,
      );
    }
    return http.Response(jsonEncode({'status': 400, 'message': 'Error'}), 400);
  });
}

void main() {
  group('User', () {
    test('se construit depuis le JSON de l\'API', () {
      final user = User.fromJson({
        'id': '2',
        'firstName': 'Julie',
        'lastName': 'Martin',
        'email': 'julie@example.com',
        'role': 1,
      });
      expect(user.id, 2);
      expect(user.fullName, 'Julie Martin');
      expect(user.initials, 'JM');
      expect(user.roleLabel, 'Administrateur');
    });
  });

  group('AuthService', () {
    test('connexion réussie : renvoie l\'utilisateur et le token', () async {
      final service = AuthService(client: fakeApi());
      final result = await service.login('jean@example.com', 'userpass');
      expect(result.user.firstName, 'Jean');
      expect(result.token, 'abc123');
    });

    test('mauvais identifiants : lève une AuthException', () async {
      final service = AuthService(client: fakeApi());
      expect(
        () => service.login('jean@example.com', 'mauvais'),
        throwsA(isA<AuthException>().having(
          (e) => e.type,
          'type',
          AuthErrorType.invalidCredentials,
        )),
      );
    });
  });

  group('AuthProvider', () {
    test('stocke le token après connexion et le supprime à la déconnexion', () async {
      final storage = FakeTokenStorage();
      final provider = AuthProvider(
        authService: AuthService(client: fakeApi()),
        tokenStorage: storage,
      );

      expect(await provider.login('jean@example.com', 'userpass'), isTrue);
      expect(provider.isAuthenticated, isTrue);
      expect(storage.token, 'abc123');

      await provider.logout();
      expect(provider.isAuthenticated, isFalse);
      expect(storage.token, isNull);
    });
  });

  group('LoginScreen', () {
    Widget buildApp() {
      return ChangeNotifierProvider(
        create: (_) => AuthProvider(
          authService: AuthService(client: fakeApi()),
          tokenStorage: FakeTokenStorage(),
        ),
        child: const MaterialApp(home: LoginScreen()),
      );
    }

    testWidgets('affiche les erreurs de validation', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Se connecter'));
      await tester.pumpAndSettle();

      expect(find.text('Veuillez entrer votre email'), findsOneWidget);
      expect(find.text('Veuillez entrer votre mot de passe'), findsOneWidget);
    });

    testWidgets('affiche un message si les identifiants sont faux', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField).at(0), 'jean@example.com');
      await tester.enterText(find.byType(TextFormField).at(1), 'mauvais');
      await tester.tap(find.text('Se connecter'));
      await tester.pumpAndSettle();

      expect(find.text('Email ou mot de passe incorrect.'), findsOneWidget);
    });
  });
}
