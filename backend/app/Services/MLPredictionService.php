<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MLPredictionService
{
    protected string $mlServiceUrl;

    public function __construct()
    {
        $this->mlServiceUrl = env('ML_SERVICE_URL', 'http://127.0.0.1:8000');
    }

    /**
     * Send uploaded image file to FastAPI ML Service for waste classification.
     * Returns ['category' => 'Plastic Waste', 'confidence' => 0.94]
     */
    public function predictImage($file): array
    {
        try {
            $response = Http::attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->timeout(10)->post("{$this->mlServiceUrl}/predict");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'category' => $data['category'] ?? 'Other',
                    'confidence' => (float)($data['confidence'] ?? 0.0),
                    'probabilities' => $data['probabilities'] ?? []
                ];
            }

            Log::warning("ML Service response error: " . $response->body());
        } catch (\Exception $e) {
            Log::warning("Cannot connect to ML FastAPI service: " . $e->getMessage());
        }

        // Default fallback classification if ML service is not reachable
        return [
            'category' => 'Other Waste',
            'confidence' => 0.0,
            'probabilities' => []
        ];
    }
}

