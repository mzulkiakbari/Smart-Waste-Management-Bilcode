import React from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight, ShieldCheck, Smartphone, Cpu, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-slate-900">
            <Trash2 className="w-6 h-6 font-bold" />
          </div>
          <span className="text-xl font-bold tracking-tight">SmartWaste System</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login"
            className="px-4 py-2 border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Masuk / Login
          </Link>
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            Buka Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold mb-6">
          <Cpu className="w-4 h-4" />
          <span>Integrated Mobile AI & Cloud Waste Management</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Pengelolaan Sampah Cerdas Berbasis{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            AI Image Detection
          </span>{' '}
          & Mobile Geolocation
        </h1>

        <p className="mt-6 text-slate-400 text-lg max-w-2xl">
          Solusi terintegrasi untuk pelaporan sampah warga via aplikasi Flutter, verifikasi otomatis klasifikasi sampah dengan PyTorch Deep Learning, dan pemantauan realtime petugas dinas via Next.js.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl flex items-center space-x-2 transition-all shadow-xl shadow-emerald-500/20"
          >
            <span>Masuk ke Dashboard Operasional</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 3 Core Architecture Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold mb-2">Flutter Mobile App</h2>
            <p className="text-sm text-slate-400">
              Pelaporan sampah oleh warga menggunakan kamera, integrasi GPS geolocation realtime, dan pelacakan status penanganan laporan.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-sm">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl w-fit mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold mb-2">PyTorch & FastAPI ML</h2>
            <p className="text-sm text-slate-400">
              Klasifikasi otomatis gambar sampah ke 3 kategori: Plastic Waste, Organic Waste, dan Paper Waste dengan transfer learning MobileNetV2.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-sm">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold mb-2">Next.js Web & Supabase</h2>
            <p className="text-sm text-slate-400">
              Dashboard analitik interaktif, manajemen status penanganan (Pending, In Progress, Completed, Rejected), dan cloud database PostgreSQL.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Smart Waste Management System &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
