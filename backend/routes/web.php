<?php

use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'status' => 'ok',
]));