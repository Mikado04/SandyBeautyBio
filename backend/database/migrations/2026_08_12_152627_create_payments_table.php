<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('driver');                              // bank_transfer, moneroo, FedaPay
            $table->string('external_reference')->nullable();      // n° de transaction du prestataire
            $table->unsignedInteger('amount');
            $table->string('status')->default('pending');
            $table->string('currency', 3)->default('XAF');
            $table->json('payload')->nullable();                   // réponse brute du prestataire
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
