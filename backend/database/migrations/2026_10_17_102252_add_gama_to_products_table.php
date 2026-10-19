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
        Schema::table('products', function (Blueprint $table) {
            // La gamme du produit : 'SANDY NATUR' ou 'BELLA ECUATOGUINEANA BIO'.
            // nullable : les produits deja en base n'en ont pas encore.
            $table->string('gama')->nullable()->after('category_id');

            // Index : la boutique filtrera souvent sur cette colonne
            $table->index('gama');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // L'index d'abord, sinon MariaDB refuse de supprimer la colonne
            $table->dropIndex(['gama']);
            $table->dropColumn('gama');
        });
    }

};
