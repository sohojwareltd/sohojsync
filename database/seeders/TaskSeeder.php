<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowStatus;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        $projects = Project::with(['workflowStatuses', 'developers'])->get();
        if ($projects->isEmpty()) {
            Log::warning('TaskSeeder: No projects found. Skipping task seeding.');
            return;
        }

        foreach ($projects as $project) {
            // Ensure workflow statuses exist
            if ($project->workflowStatuses()->count() === 0) {
                // Create a simple default workflow
                $defaults = [
                    ['name' => 'Backlog', 'slug' => 'backlog', 'color' => '#9CA3AF', 'order' => 0, 'is_default' => true],
                    ['name' => 'In Progress', 'slug' => 'in-progress', 'color' => '#60A5FA', 'order' => 1],
                    ['name' => 'Review', 'slug' => 'review', 'color' => '#F59E0B', 'order' => 2],
                    ['name' => 'Done', 'slug' => 'done', 'color' => '#10B981', 'order' => 3, 'is_completed' => true],
                ];
                foreach ($defaults as $d) {
                    $project->workflowStatuses()->create($d);
                }
                $project->refresh();
            }

            $statusIds = $project->workflowStatuses()->pluck('id')->toArray();
            $priorities = ['low', 'medium', 'high', 'urgent'];

            // Generate realistic labels
            $labelPool = ['frontend', 'backend', 'api', 'ui', 'ux', 'auth', 'payments', 'docs', 'infra'];

            // Create tasks
            $count = 12;
            for ($i = 1; $i <= $count; $i++) {
                $priority = $faker->randomElement($priorities);
                $statusId = $faker->randomElement($statusIds);

                $start = $faker->dateTimeBetween('-30 days', '+5 days');
                $due = (clone $start)->modify('+' . $faker->numberBetween(2, 14) . ' days');

                $labels = $faker->randomElements($labelPool, $faker->numberBetween(0, 3));

                $task = Task::create([
                    'project_id' => $project->id,
                    'title' => ucfirst($faker->words($faker->numberBetween(3, 6), true)),
                    'description' => '<p>' . $faker->realText($faker->numberBetween(80, 180)) . '</p>',
                    'status' => 'open',
                    'workflow_status_id' => $statusId,
                    'priority' => $priority,
                    'start_date' => $start->format('Y-m-d'),
                    'due_date' => $due->format('Y-m-d'),
                    'estimated_hours' => $faker->randomFloat(2, 1, 40),
                    'actual_hours' => $faker->randomFloat(2, 0, 45),
                    'labels' => json_encode($labels),
                    'order' => $i - 1,
                    // legacy single assignee optionally set
                    'assigned_to' => $project->developers->isNotEmpty() ? $project->developers->random()->id : null,
                ]);

                // Assign multiple developers via pivot
                $assignees = $project->developers->shuffle()->take($faker->numberBetween(0, 3));
                foreach ($assignees as $dev) {
                    DB::table('task_assignments')->insert([
                        'task_id' => $task->id,
                        'user_id' => $dev->id,
                        'assigned_at' => now(),
                        'assigned_by' => $project->project_manager_id ?? $project->owner_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
