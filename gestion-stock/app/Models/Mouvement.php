<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mouvement extends Model
{
    protected $fillable = [
        'article_id', 'type', 'quantite', 'stock_avant', 'stock_apres',
        'motif', 'reference_document', 'fournisseur_id', 'destinataire',
        'date_mouvement', 'notes', 'user_id',
    ];

    protected $casts = [
        'date_mouvement' => 'date',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
