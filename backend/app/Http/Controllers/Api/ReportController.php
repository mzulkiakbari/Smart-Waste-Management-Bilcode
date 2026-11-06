<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Services\MLPredictionService;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected SupabaseStorageService $storageService;
    protected MLPredictionService $mlService;

    public function __construct(SupabaseStorageService $storageService, MLPredictionService $mlService)
    {
        $this->storageService = $storageService;
        $this->mlService = $mlService;
    }

    public function index(Request $request)
    {
        $query = Report::with('user:id,name,email');

        // Filter status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter waste category
        if ($request->filled('waste_category') && $request->waste_category !== 'all') {
            $query->where('waste_category', $request->waste_category);
        }

        // Search text
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address_note', 'like', "%{$search}%");
            });
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($reports);
    }

    public function myReports(Request $request)
    {
        $reports = Report::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $reports]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|max:10240', // Max 10MB
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'address_note' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $imageFile = $request->file('image');

        // 1. Alur Opsi A: Meneruskan file foto ke FastAPI ML Service untuk klasifikasi
        $aiResult = $this->mlService->predictImage($imageFile);

        // 2. Upload file foto ke Supabase Storage (atau fallback lokal)
        $imageUrl = $this->storageService->uploadImage($imageFile, $user->id);

        // 3. Simpan ke database Supabase PostgreSQL
        $report = Report::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $imageUrl,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address_note' => $request->address_note,
            'waste_category' => $aiResult['category'] ?? 'Other',
            'ai_confidence' => $aiResult['confidence'] ?? 0.0,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Laporan sampah berhasil dibuat dan diverifikasi oleh AI',
            'data' => $report,
        ], 201);
    }

    public function show(string $id)
    {
        $report = Report::with('user:id,name,email,phone')->findOrFail($id);
        return response()->json(['data' => $report]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $report = Report::findOrFail($id);
        $report->status = $request->status;
        if ($request->filled('admin_notes')) {
            $report->admin_notes = $request->admin_notes;
        }
        if (in_array($request->status, ['in_progress', 'completed'])) {
            $report->handled_at = now();
        }
        $report->save();

        return response()->json([
            'message' => 'Status laporan berhasil diperbarui',
            'data' => $report,
        ]);
    }

    public function destroy(string $id)
    {
        $report = Report::findOrFail($id);
        $report->delete();

        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }

    public function statistics()
    {
        $total = Report::count();
        $byStatus = [
            'pending' => Report::where('status', 'pending')->count(),
            'in_progress' => Report::where('status', 'in_progress')->count(),
            'completed' => Report::where('status', 'completed')->count(),
            'rejected' => Report::where('status', 'rejected')->count(),
        ];

        $byCategory = [
            'Plastic Waste' => Report::where('waste_category', 'Plastic Waste')->count(),
            'Organic Waste' => Report::where('waste_category', 'Organic Waste')->count(),
            'Paper Waste' => Report::where('waste_category', 'Paper Waste')->count(),
        ];

        return response()->json([
            'total_reports' => $total,
            'by_status' => $byStatus,
            'by_category' => $byCategory,
        ]);
    }
}

