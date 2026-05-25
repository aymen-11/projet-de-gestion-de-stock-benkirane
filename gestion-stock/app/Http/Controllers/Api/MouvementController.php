<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Alerte;
use App\Models\Mouvement;
use App\Models\User;
use App\Notifications\StockAlertNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class MouvementController extends Controller
{
    public function index(Request $request)
    {
        $query = Mouvement::with('article', 'fournisseur', 'user')
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->article_id, fn($q, $id) => $q->where('article_id', $id))
            ->when($request->date_debut, fn($q, $d) => $q->whereDate('date_mouvement', '>=', $d))
            ->when($request->date_fin, fn($q, $d) => $q->whereDate('date_mouvement', '<=', $d))
            ->orderByDesc('created_at');

        return $query->paginate($request->per_page ?? 20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'article_id'         => 'required|exists:articles,id',
            'type'               => 'required|in:entree,sortie',
            'quantite'           => 'required|integer|min:1',
            'motif'              => 'required|string',
            'reference_document' => 'required_if:type,entree|nullable|string',
            'fournisseur_id'     => 'required_if:type,entree|nullable|exists:fournisseurs,id',
            'destinataire'       => 'required_if:type,sortie|nullable|string',
            'date_mouvement'     => 'required|date',
            'notes'              => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $article = Article::lockForUpdate()->findOrFail($data['article_id']);

            // Validate sufficient stock for sorties
            if ($data['type'] === 'sortie' && $article->stock_actuel < $data['quantite']) {
                return response()->json([
                    'message' => 'Stock insuffisant.',
                    'stock_disponible' => $article->stock_actuel,
                ], 422);
            }

            $stockAvant = $article->stock_actuel;
            $stockApres = $data['type'] === 'entree'
                ? $stockAvant + $data['quantite']
                : $stockAvant - $data['quantite'];

            // Create movement record
            $mouvement = Mouvement::create([
                ...$data,
                'stock_avant' => $stockAvant,
                'stock_apres' => $stockApres,
                'user_id'     => $request->user()->id,
            ]);

            // Update article stock
            $article->update(['stock_actuel' => $stockApres]);

            // Generate alerts if needed
            $users = User::whereIn('role', ['admin', 'responsable', 'magasinier'])->get();

            if ($stockApres <= 0) {
                Notification::send($users, new StockAlertNotification(
                    $article->id,
                    'critique',
                    "Rupture de stock : 0 unité (min: {$article->stock_min})"
                ));
            } elseif ($stockApres <= $article->stock_min) {
                Notification::send($users, new StockAlertNotification(
                    $article->id,
                    'critique',
                    "Stock critique : {$stockApres} unités restantes (min: {$article->stock_min})"
                ));
            } elseif ($stockApres <= $article->stock_min * 1.2) {
                Notification::send($users, new StockAlertNotification(
                    $article->id,
                    'attention',
                    "Stock proche du seuil : {$stockApres} unités (min: {$article->stock_min})"
                ));
            }

            // Info alert for entry
            if ($data['type'] === 'entree') {
                Notification::send($users, new StockAlertNotification(
                    $article->id,
                    'info',
                    "Nouvelle entrée de stock : +{$data['quantite']} unités (nouveau stock: {$stockApres})"
                ));
            }

            return response()->json($mouvement->load('article', 'fournisseur', 'user'), 201);
        });
    }
}
