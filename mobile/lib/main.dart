import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartWasteApp());
}

class SmartWasteApp extends StatefulWidget {
  const SmartWasteApp({super.key});

  @override
  State<SmartWasteApp> createState() => _SmartWasteAppState();
}

class _SmartWasteAppState extends State<SmartWasteApp> {
  bool _isChecking = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await ApiService.getToken();
    setState(() {
      _isLoggedIn = token != null && token.isNotEmpty;
      _isChecking = false;
    });
  }

  void _onLoginSuccess() {
    setState(() {
      _isLoggedIn = true;
    });
  }

  void _onLogout() async {
    await ApiService.removeToken();
    setState(() {
      _isLoggedIn = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Waste Management',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      home: _isChecking
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : _isLoggedIn
              ? HomeScreen(onLogout: _onLogout)
              : AuthScreen(onLoginSuccess: _onLoginSuccess),
    );
  }
}

