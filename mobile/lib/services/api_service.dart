import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';
import '../models/report_model.dart';

class ApiService {
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse(AppConstants.loginUrl),
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['token'] != null) {
      await saveToken(data['token']);
      return {'success': true, 'user': UserModel.fromJson(data['user'])};
    } else {
      return {'success': false, 'message': data['message'] ?? 'Login failed'};
    }
  }

  // Register
  static Future<Map<String, dynamic>> register(String name, String email, String password, {String? phone}) async {
    final response = await http.post(
      Uri.parse(AppConstants.registerUrl),
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': password,
        'phone': phone,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['token'] != null) {
      await saveToken(data['token']);
      return {'success': true, 'user': UserModel.fromJson(data['user'])};
    } else {
      return {'success': false, 'message': data['message'] ?? 'Registration failed'};
    }
  }

  // Get My Reports
  static Future<List<WasteReport>> getMyReports() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse(AppConstants.myReportsUrl),
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = data['data'] as List? ?? [];
      return list.map((item) => WasteReport.fromJson(item)).toList();
    }
    return [];
  }

  // Create Waste Report (Multipart upload: photo + metadata -> Laravel -> FastAPI ML -> Supabase)
  static Future<Map<String, dynamic>> createReport({
    required String title,
    String? description,
    required File imageFile,
    double? latitude,
    double? longitude,
    String? addressNote,
  }) async {
    final token = await getToken();
    final request = http.MultipartRequest('POST', Uri.parse(AppConstants.reportsUrl));

    request.headers.addAll({
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    });

    request.fields['title'] = title;
    if (description != null) request.fields['description'] = description;
    if (latitude != null) request.fields['latitude'] = latitude.toString();
    if (longitude != null) request.fields['longitude'] = longitude.toString();
    if (addressNote != null) request.fields['address_note'] = addressNote;

    request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final data = jsonDecode(response.body);

    if (response.statusCode == 201 || response.statusCode == 200) {
      return {'success': true, 'report': WasteReport.fromJson(data['data'])};
    } else {
      return {'success': false, 'message': data['message'] ?? 'Failed to submit report'};
    }
  }
}

