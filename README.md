# Smart Waste Management System

Sistem Pengelolaan Sampah Terpadu Berbasis AI Image Detection & Mobile Geolocation yang mengintegrasikan:
1. **Web Dashboard** (Next.js 16 + Tailwind CSS + Recharts)
2. **Mobile Application** (Flutter + Geolocator + Image Picker + Camera)
3. **Backend API Gateway** (Laravel 11 + Sanctum + Supabase PostgreSQL & Storage)
4. **Machine Learning Service** (PyTorch MobileNetV2 Transfer Learning + FastAPI)

---

## 📁 Struktur Monorepo

```text
Smart Waste Management/
├── backend/          # Laravel 11 REST API & Sanctum
├── web/              # Next.js 16 App Router Dashboard
├── mobile/           # Flutter Mobile Application
├── ml_service/       # FastAPI REST API Image Prediction (/predict, /health)
├── ml_training/      # Script Dataset, Training PyTorch MobileNetV2, dan Evaluasi
├── docs/             # Database Schema (ERD) & Dokumentasi API
└── .github/          # GitHub Actions CI/CD Workflow untuk Auto Build Android APK
```

---

## 🚀 Panduan Instalasi & Menjalankan Sistem

### 1. Machine Learning Service (FastAPI)

1. Masuk ke direktori `ml_service/`:
   ```bash
   cd ml_service
   pip install -r requirements.txt
   ```
2. Jalankan FastAPI server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
3. Akses Swagger UI di peramban: `http://localhost:8000/docs`.

#### Training Ulang Model (Opsional):
Jika ingin melatih model dari awal:
```bash
cd ml_training
python prepare_dataset.py   # Mengunduh & menata dataset dari Kaggle
python train.py             # Melatih MobileNetV2 (10 Epoch)
python evaluate.py          # Menghasilkan Confusion Matrix & Classification Report
```
* **Hasil Evaluasi**: Akurasi data testing mencapai **97.78%** (Target minimal: 80%).

---

### 2. Backend Gateway (Laravel 11)

1. Masuk ke direktori `backend/`:
   ```bash
   cd backend
   ```
2. Konfigurasi kredensial pada file `.env`:
   ```env
   # Koneksi PostgreSQL Supabase
   DB_CONNECTION=pgsql
   DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres.YOUR_PROJECT_REF
   DB_PASSWORD=YOUR_SUPABASE_PASSWORD

   # Supabase Storage Integration
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
   SUPABASE_STORAGE_BUCKET=waste-reports

   # Koneksi ke ML FastAPI
   ML_SERVICE_URL=http://127.0.0.1:8000
   ```
3. Jalankan migrasi database:
   ```bash
   php artisan migrate
   ```

   > **Troubleshooting: Error `could not find driver (Connection: pgsql)`**
   > Jika saat migrasi muncul error driver pgsql tidak ditemukan, artinya ekstensi PostgreSQL PHP belum diaktifkan di Windows:
   > - **Laragon**: Klik kanan ikon tray Laragon &rarr; **PHP** &rarr; **Extensions** &rarr; centang **`pdo_pgsql`** dan **`pgsql`**.
   > - **XAMPP / Standalone PHP**:
   >   1. Jalankan `php --ini` untuk melihat file `php.ini` yang aktif.
   >   2. Buka `php.ini`, cari dan aktifkan (hapus tanda `;` di awal baris):
   >      ```ini
   >      extension=pdo_pgsql
   >      extension=pgsql
   >      ```
   >   3. Simpan file `php.ini` lalu jalankan kembali `php artisan migrate`.

4. Jalankan server Laravel:
   ```bash
   php artisan serve --port=8080
   ```

---

### 3. Website Dashboard (Next.js 16)

1. Masuk ke direktori `web/`:
   ```bash
   cd web
   npm install
   ```
2. Jalankan mode pengembangan:
   ```bash
   npm run dev
   ```
3. Buka di browser: `http://localhost:3000` (Landing Page) atau `http://localhost:3000/dashboard` (Dashboard Operasional Petugas/Admin).
4. Untuk build production:
   ```bash
   npm run build
   npm run start
   ```

---

### 4. Mobile Application (Flutter) & Build APK

1. Masuk ke direktori `mobile/`:
   ```bash
   cd mobile
   flutter pub get
   ```
2. Menjalankan di emulator / HP fisik:
   ```bash
   flutter run
   ```
   *(Pastikan IP backend di `lib/constants/app_constants.dart` disesuaikan dengan IP laptop/server Anda)*.

3. **Build APK Release Tanpa Android Studio Berat**:
   Proyek ini telah dilengkapi **GitHub Actions CI/CD** di `.github/workflows/build_apk.yml`. 
   Cukup push kode ini ke repositori GitHub Anda, runner Ubuntu GitHub akan secara otomatis mengompilasi APK dan menyediakannya di tab **GitHub Actions -> Artifacts** untuk langsung diunduh ke handphone!

---

## 📊 Hasil Evaluasi Model Machine Learning

* **Model**: MobileNetV2 (Transfer Learning Pretrained ImageNet)
* **Dataset**: Garbage Classification Dataset (1,200 total gambar seimbang)
* **Kategori**: `Organic Waste`, `Paper Waste`, `Plastic Waste`
* **Test Accuracy**: **97.78%** *(Lolos target minimum 80%)*

### Classification Report:
```text
               precision    recall  f1-score   support

Organic Waste     1.0000    1.0000    1.0000        60
  Paper Waste     0.9516    0.9833    0.9672        60
Plastic Waste     0.9828    0.9500    0.9661        60

     accuracy                         0.9778       180
```
Grafik confusion matrix dan training history tersimpan di `ml_training/results/confusion_matrix.png` dan `ml_training/results/training_history.png`.

