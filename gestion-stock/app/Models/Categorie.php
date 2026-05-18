<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    protected $fillable = ['nom', 'description'];

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
