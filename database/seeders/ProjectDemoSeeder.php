<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use App\Models\User;
use App\Models\Project;
use App\Models\WorkflowStatus;
use App\Models\Task;

class ProjectDemoSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Create or fetch roles
        $manager = User::firstOrCreate(
            ['email' => 'demo.manager@sohojsync.com'],
            ['name' => 'Demo Manager', 'role' => 'project_manager', 'password' => Hash::make('password'), 'email_verified_at' => now()]
        );

        $client = User::firstOrCreate(
            ['email' => 'demo.client@sohojsync.com'],
            ['name' => 'Acme Client', 'role' => 'client', 'password' => Hash::make('password'), 'email_verified_at' => now()]
        );

        $devs = [];
        for ($i = 1; $i <= 3; $i++) {
            $devs[] = User::firstOrCreate(
                ['email' => "demo.dev{$i}@sohojsync.com"],
                ['name' => "Demo Developer {$i}", 'role' => 'developer', 'password' => Hash::make('password'), 'email_verified_at' => now()]
            );
        }

        // Create a demo project
        $project = Project::firstOrCreate([
            'title' => 'Demo E-commerce Platform',
            'description' => 'Build a modern e-commerce platform with product catalog, cart, checkout, and admin dashboard.',
            'owner_id' => $manager->id,
            'client_id' => $client->id,
            'project_manager_id' => $manager->id,
            'deadline' => now()->addMonths(2)->format('Y-m-d'),
        ]);

        // Attach project members (manager + devs)
        foreach ($devs as $dev) {
            DB::table('project_members')->updateOrInsert([
                'project_id' => $project->id,
                'user_id' => $dev->id,
            ], [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // Ensure manager visible in members too (optional)
        DB::table('project_members')->updateOrInsert([
            'project_id' => $project->id,
            'user_id' => $manager->id,
        ], [
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create workflow statuses if missing
        if ($project->workflowStatuses()->count() === 0) {
            $statuses = [
                ['name' => 'Backlog', 'slug' => 'backlog', 'color' => '#9CA3AF', 'order' => 0, 'is_default' => true],
                ['name' => 'In Progress', 'slug' => 'in-progress', 'color' => '#60A5FA', 'order' => 1],
                ['name' => 'Review', 'slug' => 'review', 'color' => '#F59E0B', 'order' => 2],
                ['name' => 'Done', 'slug' => 'done', 'color' => '#10B981', 'order' => 3, 'is_completed' => true],
            ];
            foreach ($statuses as $s) {
                $project->workflowStatuses()->create($s);
            }
        }

        $statusIds = $project->workflowStatuses()->pluck('id')->toArray();
        $priorities = ['low', 'medium', 'high', 'urgent'];
        $labelPool = ['frontend', 'backend', 'api', 'ui', 'auth', 'payments', 'reports'];

        // Create realistic tasks: some single-dev, some multi-dev
        $tasksSpec = [
            ['title' => 'Implement product listing grid', 'multi' => true],
            ['title' => 'Build cart persistence', 'multi' => false],
            ['title' => 'Checkout flow with payments', 'multi' => true],
            ['title' => 'Admin dashboard overview', 'multi' => false],
            ['title' => 'Auth & password reset', 'multi' => true],
            ['title' => 'Order detail page', 'multi' => false],
            ['title' => 'Sales report export', 'multi' => true],
            ['title' => 'Improve mobile UX', 'multi' => false],
        ];

        $order = 0;
        foreach ($tasksSpec as $spec) {
            $priority = $priorities[array_rand($priorities)];
            $statusId = $statusIds[array_rand($statusIds)];
            $start = $faker->dateTimeBetween('-10 days', '+5 days');
            $due = (clone $start)->modify('+' . $faker->numberBetween(3, 14) . ' days');
            $labels = $faker->randomElements($labelPool, $faker->numberBetween(0, 3));

            $task = Task::create([
                'project_id' => $project->id,
                'title' => $spec['title'],
                'description' => '<p>' . $faker->realText($faker->numberBetween(80, 160)) . '</p>',
                'status' => 'open',
                'workflow_status_id' => $statusId,
                'priority' => $priority,
                'start_date' => $start->format('Y-m-d'),
                'due_date' => $due->format('Y-m-d'),
                'estimated_hours' => $faker->randomFloat(2, 2, 24),
                'actual_hours' => $faker->randomFloat(2, 0, 26),
                'labels' => json_encode($labels),
                'order' => $order++,
                'assigned_to' => $spec['multi'] ? null : $devs[array_rand($devs)]->id,
            ]);

            if ($spec['multi']) {
                // Assign 2 developers
                $assignees = collect($devs)->shuffle()->take(2);
                foreach ($assignees as $dev) {
                    DB::table('task_assignments')->insert([
                        'task_id' => $task->id,
                        'user_id' => $dev->id,
                        'assigned_at' => now(),
                        'assigned_by' => $manager->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } else {
                // Single developer assignment via pivot as well
                $dev = $devs[array_rand($devs)];
                DB::table('task_assignments')->insert([
                    'task_id' => $task->id,
                    'user_id' => $dev->id,
                    'assigned_at' => now(),
                    'assigned_by' => $manager->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
