<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['owner', 'projectManager', 'client', 'members.user'])
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => function ($query) {
                    $query->where('status', 'done');
                }
            ]);
        
        // Note: Attachments loaded separately per project to avoid N+1

        // Filter by user role
        $user = $request->user();
        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'project_manager') {
            $query->where('project_manager_id', $user->id);
        } elseif ($user->role === 'developer') {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $projects = $query->latest()->paginate(15);

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_manager_id' => 'nullable|exists:users,id',
            'client_id' => 'nullable|exists:users,id',
            'deadline' => 'nullable|date',
            'status' => 'nullable|string|in:planning,in_progress,review,completed,on_hold,cancelled',
            'developer_ids' => 'nullable|array',
            'developer_ids.*' => 'exists:users,id',
        ]);

        $validated['owner_id'] = $request->user()->id;

        $project = Project::create($validated);

        // Assign developers
        if (!empty($validated['developer_ids'])) {
            foreach ($validated['developer_ids'] as $developerId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id' => $developerId,
                    'role' => 'developer',
                ]);

                // Notify developer
                $this->createNotification(
                    $developerId,
                    'project_assigned',
                    'New Project Assignment',
                    "You have been assigned to project: {$project->title}",
                    'Project',
                    $project->id
                );
            }
        }

        // Notify project manager
        if ($project->project_manager_id) {
            $this->createNotification(
                $project->project_manager_id,
                'project_assigned',
                'New Project Assignment',
                "You have been assigned as project manager for: {$project->title}",
                'Project',
                $project->id
            );
        }

        // Notify client
        if ($project->client_id) {
            $this->createNotification(
                $project->client_id,
                'project_created',
                'New Project Created',
                "A new project has been created for you: {$project->title}",
                'Project',
                $project->id
            );
        }

        return response()->json($project->load(['projectManager', 'client', 'members.user']), 201);
    }

    public function show($id)
    {
        $project = Project::with(['owner', 'projectManager', 'client', 'members.user', 'tasks'])
            ->findOrFail($id);

        // Get attachments
        $attachments = DB::table('project_attachments')
            ->where('project_id', $id)
            ->get();
        
        $project->attachments = $attachments;

        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_manager_id' => 'nullable|exists:users,id',
            'client_id' => 'nullable|exists:users,id',
            'deadline' => 'nullable|date',
            'status' => 'nullable|string|in:planning,in_progress,review,completed,on_hold,cancelled',
            'developer_ids' => 'nullable|array',
            'developer_ids.*' => 'exists:users,id',
        ]);

        // Check if project manager changed
        if (isset($validated['project_manager_id']) && $validated['project_manager_id'] != $project->project_manager_id) {
            $this->createNotification(
                $validated['project_manager_id'],
                'project_assigned',
                'New Project Assignment',
                "You have been assigned as project manager for: {$project->title}",
                'Project',
                $project->id
            );
        }

        $project->update($validated);

        // Update developers
        if (isset($validated['developer_ids'])) {
            $currentDeveloperIds = $project->members->pluck('user_id')->toArray();
            $newDeveloperIds = $validated['developer_ids'];

            // Remove developers no longer assigned
            $toRemove = array_diff($currentDeveloperIds, $newDeveloperIds);
            if (!empty($toRemove)) {
                ProjectMember::where('project_id', $project->id)
                    ->whereIn('user_id', $toRemove)
                    ->delete();
            }

            // Add new developers
            $toAdd = array_diff($newDeveloperIds, $currentDeveloperIds);
            foreach ($toAdd as $developerId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id' => $developerId,
                    'role' => 'developer',
                ]);

                $this->createNotification(
                    $developerId,
                    'project_assigned',
                    'New Project Assignment',
                    "You have been assigned to project: {$project->name}",
                    'Project',
                    $project->id
                );
            }
        }

        return response()->json($project->load(['projectManager', 'client', 'members.user']));
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function statistics(Request $request)
    {
        $user = $request->user();
        $query = Project::query();

        // Filter by user role
        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'project_manager') {
            $query->where('project_manager_id', $user->id);
        } elseif ($user->role === 'developer') {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $total = $query->count();
        $pending = (clone $query)->where('status', 'pending')->count();
        $inProgress = (clone $query)->where('status', 'in_progress')->count();
        $completed = (clone $query)->where('status', 'completed')->count();
        $onHold = (clone $query)->where('status', 'on_hold')->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'on_hold' => $onHold,
        ]);
    }

    public function getUsersForAssignment()
    {
        $projectManagers = User::where('role', 'project_manager')->get(['id', 'name', 'email']);
        $developers = User::where('role', 'developer')->get(['id', 'name', 'email']);
        $clients = User::where('role', 'client')->get(['id', 'name', 'email']);

        return response()->json([
            'project_managers' => $projectManagers,
            'developers' => $developers,
            'clients' => $clients,
        ]);
    }

    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'project_id' => 'required|exists:projects,id',
            'file_name' => 'nullable|string|max:255'
        ]);

        $project = Project::findOrFail($request->project_id);

        // Check authorization
        if ($project->owner_id !== $request->user()->id && 
            $project->project_manager_id !== $request->user()->id &&
            !$request->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $file = $request->file('file');
            $originalName = $request->file_name ?? $file->getClientOriginalName();
            
            // Store file
            $path = $file->store('project-attachments/' . $project->id, 'public');
            
            // Create database record if table exists
            $attachmentsTableExists = Schema::hasTable('project_attachments');
            
            if ($attachmentsTableExists) {
                DB::table('project_attachments')->insert([
                    'project_id' => $project->id,
                    'file_name' => $originalName,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getClientMimeType(),
                    'uploaded_by' => $request->user()->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'file' => [
                    'name' => $originalName,
                    'path' => $path,
                    'size' => $file->getSize()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'File upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    private function createNotification($userId, $type, $title, $message, $relatedType, $relatedId)
    {
        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'related_type' => $relatedType,
            'related_id' => $relatedId,
        ]);
    }

    public function getUserProjects($userId)
    {
        $projects = Project::where(function ($query) use ($userId) {
            $query->where('project_manager_id', $userId)
                  ->orWhere('owner_id', $userId)
                  ->orWhereHas('members', function ($q) use ($userId) {
                      $q->where('user_id', $userId);
                  });
        })->with(['client', 'project_manager', 'members.user'])->get();

        return response()->json([
            'data' => $projects
        ]);
    }
}
