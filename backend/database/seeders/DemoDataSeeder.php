<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Report;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@smartwaste.com'],
            [
                'name' => 'Admin Dinas Lingkungan',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '081234567890'
            ]
        );

        $officer = User::updateOrCreate(
            ['email' => 'petugas@smartwaste.com'],
            [
                'name' => 'Petugas Lapangan Kebersihan',
                'password' => Hash::make('petugas123'),
                'role' => 'officer',
                'phone' => '081234567891'
            ]
        );

        $warga = User::updateOrCreate(
            ['email' => 'warga@smartwaste.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('warga123'),
                'role' => 'user',
                'phone' => '081234567892'
            ]
        );

        if (Report::count() === 0) {
            Report::create([
                'user_id' => $warga->id,
                'title' => 'Tumpukan Botol Plastik di Pinggir Kanal',
                'description' => 'Tumpukan limbah botol plastik menyumbat saluran drainase air hujan.',
                'image_url' => 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'address_note' => 'Jl. Sudirman No. 12, Jakarta',
                'waste_category' => 'Plastic Waste',
                'ai_confidence' => 0.945,
                'status' => 'pending',
                'created_at' => now()->subHours(2),
            ]);

            Report::create([
                'user_id' => $warga->id,
                'title' => 'Limbah Sisa Makanan Pasar Tradisional',
                'description' => 'Sampah sayur dan buah busuk menumpuk di belakang los sayur.',
                'image_url' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.1751,
                'longitude' => 106.8650,
                'address_note' => 'Pasar Senen Blok B, Jakarta Pusat',
                'waste_category' => 'Organic Waste',
                'ai_confidence' => 0.912,
                'status' => 'in_progress',
                'admin_notes' => 'Petugas armada truk sampah sedang menuju lokasi.',
                'handled_at' => now()->subHour(),
                'created_at' => now()->subHours(5),
            ]);

            Report::create([
                'user_id' => $warga->id,
                'title' => 'Kardus dan Kertas Bekas Percetakan',
                'description' => 'Limbah potongan kertas dan kardus basah tercecer di trotoar.',
                'image_url' => 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.2250,
                'longitude' => 106.8000,
                'address_note' => 'Kebayoran Baru, Jakarta Selatan',
                'waste_category' => 'Paper Waste',
                'ai_confidence' => 0.887,
                'status' => 'completed',
                'admin_notes' => 'Area telah dibersihkan oleh regu kebersihan PPSU.',
                'handled_at' => now()->subHours(8),
                'created_at' => now()->subDay(),
            ]);
        }
    }
}
