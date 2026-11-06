class AppConstants {
  // Base URLs - Ganti dengan IP/Host backend Anda saat running
  // Default Android emulator: 10.0.2.2, Perangkat fisik: gunakan IP Wi-Fi komputer (contoh: 192.168.1.X)
  static const String baseUrl = 'http://192.168.1.8:8080/api';

  // Auth endpoints
  static const String loginUrl = '$baseUrl/auth/login';
  static const String registerUrl = '$baseUrl/auth/register';
  static const String logoutUrl = '$baseUrl/auth/logout';
  static const String meUrl = '$baseUrl/auth/me';

  // Report endpoints
  static const String reportsUrl = '$baseUrl/reports';
  static const String myReportsUrl = '$baseUrl/reports/my';
}
