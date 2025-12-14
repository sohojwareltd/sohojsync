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
        
        // Get tasks based on user role
        $query = Task::query();
        
        if ($user->role === 'admin') {
            // Admin sees all tasks
            $query->with(['project', 'assignedUsers']);
        } elseif ($user->role === 'project_manager') {
            // PM sees tasks from projects they manage
            $query->whereHas('project', function ($q) use ($user) {
                $q->where('project_manager_id', $user->id);
            })->with(['project', 'assignedUsers']);
        } elseif ($user->role === 'developer') {
            // Developer sees ALL tasks from projects where they are members
            // (not just tasks explicitly assigned to them)
            $query->whereHas('project.members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['project', 'assignedUsers']);
            
            // Debug logging
            \Log::info('Developer Tasks Query', [
                'user_id' => $user->id,
                'user_role' => $user->role,
            ]);
        } elseif ($user->role === 'client') {
            // Client sees tasks from their projects
            $query->whereHas('project', function ($q) use ($user) {
                $q->where('client_id', $user->id);
            })->with(['project', 'assignedUsers']);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();
        
        if ($user->role === 'developer') {
            \Log::info('Developer Tasks Result', [
                'user_id' => $user->id,
                'task_count' => $tasks->count(),
            ]);
        }

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
        
        $query = Task::where('id', $id);
        
        if ($user->role === 'admin') {
            // Admin can see any task
            $query->with(['project', 'assignedUsers']);
        } elseif ($user->role === 'project_manager') {
            // PM can see tasks from projects they manage
            $query->whereHas('project', function ($q) use ($user) {
                $q->where('project_manager_id', $user->id);
            })->with(['project', 'assignedUsers']);
        } elseif ($user->role === 'developer') {
            // Developer can see tasks from projects where they are members
            $query->whereHas('project.members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['project', 'assignedUsers']);
        } elseif ($user->role === 'client') {
            // Client can see tasks from their projects
            $query->whereHas('project', function ($q) use ($user) {
                $q->where('client_id', $user->id);
            })->with(['project', 'assignedUsers']);
        }

        $task = $query->firstOrFail();

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

