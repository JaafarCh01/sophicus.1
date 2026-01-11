<?php

use App\Http\Controllers\LeadController;
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
});

// User info (for authenticated users)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
