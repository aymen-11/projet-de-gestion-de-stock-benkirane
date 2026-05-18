<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Mouvement;
use App\Models\Commande;
use App\Models\Fournisseur;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        $kpis = [
            'total_articles'        => Article::count(),
            'mouvements_aujourdhui' => Mouvement::whereDate('date_mouvement', $today)->count(),
            'alertes_actives'       => \App\Models\Alerte::where('lue', false)->count(),
            'commandes_en_attente'  => Commande::whereIn('statut', ['En attente', 'Envoyé'])->count(),
        ];

        $graphiqueSemaine = Mouvement::select('date_mouvement', 'type', DB::raw('SUM(quantite) as total'))
            ->whereDate('date_mouvement', '>=', now()->subDays(6)->toDateString())
            ->groupBy('date_mouvement', 'type')
            ->orderBy('date_mouvement')
            ->get()
            ->groupBy('date_mouvement')
            ->map(fn($g, $d) => [
                'date' => $d,
                'entrees' => $g->where('type', 'entree')->sum('total'),
                'sorties' => $g->where('type', 'sortie')->sum('total'),
            ])->values();

        $stockCritique = Article::whereColumn('stock_actuel', '<=', 'stock_min')
            ->orderBy('stock_actuel')->take(5)->get()
            ->map(fn($a) => [
                'id' => $a->id, 'code' => $a->code,
                'designation' => $a->designation,
                'stock_actuel' => $a->stock_actuel,
                'stock_min' => $a->stock_min,
                'statut' => $a->statut_stock,
            ]);

        $recentsMouvements = Mouvement::with('article', 'user')
            ->orderByDesc('created_at')->take(5)->get();

        $parCategorie = Article::select('categorie_id', DB::raw('COUNT(*) as total'))
            ->with('categorie:id,nom')->whereNotNull('categorie_id')
            ->groupBy('categorie_id')->get()
            ->map(fn($a) => ['name' => $a->categorie?->nom ?? 'Autre', 'value' => $a->total]);

        return response()->json(compact('kpis', 'graphiqueSemaine', 'stockCritique', 'recentsMouvements', 'parCategorie'));
    }
}
