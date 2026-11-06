# Dokumentasi API - Smart Waste Management System

API Gateway dibangun menggunakan **Laravel 11 REST API** dengan autentikasi **Laravel Sanctum**. Layanan Machine Learning terintegrasi via **FastAPI** (`POST /predict`).

---

## 1. Authentication Endpoints

### A. Register User / Citizen
* **URL**: `POST /api/auth/register`
* **Headers**: `Accept: application/json`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "081234567890"
}
```
* **Success Response (201 Created)**:
```json
{
  "message": "Registrasi berhasil",
  "token": "1|abcde12345...",
  "user": {
    "id": 2,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "user",
    "phone": "081234567890"
  }
}
```

### B. Login
* **URL**: `POST /api/auth/login`
* **Request Body**:
```json
{
  "email": "admin@waste.local",
  "password": "password"
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Login berhasil",
  "token": "2|qwerty67890...",
  "user": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@waste.local",
    "role": "admin"
  }
}
```

---

## 2. Waste Report Endpoints

### A. Create Waste Report (With AI Image Detection)
Endpoint ini menerima unggahan foto sampah dari mobile app, meneruskannya ke model ML FastAPI untuk diklasifikasikan, mengunggah foto ke Supabase Storage, lalu menyimpan record ke PostgreSQL.

* **URL**: `POST /api/reports`
* **Headers**:
  * `Authorization: Bearer <TOKEN>`
  * `Content-Type: multipart/form-data`
* **Form-Data**:
  * `title`: "Tumpukan sampah plastik di selokan"
  * `description`: "Banyak botol plastik menyumbat aliran air."
  * `image`: `[File binary JPG/PNG]`
  * `latitude`: `-6.2088`
  * `longitude`: `106.8456`
  * `address_note`: "Jl. Sudirman No. 45"
* **Response (201 Created)**:
```json
{
  "message": "Laporan berhasil dibuat dan diverifikasi oleh AI",
  "data": {
    "id": 10,
    "user_id": 2,
    "title": "Tumpukan sampah plastik di selokan",
    "description": "Banyak botol plastik menyumbat aliran air.",
    "image_url": "https://xyz.supabase.co/storage/v1/object/public/waste-reports/reports/2/1730480000_photo.jpg",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "address_note": "Jl. Sudirman No. 45",
    "waste_category": "Plastic Waste",
    "ai_confidence": 0.9425,
    "status": "pending",
    "admin_notes": null,
    "created_at": "2026-11-01T23:20:00.000000Z"
  }
}
```

### B. Get All Reports (Web Admin & Filter)
* **URL**: `GET /api/reports?status=pending&waste_category=Plastic+Waste&search=sudirman&page=1`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Query Parameters**:
  * `status`: `pending`, `in_progress`, `completed`, `rejected`
  * `waste_category`: `Organic Waste`, `Plastic Waste`, `Paper Waste`
  * `search`: Pencarian teks pada judul dan alamat
* **Response (200 OK)**:
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "total": 45
  }
}
```

### C. Update Report Status (Admin Only)
* **URL**: `PATCH /api/reports/{id}/status`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body**:
```json
{
  "status": "in_progress",
  "admin_notes": "Petugas kebersihan sektor 2 telah diberangkatkan ke lokasi."
}
```

---

## 3. Dashboard Statistics Endpoints

### A. Get Summary Statistics
* **URL**: `GET /api/dashboard/statistics`
* **Response (200 OK)**:
```json
{
  "total_reports": 128,
  "by_status": {
    "pending": 24,
    "in_progress": 18,
    "completed": 82,
    "rejected": 4
  },
  "by_category": {
    "Organic Waste": 45,
    "Plastic Waste": 62,
    "Paper Waste": 21
  },
  "monthly_trend": [
    {"month": "Jun", "count": 15},
    {"month": "Jul", "count": 28},
    {"month": "Aug", "count": 35},
    {"month": "Sep", "count": 50}
  ]
}
```

