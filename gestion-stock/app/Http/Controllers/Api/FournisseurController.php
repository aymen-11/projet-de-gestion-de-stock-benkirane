<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    public function index(Request $request)
    {
        $query = Fournisseur::withCount('articles')
            ->when($request->search, fn($q, $s) => $q->where('nom', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%"))
            ->when($request->statut, fn($q, $s) => $q->where('statut', $s))
            ->orderBy('nom');

        return $request->all ? $query->get() : $query->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'       => 'required|string|max:255',
            'email'     => 'nullable|email',
            'telephone' => 'nullable|string',
            'adresse'   => 'nullable|string',
            'ville'     => 'nullable|string',
            'pays'      => 'nullable|string',
            'statut'    => 'in:Actif,Inactif',
            'rating'    => 'integer|min:1|max:5',
            'notes'     => 'nullable|string',
        ]);
        return response()->json(Fournisseur::create($data), 201);
    }

    public function show(Fournisseur $fournisseur)
    {
        return response()->json($fournisseur->load('articles', 'commandes'));
    }

    public function update(Request $request, Fournisseur $fournisseur)
    {
        $data = $request->validate([
            'nom'       => 'required|string|max:255',
            'email'     => 'nullable|email',
            'telephone' => 'nullable|string',
            'adresse'   => 'nullable|string',
            'ville'     => 'nullable|string',
            'pays'      => 'nullable|string',
            'statut'    => 'in:Actif,Inactif',
            'rating'    => 'integer|min:1|max:5',
            'notes'     => 'nullable|string',
        ]);
        $fournisseur->update($data);
        return response()->json($fournisseur);
    }

    public function destroy(Fournisseur $fournisseur)
    {
        $fournisseur->delete();
        return response()->json(['message' => 'Fournisseur supprimé.']);
    }
}
