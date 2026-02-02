<?php

use App\Http\Controllers\LeadController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\N8nWebhookController;
use App\Http\Controllers\AnalyticsController;
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
    Route::get('/{lead}/score-breakdown', [LeadController::class, 'scoreBreakdown']);
    Route::post('/{lead}/recalculate-score', [LeadController::class, 'recalculateScore']);
    Route::post('/{lead}/generate-message', [LeadController::class, 'generateMessage']);
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

// n8n Webhook routes (for automation workflows)
Route::prefix('webhooks/n8n')->group(function () {
    Route::post('/leads', [N8nWebhookController::class, 'createLead']);
    Route::post('/leads/{lead}/status', [N8nWebhookController::class, 'updateLeadStatus']);
    Route::post('/leads/{lead}/activity', [N8nWebhookController::class, 'logActivity']);
    Route::get('/leads/process', [N8nWebhookController::class, 'getLeadsForProcessing']);
});

// Analytics routes
Route::prefix('analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/funnel', [AnalyticsController::class, 'leadFunnel']);
    Route::get('/sources', [AnalyticsController::class, 'sourcePerformance']);
    Route::get('/trends', [AnalyticsController::class, 'timeTrends']);
});

// User info (for authenticated users)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

