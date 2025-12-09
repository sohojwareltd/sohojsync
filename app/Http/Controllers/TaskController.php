<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\TaskAssignment;
use App\Models\Notification;
use App\Models\WorkflowStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    /**
     * Get tasks for a project.
     */
    public function index(Request $request, $project)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        $query = $project->tasks()
            ->with(['workflowStatus', 'assignedUsers', 'project']);

        // Filter by workflow status
        if ($request->has('status_id')) {
            $query->where('workflow_status_id', $request->status_id);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->assignedTo($request->assigned_to);
        }

        // Search by title/description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->orderBy('order')->get();

        return response()->json($tasks);
    }

    /**
     * Store a new task.
     */
    public function store(Request $request, $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'labels' => 'nullable|array',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            // Get project by ID
            $projectId = is_object($project) ? $project->id : $project;
            $project = Project::findOrFail($projectId);

            // Get default workflow status
            $defaultStatus = WorkflowStatus::where('project_id', $project->id)
                ->where('is_default', true)
                ->first();

            if (!$defaultStatus) {
                // If no default status, create default workflow statuses
                $defaultStatuses = [
                    [
                        'project_id' => $project->id,
                        'name' => 'New Task',
                        'slug' => 'new_task',
                        'color' => '#6B7280',
                        'order' => 0,
                        'is_default' => true,
                        'is_completed' => false,
                        'description' => 'Newly created tasks',
                    ],
                    [
                        'project_id' => $project->id,
                        'name' => 'Requirements Ready',
                        'slug' => 'requirements_ready',
                        'color' => '#8B5CF6',
                        'order' => 1,
                        'is_default' => false,
                        'is_completed' => false,
                        'description' => 'Requirements are complete and ready to start',
                    ],
                    [
                        'project_id' => $project->id,
                        'name' => 'In Progress',
                        'slug' => 'in_progress',
                        'color' => '#3B82F6',
                        'order' => 2,
                        'is_default' => false,
                        'is_completed' => false,
                        'description' => 'Currently being worked on',
                    ],
                    [
                        'project_id' => $project->id,
                        'name' => 'Testing',
                        'slug' => 'testing',
                        'color' => '#F59E0B',
                        'order' => 3,
                        'is_default' => false,
                        'is_completed' => false,
                        'description' => 'Under testing and quality assurance',
                    ],
                    [
                        'project_id' => $project->id,
                        'name' => 'Ready for Release',
                        'slug' => 'ready_for_release',
                        'color' => '#10B981',
                        'order' => 4,
                        'is_default' => false,
                        'is_completed' => false,
                        'description' => 'Tested and ready to be released',
                    ],
                    [
                        'project_id' => $project->id,
                        'name' => 'Completed',
                        'slug' => 'completed',
                        'color' => '#059669',
                        'order' => 5,
                        'is_default' => false,
                        'is_completed' => true,
                        'description' => 'Task is complete',
                    ],
                ];

                foreach ($defaultStatuses as $statusData) {
                    WorkflowStatus::create($statusData);
                }
                
                // Get the newly created default status
                $defaultStatus = WorkflowStatus::where('project_id', $project->id)
                    ->where('is_default', true)
                    ->first();
            }

            // Get the next order number for this status
            $maxOrder = Task::where('workflow_status_id', $defaultStatus->id)->max('order') ?? -1;

            $task = Task::create([
                'project_id' => $project->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'workflow_status_id' => $defaultStatus->id,
                'priority' => $validated['priority'],
                'start_date' => $validated['start_date'] ?? null,
                'due_date' => $validated['due_date'] ?? null,
                'estimated_hours' => $validated['estimated_hours'] ?? null,
                'labels' => $validated['labels'] ?? null,
                'order' => $maxOrder + 1,
                'status' => 'open', // Legacy field
            ]);

            // Assign users
            $usersToAssign = $validated['assigned_users'] ?? [];
            
            // If no users assigned, auto-assign all project developers, managers, and clients
            if (empty($usersToAssign)) {
                $usersToAssign = $project->members()
                    ->whereIn('role', ['developer', 'manager', 'client'])
                    ->pluck('user_id')
                    ->toArray();
            }
            
            if (!empty($usersToAssign)) {
                foreach ($usersToAssign as $userId) {
                    TaskAssignment::create([
                        'task_id' => $task->id,
                        'user_id' => $userId,
                        'assigned_at' => now(),
                        'assigned_by' => Auth::id(),
                    ]);

                    // Create notification for assigned user
                    Notification::create([
                        'user_id' => $userId,
                        'type' => 'task_assigned',
                        'title' => 'New Task Assigned',
                        'message' => "You have been assigned to task: {$task->title}",
                        'data' => json_encode([
                            'task_id' => $task->id,
                            'project_id' => $project->id,
                        ]),
                    ]);
                }
            }

            DB::commit();

            return response()->json($task->load(['workflowStatus', 'assignedUsers']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create task: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update a task.
     */
    public function update(Request $request, $project, $task)
    {
        $projectId = is_object($project) ? $project->id : intval($project);
        $project = Project::findOrFail($projectId);
        
        $taskId = is_object($task) ? $task->id : intval($task);
        $task = Task::findOrFail($taskId);
        
        if (intval($task->project_id) !== intval($project->id)) {
            return response()->json([
                'error' => 'Task does not belong to this project',
                'debug' => [
                    'task_project_id' => $task->project_id,
                    'project_id' => $project->id,
                    'route_project' => $projectId,
                    'route_task' => $taskId
                ]
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'actual_hours' => 'nullable|numeric|min:0',
            'labels' => 'nullable|array',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            $task->update($validated);

            // Update assignments if provided
            if (isset($validated['assigned_users'])) {
                // Get current assignments
                $currentAssignments = $task->assignedUsers->pluck('id')->toArray();
                $newAssignments = $validated['assigned_users'];

                // Remove old assignments
                $toRemove = array_diff($currentAssignments, $newAssignments);
                TaskAssignment::where('task_id', $task->id)
                    ->whereIn('user_id', $toRemove)
                    ->delete();

                // Add new assignments
                $toAdd = array_diff($newAssignments, $currentAssignments);
                foreach ($toAdd as $userId) {
                    TaskAssignment::create([
                        'task_id' => $task->id,
                        'user_id' => $userId,
                        'assigned_at' => now(),
                        'assigned_by' => Auth::id(),
                    ]);

                    // Create notification
                    Notification::create([
                        'user_id' => $userId,
                        'type' => 'task_assigned',
                        'title' => 'Task Assigned',
                        'message' => "You have been assigned to task: {$task->title}",
                        'data' => json_encode([
                            'task_id' => $task->id,
                            'project_id' => $project->id,
                        ]),
                    ]);
                }
            }

            DB::commit();

            return response()->json($task->load(['workflowStatus', 'assignedUsers']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update task: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a task.
     */
    public function destroy($project, $task)
    {
        $projectId = is_object($project) ? $project->id : intval($project);
        $project = Project::findOrFail($projectId);
        
        $taskId = is_object($task) ? $task->id : intval($task);
        $task = Task::findOrFail($taskId);
        
        if (intval($task->project_id) !== intval($project->id)) {
            return response()->json(['error' => 'Task does not belong to this project'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    /**
     * Update task workflow status (for drag and drop).
     */
    public function updateStatus(Request $request, $project, $task)
    {
        $projectId = is_object($project) ? $project->id : intval($project);
        $project = Project::findOrFail($projectId);
        
        $taskId = is_object($task) ? $task->id : intval($task);
        $task = Task::findOrFail($taskId);
        
        if (intval($task->project_id) !== intval($project->id)) {
            return response()->json(['error' => 'Task does not belong to this project'], 403);
        }

        $validated = $request->validate([
            'workflow_status_id' => 'required|exists:workflow_statuses,id',
            'order' => 'nullable|integer',
        ]);

        // Verify status belongs to this project
        $status = $project->workflowStatuses()->find($validated['workflow_status_id']);
        if (!$status) {
            return response()->json(['error' => 'Status does not belong to this project'], 400);
        }

        $task->update([
            'workflow_status_id' => $validated['workflow_status_id'],
            'order' => $validated['order'] ?? $task->order,
        ]);

        // Update status field based on is_completed
        if ($status->is_completed) {
            $task->update(['status' => 'done']);
        } else {
            $task->update(['status' => 'open']);
        }

        return response()->json($task->load(['workflowStatus', 'assignedUsers']));
    }

    /**
     * Reorder tasks within a status.
     */
    public function reorder(Request $request, $project)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        $validated = $request->validate([
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|exists:tasks,id',
            'tasks.*.order' => 'required|integer',
            'tasks.*.workflow_status_id' => 'required|exists:workflow_statuses,id',
        ]);

        foreach ($validated['tasks'] as $taskData) {
            Task::where('id', $taskData['id'])
                ->where('project_id', $project->id)
                ->update([
                    'order' => $taskData['order'],
                    'workflow_status_id' => $taskData['workflow_status_id'],
                ]);
        }

        return response()->json(['message' => 'Tasks reordered successfully']);
    }
}
