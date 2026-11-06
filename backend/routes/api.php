<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

// Public Auth Endpoints
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

// Protected Endpoints
Route::middleware('auth:sanctum')->group(function () {
    // Current User & Logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Reports Management
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/my', [ReportController::class, 'myReports']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::patch('/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);

    // Dashboard Statistics
    Route::get('/dashboard/statistics', [ReportController::class, 'statistics']);
});
