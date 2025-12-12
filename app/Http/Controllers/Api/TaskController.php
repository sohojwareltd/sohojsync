<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;

/**
 * TaskController
 * 
 * Handles task-related API operations
 */
class TaskController extends Controller
{
    /**
     * Get all tasks for the authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get tasks from projects owned by the user or assigned to the user
        $query = Task::whereHas('project', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })->orWhere('assigned_to', $user->id);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->with('project')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }

    /**
     * Get a single task
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $task = Task::whereHas('project', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })->orWhere('assigned_to', $user->id)
            ->with('project')
            ->findOrFail($id);

        return response()->json($task);
    }

    /**
     * Create a new task
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:open,done',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        // Verify the user owns the project
        $project = Project::where('id', $validated['project_id'])
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

        $task = Task::create($validated);

        return response()->json($task->load('project'), 201);
    }

    /**
     * Update a task
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $task = Task::whereHas('project', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })->findOrFail($id);

        $validated = $request->validate([
            'project_id' => 'sometimes|required|exists:projects,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:open,done',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $task->update($validated);

        return response()->json($task->load('project'));
    }

    /**
     * Delete a task
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $task = Task::whereHas('project', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })->findOrFail($id);

        $task->delete();

        return response()->noContent();
    }

    /**
     * Get tasks for a specific user
     * 
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserTasks($userId)
    {
        $tasks = Task::where('assigned_to', $userId)
            ->with(['project', 'assignments.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $tasks
        ]);
    }
}

