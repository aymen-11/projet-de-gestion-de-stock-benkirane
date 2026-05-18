<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('designation');
            $table->text('description')->nullable();        // MCD: description
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->integer('stock_actuel')->default(0);
            $table->integer('stock_min')->default(0);
            $table->integer('stock_max')->nullable();
            $table->string('unite')->default('pcs');
            $table->string('image')->nullable();
            $table->foreignId('categorie_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
