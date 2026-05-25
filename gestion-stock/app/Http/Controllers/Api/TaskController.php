<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $tasks = Task::with('assignee:id,name,role', 'creator:id,name')
            ->when($request->statut, fn($q, $s) => $q->where('statut', $s))
            ->when($request->priorite, fn($q, $p) => $q->where('priorite', $p))
            ->orderByDesc('created_at')
            ->get();

        // Group by statut for Kanban view
        $kanban = [
            'todo'        => $tasks->where('statut', 'todo')->values(),
            'in_progress' => $tasks->where('statut', 'in_progress')->values(),
            'done'        => $tasks->where('statut', 'done')->values(),
        ];

        return response()->json($kanban);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'priorite'      => 'required|in:basse,normale,haute,urgente',
            'categorie'     => 'nullable|string',
            'assignee_id'   => 'nullable|exists:users,id',
            'date_echeance' => 'nullable|date',
        ]);

        $data['created_by'] = $request->user()->id;
        $data['statut'] = 'todo';

        $task = Task::create($data);
        return response()->json($task->load('assignee:id,name,role', 'creator:id,name'), 201);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'         => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'statut'        => 'sometimes|in:todo,in_progress,done',
            'priorite'      => 'sometimes|in:basse,normale,haute,urgente',
            'categorie'     => 'nullable|string',
            'assignee_id'   => 'nullable|exists:users,id',
            'date_echeance' => 'nullable|date',
        ]);

        $task->update($data);
        return response()->json($task->load('assignee:id,name,role', 'creator:id,name'));
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Tâche supprimée.']);
    }

    // Quick status move endpoint
    public function moveStatus(Request $request, Task $task)
    {
        $data = $request->validate([
            'statut' => 'required|in:todo,in_progress,done',
        ]);
        $task->update($data);
        return response()->json($task->load('assignee:id,name,role'));
    }

    // Get users for assignee dropdown
    public function users()
    {
        return response()->json(User::select('id', 'name', 'role')->get());
    }
}
