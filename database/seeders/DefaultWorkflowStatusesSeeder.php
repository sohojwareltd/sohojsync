<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\WorkflowStatus;
use Illuminate\Database\Seeder;

class DefaultWorkflowStatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all projects that don't have workflow statuses yet
        $projects = Project::doesntHave('workflowStatuses')->get();

        foreach ($projects as $project) {
            $this->createDefaultWorkflowStatuses($project);
        }
    }

    /**
     * Create default workflow statuses for a project.
     */
    public static function createDefaultWorkflowStatuses(Project $project): void
    {
        $defaultStatuses = [
            [
                'name' => 'New Task',
                'slug' => 'new_task',
                'color' => '#6B7280', // Gray
                'order' => 0,
                'is_default' => true,
                'is_completed' => false,
                'description' => 'Newly created tasks',
            ],
            [
                'name' => 'Requirements Ready',
                'slug' => 'requirements_ready',
                'color' => '#8B5CF6', // Purple
                'order' => 1,
                'is_default' => false,
                'is_completed' => false,
                'description' => 'Requirements are complete and ready to start',
            ],
            [
                'name' => 'In Progress',
                'slug' => 'in_progress',
                'color' => '#3B82F6', // Blue
                'order' => 2,
                'is_default' => false,
                'is_completed' => false,
                'description' => 'Currently being worked on',
            ],
            [
                'name' => 'Testing',
                'slug' => 'testing',
                'color' => '#F59E0B', // Orange
                'order' => 3,
                'is_default' => false,
                'is_completed' => false,
                'description' => 'Under testing and quality assurance',
            ],
            [
                'name' => 'Ready for Release',
                'slug' => 'ready_for_release',
                'color' => '#10B981', // Green
                'order' => 4,
                'is_default' => false,
                'is_completed' => false,
                'description' => 'Tested and ready to be released',
            ],
            [
                'name' => 'Completed',
                'slug' => 'completed',
                'color' => '#059669', // Dark Green
                'order' => 5,
                'is_default' => false,
                'is_completed' => true,
                'description' => 'Task is complete',
            ],
        ];

        foreach ($defaultStatuses as $status) {
            WorkflowStatus::create([
                'project_id' => $project->id,
                ...$status,
            ]);
        }
    }
}
