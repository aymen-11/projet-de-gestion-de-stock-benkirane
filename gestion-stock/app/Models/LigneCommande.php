<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneCommande extends Model
{
    protected $table = 'lignes_commande';

    protected $fillable = [
        'commande_id', 'article_id', 'quantite', 'prix_unitaire',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
