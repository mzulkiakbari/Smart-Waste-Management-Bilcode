<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseStorageService
{
    protected ?string $supabaseUrl;
    protected ?string $supabaseKey;
    protected string $bucket;

    public function __construct()
    {
        $this->supabaseUrl = env('SUPABASE_URL');
        $this->supabaseKey = env('SUPABASE_KEY') ?: env('SUPABASE_SERVICE_ROLE_KEY');
        $this->bucket = env('SUPABASE_STORAGE_BUCKET', 'waste-reports');
    }

    /**
     * Upload an image file to Supabase Storage bucket.
     * Returns the public URL of the uploaded image.
     */
    public function uploadImage($file, int $userId): string
    {
        // Jika config Supabase belum diisi oleh user, simpan lokal sebagai fallback yang aman
        if (empty($this->supabaseUrl) || empty($this->supabaseKey)) {
            $path = $file->store("reports/{$userId}", 'public');
            return url("storage/{$path}");
        }

        $extension = $file->getClientOriginalExtension();
        $fileName = time() . '_' . uniqid() . '.' . $extension;
        $filePath = "reports/{$userId}/{$fileName}";

        $uploadUrl = rtrim($this->supabaseUrl, '/') . "/storage/v1/object/{$this->bucket}/{$filePath}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->supabaseKey}",
            'apiKey' => $this->supabaseKey,
            'Content-Type' => $file->getMimeType(),
        ])->withBody(file_get_contents($file->getRealPath()), $file->getMimeType())
          ->post($uploadUrl);

        if ($response->successful()) {
            return rtrim($this->supabaseUrl, '/') . "/storage/v1/object/public/{$this->bucket}/{$filePath}";
        }

        Log::error("Supabase Storage Upload Error: " . $response->body());
        
        // Fallback to local storage jika bucket upload gagal
        $path = $file->store("reports/{$userId}", 'public');
        return url("storage/{$path}");
    }
}

