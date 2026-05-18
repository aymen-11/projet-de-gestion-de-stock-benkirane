<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index()
    {
        return response()->json(Categorie::withCount('articles')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
        ]);
        return response()->json(Categorie::create($data), 201);
    }

    public function update(Request $request, Categorie $categorie)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:255|unique:categories,nom,' . $categorie->id,
            'description' => 'nullable|string',
        ]);
        $categorie->update($data);
        return response()->json($categorie);
    }

    public function destroy(Categorie $categorie)
    {
        $categorie->delete();
        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
