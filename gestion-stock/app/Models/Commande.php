<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Commande extends Model
{
    protected $fillable = [
        'reference', 'fournisseur_id', 'date_commande',
        'date_livraison_prevue', 'statut', 'total', 'notes', 'user_id',
    ];

    protected $casts = [
        'date_commande' => 'date',
        'date_livraison_prevue' => 'date',
        'total' => 'decimal:2',
    ];

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function lignes(): HasMany
    {
        return $this->hasMany(LigneCommande::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Auto-generate reference before creating
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($commande) {
            if (!$commande->reference) {
                $year = now()->year;
                $count = static::whereYear('created_at', $year)->count() + 1;
                $commande->reference = 'BC-' . $year . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }
        });
    }
}
