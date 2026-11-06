<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class DocumentationController extends Controller
{
    /**
     * Tampilkan antarmuka UI Swagger untuk dokumentasi API.
     */
    public function index()
    {
        return view('docs.swagger');
    }

    /**
     * Ambil file OpenAPI spec (YAML).
     */
    public function spec(): Response
    {
        $filePath = resource_path('docs/openapi.yaml');

        if (! file_exists($filePath)) {
            abort(404, 'Spesifikasi OpenAPI tidak ditemukan.');
        }

        return response(file_get_contents($filePath), 200, [
            'Content-Type' => 'application/x-yaml',
            'Content-Disposition' => 'inline; filename="openapi.yaml"',
        ]);
    }
}

