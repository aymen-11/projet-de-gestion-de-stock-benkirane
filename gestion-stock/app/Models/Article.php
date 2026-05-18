<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    protected $fillable = [
        'code', 'designation', 'description', 'categorie_id',
        'prix_unitaire', 'stock_actuel', 'stock_min', 'stock_max',
        'unite', 'image', 'actif',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'actif' => 'boolean',
    ];

    // Computed status attribute
    public function getStatutStockAttribute(): string
    {
        if ($this->stock_actuel <= 0) return 'Rupture';
        if ($this->stock_actuel <= $this->stock_min) return 'Critique';
        if ($this->stock_actuel <= ($this->stock_min * 1.2)) return 'Attention';
        return 'Normal';
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function fournisseurs(): BelongsToMany
    {
        return $this->belongsToMany(Fournisseur::class)
            ->withPivot('prix_achat', 'delai_livraison', 'reference_fournisseur', 'quantite_min_commande')
            ->withTimestamps();
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(Mouvement::class);
    }

    public function alertes(): HasMany
    {
        return $this->hasMany(Alerte::class);
    }
}
