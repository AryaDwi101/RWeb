<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ---------- Publik ----------
Route::post('/login', [AuthController::class, 'login']);

// ---------- Terproteksi (butuh token) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Data bersama (semua peran boleh baca)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/tables', [TableController::class, 'index']);
    Route::get('/sessions/{session}', [SessionController::class, 'show']);

    // PELAYAN — buka meja & catat pesanan
    Route::middleware('role:pelayan,admin')->group(function () {
        Route::post('/sessions', [SessionController::class, 'open']);
        Route::post('/sessions/{session}/orders', [OrderController::class, 'store']);
        Route::post('/sessions/{session}/close', [SessionController::class, 'close']);
    });

    // KOKI — papan dapur
    Route::middleware('role:koki,admin')->group(function () {
        Route::get('/kitchen', [OrderController::class, 'kitchen']);
        Route::patch('/kitchen/items/{item}', [OrderController::class, 'updateItemStatus']);
    });

    // KASIR — tagihan & pembayaran
    Route::middleware('role:kasir,admin')->group(function () {
        Route::get('/bills', [PaymentController::class, 'bills']);
        Route::post('/sessions/{session}/pay', [PaymentController::class, 'pay']);
    });

    // ADMIN / MANAJER — master data & laporan
    Route::middleware('role:admin')->group(function () {
        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::apiResource('users', UserController::class);
        Route::apiResource('products', ProductController::class)->except('index');
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('tables', TableController::class)->except(['index', 'show']);
    });
});
