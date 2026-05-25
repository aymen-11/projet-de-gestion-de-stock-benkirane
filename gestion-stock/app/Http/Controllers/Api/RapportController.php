<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Mouvement;
use App\Models\Fournisseur;
use App\Models\Alerte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        $mois = $request->mois ?? 6;

        $driver = DB::connection()->getDriverName();
        $dateFormat = $driver === 'sqlite' 
            ? "strftime('%Y-%m', date_mouvement)" 
            : "DATE_FORMAT(date_mouvement, '%Y-%m')";

        $mouvementsMensuels = Mouvement::select(
                DB::raw("$dateFormat as mois"),
                'type',
                DB::raw('SUM(quantite) as total')
            )
            ->whereDate('date_mouvement', '>=', now()->subMonths($mois)->startOfMonth())
            ->groupBy(DB::raw($dateFormat), 'type')
            ->orderBy(DB::raw($dateFormat))
            ->get()
            ->groupBy('mois')
            ->map(fn($g, $m) => [
                'mois'    => $m,
                'entrees' => $g->where('type', 'entree')->sum('total'),
                'sorties' => $g->where('type', 'sortie')->sum('total'),
            ])->values();

        $valeurTotaleStock = Article::where('actif', true)
            ->selectRaw('SUM(stock_actuel * prix_unitaire) as valeur')
            ->value('valeur') ?? 0;

        $articlesEnRupture = Article::where('stock_actuel', '<=', 0)->where('actif', true)->count();

        $fournisseursActifs = Fournisseur::where('statut', 'Actif')->count();

        $topFournisseurs = Fournisseur::withCount('articles')
            ->orderByDesc('articles_count')->take(5)->get()
            ->map(fn($f) => ['name' => $f->nom, 'value' => $f->articles_count]);

        $rotationStock = DB::table('mouvements')
            ->where('type', 'sortie')
            ->whereDate('date_mouvement', '>=', now()->subMonths(1))
            ->sum('quantite');

        // Trigger alerts check
        $criticalArticles = Article::where('actif', true)->whereColumn('stock_actuel', '<=', 'stock_min')->get();
        foreach ($criticalArticles as $art) {
            $msg = $art->stock_actuel <= 0 
                ? "Rupture de stock détectée lors de l'analyse du rapport : 0 unité (min: {$art->stock_min})"
                : "Stock critique détecté lors de l'analyse du rapport : {$art->stock_actuel} unités (min: {$art->stock_min})";
            
            Alerte::firstOrCreate(
                [
                    'article_id' => $art->id,
                    'type' => 'critique',
                ],
                [
                    'message' => $msg
                ]
            );
        }

        return response()->json([
            'kpis' => [
                'valeur_totale_stock' => round($valeurTotaleStock, 2),
                'articles_en_rupture' => $articlesEnRupture,
                'fournisseurs_actifs' => $fournisseursActifs,
                'rotation_stock'      => $rotationStock,
            ],
            'mouvements_mensuels' => $mouvementsMensuels,
            'top_fournisseurs'    => $topFournisseurs,
        ]);
    }
}
