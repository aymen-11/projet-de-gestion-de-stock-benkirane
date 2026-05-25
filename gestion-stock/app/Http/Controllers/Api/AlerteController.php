<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = $user->notifications();

        if ($request->type) {
            $query->where('data->type', $request->type);
        }

        if ($request->lue !== null) {
            if ($request->boolean('lue')) {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        $notifications = $query->paginate($request->per_page ?? 20);

        // Transform collection to match frontend expectations
        $notifications->getCollection()->transform(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? 'info',
                'message' => $notification->data['message'] ?? '',
                'category' => $notification->data['category'] ?? 'system',
                'article_id' => $notification->data['article_id'] ?? null,
                'commande_id' => $notification->data['commande_id'] ?? null,
                'lue' => $notification->read_at !== null,
                'created_at' => $notification->created_at,
                // On frontend we might need the actual Article if category='stock'
                // We'll load the article relation on the fly for stock alerts
                'article' => isset($notification->data['article_id']) ? \App\Models\Article::find($notification->data['article_id']) : null,
                'commande' => isset($notification->data['commande_id']) ? \App\Models\Commande::find($notification->data['commande_id']) : null,
            ];
        });

        return $notifications;
    }

    public function marquerLue(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    public function marquerToutesLues(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'Toutes les alertes sont marquées comme lues.']);
    }

    public function counts(Request $request)
    {
        $user = $request->user();
        
        $critique = $user->unreadNotifications()->where('data->type', 'critique')->count();
        $attention = $user->unreadNotifications()->where('data->type', 'attention')->count();
        $info = $user->unreadNotifications()->where('data->type', 'info')->count();

        return response()->json([
            'critique'  => $critique,
            'attention' => $attention,
            'info'      => $info,
            'total_non_lues' => $user->unreadNotifications()->count(),
        ]);
    }
}
