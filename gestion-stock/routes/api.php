<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\FournisseurController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\MouvementController;
use App\Http\Controllers\Api\AlerteController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RapportController;

// ── Public routes ──────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ── Protected routes (Sanctum) ─────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user/profile',  [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Articles
    Route::apiResource('articles', ArticleController::class);

    // Categories
    Route::apiResource('categories', CategorieController::class)->except(['show']);

    // Fournisseurs
    Route::apiResource('fournisseurs', FournisseurController::class);

    // Commandes
    Route::apiResource('commandes', CommandeController::class);

    // Mouvements
    Route::get('/mouvements', [MouvementController::class, 'index']);
    Route::post('/mouvements', [MouvementController::class, 'store']);

    // Alertes
    Route::get('/alertes', [AlerteController::class, 'index']);
    Route::get('/alertes/counts', [AlerteController::class, 'counts']);
    Route::put('/alertes/{alerte}/marquer-lue', [AlerteController::class, 'marquerLue']);
    Route::put('/alertes/marquer-toutes-lues', [AlerteController::class, 'marquerToutesLues']);

    // Rapports
    Route::get('/rapports', [RapportController::class, 'index']);
});
