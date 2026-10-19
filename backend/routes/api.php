<?php

use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\FedaPayWebhookController;
use App\Http\Controllers\Api\KkiapayController;
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


// FedaPay previent ici quand un paiement est approuve, refuse ou annule.
// Pas d'auth:sanctum : la protection, c'est la signature verifiee dans le controleur.
Route::post('/webhooks/fedapay', [FedaPayWebhookController::class, 'handle']);


// Le front envoie ici le numero de transaction Kkiapay apres le paiement.
// Le controleur le verifie aupres de Kkiapay avant de marquer la commande payee.
Route::post('/orders/{order}/kkiapay', [KkiapayController::class, 'confirmar']);


// Kkiapay previent ici quand une transaction reussit ou echoue.
// Pas d'auth:sanctum : la protection, c'est le secret verifie dans le controleur.
Route::post('/webhooks/kkiapay', [KkiapayController::class, 'webhook']);


// Administration des commandes (admin connecte uniquement)
Route::get('/admin/orders', [AdminOrderController::class, 'index'])->middleware('auth:sanctum');
Route::get('/admin/orders/{order}', [AdminOrderController::class, 'show'])->middleware('auth:sanctum');

Route::post('/admin/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->middleware('auth:sanctum');

Route::get('/admin/stats', [AdminOrderController::class, 'stats'])->middleware('auth:sanctum');
