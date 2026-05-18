<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('adresse')->nullable();         // MCD: adresse
            $table->string('siret')->nullable();           // MCD: SIRET
            $table->string('telephone')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('ville')->nullable();
            $table->string('pays')->default('Maroc');
            $table->integer('rating')->default(0);         // 0-5 étoiles
            $table->enum('statut', ['Actif', 'Inactif'])->default('Actif');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fournisseurs');
    }
};
