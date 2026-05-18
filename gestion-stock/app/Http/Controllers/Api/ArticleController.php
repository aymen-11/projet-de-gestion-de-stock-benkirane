<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Alerte;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with('categorie')
            ->when($request->search, fn($q, $s) => $q->where('designation', 'like', "%$s%")
                ->orWhere('code', 'like', "%$s%"))
            ->when($request->categorie_id, fn($q, $id) => $q->where('categorie_id', $id))
            ->when($request->statut, function ($q, $statut) {
                return match ($statut) {
                    'Critique'  => $q->whereColumn('stock_actuel', '<=', 'stock_min')->where('stock_actuel', '>', 0),
                    'Rupture'   => $q->where('stock_actuel', '<=', 0),
                    'Attention' => $q->whereRaw('stock_actuel <= stock_min * 1.2')->whereColumn('stock_actuel', '>', 'stock_min'),
                    default     => $q->whereRaw('stock_actuel > stock_min * 1.2'),
                };
            })
            ->orderBy('designation');

        return $query->paginate($request->per_page ?? 15)->through(function ($article) {
            $article->statut_stock = $article->statut_stock;
            return $article;
        });
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'          => 'required|string|unique:articles',
            'designation'   => 'required|string|max:255',
            'description'   => 'nullable|string',
            'categorie_id'  => 'nullable|exists:categories,id',
            'prix_unitaire' => 'required|numeric|min:0',
            'stock_actuel'  => 'integer|min:0',
            'stock_min'     => 'required|integer|min:0',
            'stock_max'     => 'nullable|integer|min:0',
            'unite'         => 'required|string',
            'fournisseur_ids' => 'nullable|array',
            'fournisseur_ids.*' => 'exists:fournisseurs,id',
        ]);

        $article = Article::create($data);

        if (!empty($data['fournisseur_ids'])) {
            $article->fournisseurs()->sync($data['fournisseur_ids']);
        }

        $this->checkAndCreateAlerte($article);

        return response()->json($article->load('categorie', 'fournisseurs'), 201);
    }

    public function show(Article $article)
    {
        return response()->json($article->load('categorie', 'fournisseurs', 'mouvements.user'));
    }

    public function update(Request $request, Article $article)
    {
        $data = $request->validate([
            'code'          => 'required|string|unique:articles,code,' . $article->id,
            'designation'   => 'required|string|max:255',
            'description'   => 'nullable|string',
            'categorie_id'  => 'nullable|exists:categories,id',
            'prix_unitaire' => 'required|numeric|min:0',
            'stock_min'     => 'required|integer|min:0',
            'stock_max'     => 'nullable|integer|min:0',
            'unite'         => 'required|string',
            'actif'         => 'boolean',
            'fournisseur_ids' => 'nullable|array',
            'fournisseur_ids.*' => 'exists:fournisseurs,id',
        ]);

        $article->update($data);

        if (isset($data['fournisseur_ids'])) {
            $article->fournisseurs()->sync($data['fournisseur_ids']);
        }

        $this->checkAndCreateAlerte($article);

        return response()->json($article->load('categorie', 'fournisseurs'));
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return response()->json(['message' => 'Article supprimé.']);
    }

    private function checkAndCreateAlerte(Article $article): void
    {
        if ($article->stock_actuel <= 0) {
            Alerte::create([
                'article_id' => $article->id,
                'type'       => 'critique',
                'message'    => "Rupture de stock : 0 unité (min: {$article->stock_min})",
            ]);
        } elseif ($article->stock_actuel <= $article->stock_min) {
            Alerte::create([
                'article_id' => $article->id,
                'type'       => 'critique',
                'message'    => "Stock critique : {$article->stock_actuel} unités restantes (min: {$article->stock_min})",
            ]);
        } elseif ($article->stock_actuel <= $article->stock_min * 1.2) {
            Alerte::create([
                'article_id' => $article->id,
                'type'       => 'attention',
                'message'    => "Stock proche du seuil : {$article->stock_actuel} unités restantes (min: {$article->stock_min})",
            ]);
        }
    }
}
