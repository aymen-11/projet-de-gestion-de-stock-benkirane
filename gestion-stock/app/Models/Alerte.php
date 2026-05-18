<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alerte extends Model
{
    protected $fillable = ['article_id', 'type', 'message', 'lue'];

    protected $casts = ['lue' => 'boolean'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
