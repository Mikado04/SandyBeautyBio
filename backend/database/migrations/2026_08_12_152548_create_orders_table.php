<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->nullable();

            // Commande invitee : les coordonnees vivent sur la commande
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('customer_city');
            $table->text('customer_address');

            $table->string('status')->default('pending');  //pending|paid|shipped|delivered|cancelled
            $table->string('payment_method');  //bank_transfer|FedaPay
            $table->string('payment_status')->default('pending');  // pending|paid|failed
            $table->string('currency', 3)->default('XAF');
            $table->unsignedInteger('total');
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            });
            }
            
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
