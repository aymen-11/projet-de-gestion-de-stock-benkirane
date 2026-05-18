<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    public function index(Request $request)
    {
        $query = Alerte::with('article')
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->lue !== null, fn($q) => $q->where('lue', $request->boolean('lue')))
            ->orderByDesc('created_at');

        return $query->paginate($request->per_page ?? 20);
    }

    public function marquerLue(Alerte $alerte)
    {
        $alerte->update(['lue' => true]);
        return response()->json($alerte);
    }

    public function marquerToutesLues()
    {
        Alerte::where('lue', false)->update(['lue' => true]);
        return response()->json(['message' => 'Toutes les alertes sont marquées comme lues.']);
    }

    public function counts()
    {
        return response()->json([
            'critique'  => Alerte::where('type', 'critique')->where('lue', false)->count(),
            'attention' => Alerte::where('type', 'attention')->where('lue', false)->count(),
            'info'      => Alerte::where('type', 'info')->where('lue', false)->count(),
            'total_non_lues' => Alerte::where('lue', false)->count(),
        ]);
    }
}
