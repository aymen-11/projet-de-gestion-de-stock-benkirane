<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    protected $fillable = [
        'nom', 'email', 'telephone', 'adresse', 'siret',
        'ville', 'pays', 'statut', 'rating', 'notes',
    ];

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class)
            ->withPivot('prix_achat', 'delai_livraison', 'reference_fournisseur', 'quantite_min_commande')
            ->withTimestamps();
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(Mouvement::class);
    }
}
