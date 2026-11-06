<?php

use App\Http\Controllers\DocumentationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route Dokumentasi API Interaktif (Swagger UI)
Route::get('/docs/api', [DocumentationController::class, 'index'])->name('docs.api');
Route::get('/api/documentation', [DocumentationController::class, 'index']);
Route::get('/api/documentation.yaml', [DocumentationController::class, 'spec'])->name('docs.spec');

