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
            'color' => 'required|string|max:7',
            'description' => 'nullable|string',
        ]);

        // Generate slug from name
        $slug = Str::slug($validated['name']);
        
        // Get the next order number
        $maxOrder = $project->workflowStatuses()->max('order') ?? -1;

        $status = WorkflowStatus::create([
            'project_id' => $project->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'],
            'order' => $maxOrder + 1,
            'is_default' => false,
            'is_completed' => false,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json($status, 201);
    }

    /**
     * Update a workflow status.
     */
    public function update(Request $request, $project, WorkflowStatus $status)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        if ($status->project_id != $project->id) {
            return response()->json(['error' => 'Status does not belong to this project'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|required|string|max:7',
            'description' => 'nullable|string',
            'is_completed' => 'sometimes|boolean',
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
    public function destroy($project, WorkflowStatus $status)
    {
        $projectId = is_object($project) ? $project->id : $project;
        $project = Project::findOrFail($projectId);
        
        if ($status->project_id != $project->id) {
            return response()->json(['error' => 'Status does not belong to this project'], 403);
        }

        // Cannot delete if it's the default status or has tasks
        if ($status->is_default) {
            return response()->json(['error' => 'Cannot delete the default status'], 400);
        }

        if ($status->tasks()->count() > 0) {
            return response()->json(['error' => 'Cannot delete status with tasks. Move tasks to another status first.'], 400);
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
        
        if ($status->project_id != $project->id) {
            return response()->json(['error' => 'Status does not belong to this project'], 403);
        }

        // Remove default from all other statuses
        WorkflowStatus::where('project_id', $project->id)
            ->where('id', '!=', $status->id)
            ->update(['is_default' => false]);

        // Set this as default
        $status->update(['is_default' => true]);

        return response()->json($status);
    }
}
