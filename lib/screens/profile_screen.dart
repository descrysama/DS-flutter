// lib/screens/profile_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../widgets/profile_info_tile.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // Déconnexion : suppression du token puis retour à l'écran de connexion
  Future<void> _logout(BuildContext context) async {
    await context.read<AuthProvider>().logout();
    if (!context.mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    // Pendant la déconnexion, l'utilisateur peut être null un court instant
    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil de l\'Utilisateur'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Affichage des informations du profil
            ProfileInfoTile(icon: Icons.person, label: 'Nom', value: user.fullName),
            ProfileInfoTile(icon: Icons.email, label: 'Email', value: user.email),
            ProfileInfoTile(icon: Icons.security, label: 'Rôle', value: user.roleLabel),
            const SizedBox(height: 24.0),
            ElevatedButton(
              onPressed: () => _logout(context),
              child: const Text('Se déconnecter'),
            ),
          ],
        ),
      ),
    );
  }
}
