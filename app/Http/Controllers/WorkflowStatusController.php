<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WorkflowStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkflowStatusController extends Controller
{
    /**
     * Get workflow statuses for a project.
     */
    public function index($project)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        $statuses = $project->workflowStatuses()->ordered()->get();
        return response()->json($statuses);
    }

    /**
     * Store a new workflow status.
     */
    public function store(Request $request, $project)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        // Generate slug from name
        $slug = Str::slug($validated['name']);
        
        // Get the order number (use provided or next available)
        $order = $validated['order'] ?? ($project->workflowStatuses()->max('order') ?? -1) + 1;

        $status = WorkflowStatus::create([
            'project_id' => $project->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'],
            'order' => $order,
            'is_default' => false,
            'is_completed' => false,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json($status, 201);
    }

    /**
     * Update a workflow status.
     */
    public function update(Request $request, $project, $statusId)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        // Find the status that belongs to this project
        $status = WorkflowStatus::where('id', $statusId)
            ->where('project_id', $project->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'color' => ['sometimes', 'required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'description' => 'nullable|string',
            'is_completed' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $status->update($validated);

        return response()->json($status);
    }

    /**
     * Delete a workflow status.
     */
    public function destroy($project, $statusId)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        // Find the status that belongs to this project
        $status = WorkflowStatus::where('id', $statusId)
            ->where('project_id', $project->id)
            ->firstOrFail();

        // Cannot delete if it has tasks
        if ($status->tasks()->count() > 0) {
            return response()->json(['error' => 'Cannot delete status with tasks. Move tasks to another status first.'], 400);
        }

        // If deleting default status, set another status as default
        if ($status->is_default) {
            $newDefault = WorkflowStatus::where('project_id', $project->id)
                ->where('id', '!=', $status->id)
                ->orderBy('order')
                ->first();
                
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        $status->delete();

        return response()->json(['message' => 'Status deleted successfully']);
    }

    /**
     * Reorder workflow statuses.
     */
    public function reorder(Request $request, $project)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        $validated = $request->validate([
            'statuses' => 'required|array',
            'statuses.*.id' => 'required|exists:workflow_statuses,id',
            'statuses.*.order' => 'required|integer',
        ]);

        foreach ($validated['statuses'] as $statusData) {
            WorkflowStatus::where('id', $statusData['id'])
                ->where('project_id', $project->id)
                ->update(['order' => $statusData['order']]);
        }

        return response()->json(['message' => 'Statuses reordered successfully']);
    }

    /**
     * Set a status as default.
     */
    public function setDefault($project, WorkflowStatus $status)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        // Route model binding with resolveRouteBinding ensures status belongs to project

        // Remove default from all other statuses
        WorkflowStatus::where('project_id', $project->id)
            ->where('id', '!=', $status->id)
            ->update(['is_default' => false]);

        // Set this as default
        $status->update(['is_default' => true]);

        return response()->json($status);
    }
}
