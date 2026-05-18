<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\LigneCommande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function index(Request $request)
    {
        $query = Commande::with('fournisseur', 'user')
            ->withCount('lignes')
            ->when($request->statut && $request->statut !== 'Tous', fn($q, $s) => $q->where('statut', $s))
            ->when($request->search, fn($q, $s) => $q->where('reference', 'like', "%$s%")
                ->orWhereHas('fournisseur', fn($q2) => $q2->where('nom', 'like', "%$s%")))
            ->orderByDesc('date_commande');

        return $query->paginate($request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'fournisseur_id'         => 'nullable|exists:fournisseurs,id',
            'date_commande'          => 'required|date',
            'date_livraison_prevue'  => 'nullable|date',
            'notes'                  => 'nullable|string',
            'lignes'                 => 'required|array|min:1',
            'lignes.*.article_id'    => 'required|exists:articles,id',
            'lignes.*.quantite'      => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $commande = Commande::create([
                'fournisseur_id'        => $data['fournisseur_id'] ?? null,
                'date_commande'         => $data['date_commande'],
                'date_livraison_prevue' => $data['date_livraison_prevue'] ?? null,
                'notes'                 => $data['notes'] ?? null,
                'user_id'               => $request->user()->id,
            ]);

            $total = 0;
            foreach ($data['lignes'] as $ligne) {
                $lineTotal = $ligne['quantite'] * $ligne['prix_unitaire'];
                $total += $lineTotal;
                LigneCommande::create([
                    'commande_id'   => $commande->id,
                    'article_id'    => $ligne['article_id'],
                    'quantite'      => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                ]);
            }

            $commande->update(['total' => $total]);

            return response()->json($commande->load('fournisseur', 'lignes.article'), 201);
        });
    }

    public function show(Commande $commande)
    {
        return response()->json($commande->load('fournisseur', 'lignes.article', 'user'));
    }

    public function update(Request $request, Commande $commande)
    {
        $data = $request->validate([
            'statut'                => 'in:Brouillon,Envoyé,En attente,Reçu,Annulé',
            'fournisseur_id'        => 'nullable|exists:fournisseurs,id',
            'date_commande'         => 'date',
            'date_livraison_prevue' => 'nullable|date',
            'notes'                 => 'nullable|string',
        ]);

        $commande->update($data);
        return response()->json($commande->load('fournisseur', 'lignes.article'));
    }

    public function destroy(Commande $commande)
    {
        if ($commande->statut !== 'Brouillon') {
            return response()->json(['message' => 'Seuls les bons en brouillon peuvent être supprimés.'], 422);
        }
        $commande->delete();
        return response()->json(['message' => 'Commande supprimée.']);
    }
}
