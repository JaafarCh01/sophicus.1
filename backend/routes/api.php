<?php

use App\Http\Controllers\LeadController;
use App\Http\Controllers\PropertyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok']));

// Lead routes
Route::prefix('leads')->group(function () {
    Route::get('/stats', [LeadController::class, 'stats']);
    Route::get('/', [LeadController::class, 'index']);
    Route::post('/', [LeadController::class, 'store']);
    Route::get('/{lead}', [LeadController::class, 'show']);
    Route::put('/{lead}', [LeadController::class, 'update']);
    Route::delete('/{lead}', [LeadController::class, 'destroy']);
    Route::post('/{lead}/activities', [LeadController::class, 'addActivity']);
    Route::get('/{lead}/match-properties', [LeadController::class, 'matchProperties']);
});

// Property routes
Route::prefix('properties')->group(function () {
    Route::get('/stats', [PropertyController::class, 'stats']);
    Route::get('/featured', [PropertyController::class, 'featured']);
    Route::get('/', [PropertyController::class, 'index']);
    Route::post('/', [PropertyController::class, 'store']);
    Route::get('/{property}', [PropertyController::class, 'show']);
    Route::put('/{property}', [PropertyController::class, 'update']);
    Route::delete('/{property}', [PropertyController::class, 'destroy']);
});

// User info (for authenticated users)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

