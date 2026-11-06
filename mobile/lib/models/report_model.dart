class WasteReport {
  final int id;
  final int userId;
  final String title;
  final String? description;
  final String imageUrl;
  final double? latitude;
  final double? longitude;
  final String? addressNote;
  final String wasteCategory;
  final double aiConfidence;
  final String status;
  final String? adminNotes;
  final String createdAt;

  WasteReport({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.imageUrl,
    this.latitude,
    this.longitude,
    this.addressNote,
    required this.wasteCategory,
    required this.aiConfidence,
    required this.status,
    this.adminNotes,
    required this.createdAt,
  });

  factory WasteReport.fromJson(Map<String, dynamic> json) {
    return WasteReport(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      userId: json['user_id'] is int ? json['user_id'] : int.parse(json['user_id'].toString()),
      title: json['title'] ?? '',
      description: json['description'],
      imageUrl: json['image_url'] ?? '',
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      addressNote: json['address_note'],
      wasteCategory: json['waste_category'] ?? 'Other',
      aiConfidence: json['ai_confidence'] != null ? (double.tryParse(json['ai_confidence'].toString()) ?? 0.0) : 0.0,
      status: json['status'] ?? 'pending',
      adminNotes: json['admin_notes'],
      createdAt: json['created_at'] ?? '',
    );
  }
}

