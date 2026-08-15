<?php

use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', fn () => ['message' => 'pong',]);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/payment-methods', [PaymentMethodController::class, 'index']);

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{order}', [OrderController::class, 'show']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

Route::get('/admin/products', [AdminProductController::class, 'index'])->middleware('auth:sanctum');
Route::post('/admin/products', [AdminProductController::class, 'store'])->middleware('auth:sanctum');
Route::post('/admin/products/{id}', [AdminProductController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/admin/products/{id}', [AdminProductController::class, 'destroy'])->middleware('auth:sanctum');

