<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MLD: table ARTICLE_FOURNISSEUR enrichie
        Schema::create('article_fournisseur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->cascadeOnDelete();
            $table->decimal('prix_achat', 10, 2)->nullable();              // MLD: prix_achat
            $table->integer('delai_livraison')->nullable();                // MLD: délai_livraison (jours)
            $table->string('reference_fournisseur')->nullable();           // MLD: référence_fournisseur
            $table->integer('quantite_min_commande')->default(1);          // MLD: quantité_min_commande
            $table->timestamps();

            $table->unique(['article_id', 'fournisseur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_fournisseur');
    }
};
