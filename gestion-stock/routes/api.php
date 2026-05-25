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
use App\Http\Controllers\Api\UserController;

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

    // Dashboard - accessible by internal staff
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('role:admin,responsable,magasinier,fournisseur');

    // Articles
    Route::get('articles', [ArticleController::class, 'index']);
    Route::get('articles/{article}', [ArticleController::class, 'show']);
    Route::middleware('role:admin,responsable')->group(function () {
        Route::post('articles', [ArticleController::class, 'store']);
        Route::put('articles/{article}', [ArticleController::class, 'update']);
        Route::delete('articles/{article}', [ArticleController::class, 'destroy']);
    });

    // Categories
    Route::get('categories', [CategorieController::class, 'index']);
    Route::middleware('role:admin,responsable')->group(function () {
        Route::post('categories', [CategorieController::class, 'store']);
        Route::put('categories/{categorie}', [CategorieController::class, 'update']);
        Route::delete('categories/{categorie}', [CategorieController::class, 'destroy']);
    });

    // Fournisseurs
    Route::middleware('role:admin,responsable')->group(function () {
        Route::apiResource('fournisseurs', FournisseurController::class);
    });

    // Commandes
    Route::middleware('role:admin,responsable,fournisseur')->group(function () {
        Route::get('commandes', [CommandeController::class, 'index']);
        Route::get('commandes/{commande}', [CommandeController::class, 'show']);
        Route::put('commandes/{commande}', [CommandeController::class, 'update']);
    });
    Route::middleware('role:admin,responsable')->group(function () {
        Route::post('commandes', [CommandeController::class, 'store']);
        Route::delete('commandes/{commande}', [CommandeController::class, 'destroy']);
    });

    // Mouvements
    Route::middleware('role:admin,responsable,magasinier')->group(function () {
        Route::get('/mouvements', [MouvementController::class, 'index']);
        Route::post('/mouvements', [MouvementController::class, 'store']);
    });

    // Alertes
    Route::middleware('role:admin,responsable,magasinier')->group(function () {
        Route::get('/alertes', [AlerteController::class, 'index']);
        Route::get('/alertes/counts', [AlerteController::class, 'counts']);
        Route::put('/alertes/{alerte}/marquer-lue', [AlerteController::class, 'marquerLue']);
        Route::put('/alertes/marquer-toutes-lues', [AlerteController::class, 'marquerToutesLues']);
    });

    // Rapports
    Route::middleware('role:admin,responsable')->group(function () {
        Route::get('/rapports', [RapportController::class, 'index']);
    });

    // Utilisateurs
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });
});
