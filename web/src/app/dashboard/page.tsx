'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Trash2, AlertCircle, Clock, CheckCircle2, XCircle, 
  Filter, Search, MapPin, Eye, FileText, RefreshCw, LogOut,
  Shield, UserCheck, ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Report {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  address_note: string | null;
  waste_category: string;
  ai_confidence: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  admin_notes: string | null;
  handled_at: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string };
}

interface DashboardStats {
  total_reports: number;
  by_status: {
    pending: number;
    in_progress: number;
    completed: number;
    rejected: number;
  };
  by_category: {
    'Plastic Waste': number;
    'Organic Waste': number;
    'Paper Waste': number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'Plastic Waste': '#3b82f6',
  'Organic Waste': '#10b981',
  'Paper Waste': '#f59e0b',
  'Other': '#6b7280',
};

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30', text: 'text-amber-400', label: 'Pending' },
  in_progress: { bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/30', text: 'text-blue-400', label: 'In Progress' },
  completed: { bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30', text: 'text-emerald-400', label: 'Completed' },
  rejected: { bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30', text: 'text-rose-400', label: 'Rejected' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Update Status
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<Report['status']>('pending');
  const [isUpdating, setIsUpdating] = useState(false);

  // Cek otentikasi
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Fetch data dari Backend API (Database Supabase)
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    setErrorMessage('');

    try {
      // 1. Fetch Reports dengan parameter filter
      const reportsParams: Record<string, string> = {};
      if (statusFilter !== 'all') reportsParams.status = statusFilter;
      if (categoryFilter !== 'all') reportsParams.waste_category = categoryFilter;
      if (searchQuery.trim() !== '') reportsParams.search = searchQuery.trim();

      const [reportsRes, statsRes] = await Promise.all([
        api.get('/reports', { params: reportsParams }),
        api.get('/dashboard/statistics'),
      ]);

      // Laravel paginate response return reportsRes.data.data
      const reportList = reportsRes.data?.data || reportsRes.data || [];
      setReports(reportList);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(
        err.response?.data?.message || 
        'Gagal memuat data dari database backend. Pastikan backend Laravel aktif di port 8080.'
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [token, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  // Role Permissions
  // Admin & Officer: Memiliki wewenang mengupdate status laporan
  // User Warga: Hanya View (Read Only)
  const canManageReports = user?.role === 'admin' || user?.role === 'officer';

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !canManageReports) return;

    setIsUpdating(true);
    try {
      const response = await api.patch(`/reports/${selectedReport.id}/status`, {
        status: newStatus,
        admin_notes: adminNotes,
      });

      const updatedReport = response.data.data;

      // Update state reports & selectedReport
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, ...updatedReport } : r))
      );
      setSelectedReport((prev) => (prev ? { ...prev, ...updatedReport } : null));

      // Refresh statistics
      const statsRes = await api.get('/dashboard/statistics');
      setStats(statsRes.data);

      alert(`Status laporan #${selectedReport.id} berhasil diperbarui.`);
      setSelectedReport(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status laporan.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Recharts Data formatting
  const chartCategoryData = stats?.by_category
    ? Object.entries(stats.by_category).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const chartStatusData = stats?.by_status
    ? [
        { name: 'Pending', count: stats.by_status.pending, fill: '#f59e0b' },
        { name: 'In Progress', count: stats.by_status.in_progress, fill: '#3b82f6' },
        { name: 'Completed', count: stats.by_status.completed, fill: '#10b981' },
        { name: 'Rejected', count: stats.by_status.rejected, fill: '#ef4444' },
      ]
    : [];

  if (authLoading || !token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mr-3" />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-slate-950">
            <Trash2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none text-white">SmartWaste System</h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Operasional Terintegrasi Cloud Supabase</p>
          </div>
        </div>

        {/* User Role & Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
            <div className={`p-1.5 rounded-xl ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : user?.role === 'officer' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight text-slate-200">{user?.name}</p>
              <div className="flex items-center space-x-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-400' : user?.role === 'officer' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Role: {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            title="Keluar"
            className="p-2.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl text-slate-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner Hak Akses jika Role Warga / Read Only */}
        {!canManageReports && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-3 text-amber-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>
              Anda login sebagai <strong>Warga ({user?.role})</strong> dengan mode <em>Read-Only</em>. Untuk memperbarui status tindak lanjut sampah di lapangan, silakan login menggunakan akun <strong>Admin</strong> atau <strong>Petugas</strong>.
            </span>
          </div>
        )}

        {/* Database Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Laporan (Supabase)</p>
            <p className="text-3xl font-extrabold text-white mt-2">{stats ? stats.total_reports : reports.length}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Terkoneksi Realtime DB</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <p className="text-xs uppercase font-bold tracking-wider text-amber-400">Menunggu Tindakan</p>
            <p className="text-3xl font-extrabold text-white mt-2">{stats?.by_status.pending ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Status Pending</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <p className="text-xs uppercase font-bold tracking-wider text-blue-400">Sedang Ditangani</p>
            <p className="text-3xl font-extrabold text-white mt-2">{stats?.by_status.in_progress ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Armada di Lapangan</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
            <p className="text-xs uppercase font-bold tracking-wider text-emerald-400">Selesai Dibersihkan</p>
            <p className="text-3xl font-extrabold text-white mt-2">{stats?.by_status.completed ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Verifikasi Tuntas</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Kategori Sampah */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Distribusi Kategori Sampah (AI Inferred)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 600 }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Penanganan */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Proporsi Status Penanganan Petugas
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {chartStatusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, catatan alamat, atau deskripsi..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="Plastic Waste">Plastic Waste</option>
              <option value="Organic Waste">Organic Waste</option>
              <option value="Paper Waste">Paper Waste</option>
            </select>

            <button
              onClick={fetchDashboardData}
              title="Refresh Data"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table of Reports */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Daftar Laporan Sampah Masuk</h2>
            <span className="text-xs text-slate-400 font-medium">
              Menampilkan {reports.length} laporan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Laporan & Lokasi</th>
                  <th className="py-3.5 px-4">Kategori & AI Confidence</th>
                  <th className="py-3.5 px-4">Pelapor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoadingData ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      <span>Mengambil data dari PostgreSQL Supabase...</span>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Tidak ada laporan sampah yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">#{report.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {report.image_url ? (
                            <img
                              src={report.image_url}
                              alt={report.title}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-950 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                              <Trash2 className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-200 line-clamp-1">{report.title}</p>
                            <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{report.address_note || 'Lokasi GPS'}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {report.waste_category}
                        </span>
                        <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                          {(report.ai_confidence * 100).toFixed(1)}% match
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-300">{report.user?.name || 'Warga Anonim'}</p>
                        <p className="text-[10px] text-slate-500">{report.user?.email || '-'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_BADGES[report.status]?.bg || 'bg-slate-800 text-slate-400'}`}>
                          {STATUS_BADGES[report.status]?.label || report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setNewStatus(report.status);
                            setAdminNotes(report.admin_notes || '');
                          }}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold inline-flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{canManageReports ? 'Kelola' : 'Detail'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Detail & Update Status */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-emerald-400">Laporan #{selectedReport.id}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedReport.title}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Gambar Sampah */}
              {selectedReport.image_url && (
                <div className="w-full h-52 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={selectedReport.image_url}
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Detail Kategori & Koordinat */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Kategori AI</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedReport.waste_category}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Confidence: {(selectedReport.ai_confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Koordinat Geolocation</span>
                  <p className="font-mono text-slate-300 mt-0.5">
                    {selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{selectedReport.address_note || 'Tidak ada catatan alamat'}</p>
                </div>
              </div>

              {/* Deskripsi */}
              {selectedReport.description && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Keterangan Pelapor</span>
                  <p className="text-slate-300 mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {/* Form Update Status (Hanya untuk Admin / Petugas) */}
              {canManageReports ? (
                <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-800 space-y-4">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tindak Lanjut Petugas Lapangan</span>
                  </h4>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Ubah Status Penanganan
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Report['status'])}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Pending (Menunggu Armada)</option>
                      <option value="in_progress">In Progress (Armada Sedang Bergerak)</option>
                      <option value="completed">Completed (Sampah Selesai Diangkut)</option>
                      <option value="rejected">Rejected (Laporan Ditolak / Palsu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Catatan Tindakan Admin / Petugas
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Contoh: Petugas truk kebersihan no. 04 telah mengangkut sampah pukul 14:00..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pt-4 border-t border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Catatan Petugas Lapangan</span>
                  <p className="text-slate-300 mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedReport.admin_notes || 'Belum ada catatan tindak lanjut dari petugas.'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    *Akun Warga tidak memiliki hak untuk mengubah status laporan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
