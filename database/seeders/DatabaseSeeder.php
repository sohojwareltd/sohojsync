<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run realistic data seeder
        $this->call(RealisticDataSeeder::class);
        
        // Seed core demo data first
        // Create Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'role' => 'admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create Project Manager user
        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Project Manager User',
                'role' => 'project_manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create Member user
        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Member User',
                'role' => 'developer',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Keep old test user for backward compatibility
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'role' => 'client',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create projects for Admin
        $project1 = Project::firstOrCreate([
            'title' => 'Website Redesign',
            'description' => 'Complete overhaul of company website with modern design and improved UX',
            'owner_id' => $admin->id,
        ]);

        $project2 = Project::firstOrCreate([
            'title' => 'Mobile App Development',
            'description' => 'Develop iOS and Android applications for customer engagement',
            'owner_id' => $admin->id,
        ]);

        $project3 = Project::firstOrCreate([
            'title' => 'Marketing Campaign Q1',
            'description' => 'Plan and execute Q1 marketing initiatives across all channels',
            'owner_id' => $admin->id,
        ]);

        // Create projects for Manager
        $project4 = Project::firstOrCreate([
            'title' => 'Database Optimization',
            'description' => 'Improve database performance and query optimization',
            'owner_id' => $manager->id,
        ]);

        $project5 = Project::firstOrCreate([
            'title' => 'API Documentation',
            'description' => 'Create comprehensive API documentation for developers',
            'owner_id' => $manager->id,
        ]);

        // Create projects for Member
        $project6 = Project::firstOrCreate([
            'title' => 'Bug Fixes Sprint',
            'description' => 'Fix reported bugs and improve stability',
            'owner_id' => $member->id,
        ]);

        // Create tasks for Admin's projects
        Task::firstOrCreate([
            'project_id' => $project1->id,
            'title' => 'Design homepage mockup',
            'description' => 'Create high-fidelity mockup for new homepage design',
            'status' => 'done',
            'due_date' => now()->subDays(5),
            'assigned_to' => $admin->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project1->id,
            'title' => 'Implement responsive navigation',
            'description' => 'Build mobile-friendly navigation component',
            'status' => 'open',
            'due_date' => now()->addDays(3),
            'assigned_to' => $manager->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project1->id,
            'title' => 'Set up CSS framework',
            'description' => 'Configure Tailwind CSS and base styles',
            'status' => 'done',
            'due_date' => now()->subDays(10),
            'assigned_to' => $member->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project2->id,
            'title' => 'Research React Native vs Flutter',
            'description' => 'Compare frameworks and make technology recommendation',
            'status' => 'done',
            'due_date' => now()->subDays(15),
            'assigned_to' => $admin->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project2->id,
            'title' => 'Build user authentication flow',
            'description' => 'Implement login, registration, and password reset',
            'status' => 'open',
            'due_date' => now()->addDays(7),
            'assigned_to' => $manager->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project3->id,
            'title' => 'Create content calendar',
            'description' => 'Plan social media posts for January-March',
            'status' => 'open',
            'due_date' => now()->addDays(2),
            'assigned_to' => $member->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project3->id,
            'title' => 'Design email templates',
            'description' => 'Create responsive email templates for campaigns',
            'status' => 'open',
            'due_date' => now()->addDays(10),
            'assigned_to' => $admin->id,
        ]);

        // Create tasks for Manager's projects
        Task::firstOrCreate([
            'project_id' => $project4->id,
            'title' => 'Analyze slow queries',
            'description' => 'Identify and optimize slow database queries',
            'status' => 'open',
            'due_date' => now()->addDays(5),
            'assigned_to' => $manager->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project4->id,
            'title' => 'Add database indexes',
            'description' => 'Create indexes for frequently queried columns',
            'status' => 'done',
            'due_date' => now()->subDays(2),
            'assigned_to' => $member->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project5->id,
            'title' => 'Write API endpoint documentation',
            'description' => 'Document all REST API endpoints with examples',
            'status' => 'open',
            'due_date' => now()->addDays(8),
            'assigned_to' => $manager->id,
        ]);

        // Create tasks for Member's projects
        Task::firstOrCreate([
            'project_id' => $project6->id,
            'title' => 'Fix login redirect issue',
            'description' => 'Resolve redirect loop after login',
            'status' => 'done',
            'due_date' => now()->subDays(1),
            'assigned_to' => $member->id,
        ]);

        Task::firstOrCreate([
            'project_id' => $project6->id,
            'title' => 'Fix mobile menu not closing',
            'description' => 'Mobile drawer menu stays open after navigation',
            'status' => 'open',
            'due_date' => now()->addDays(4),
            'assigned_to' => $member->id,
        ]);

        // Create 20 Employees with profile images
        $employeeNames = [
            ['name' => 'John Smith', 'role' => 'developer', 'designation' => 'Senior Developer'],
            ['name' => 'Sarah Johnson', 'role' => 'developer', 'designation' => 'Full Stack Developer'],
            ['name' => 'Michael Brown', 'role' => 'project_manager', 'designation' => 'Senior Project Manager'],
            ['name' => 'Emily Davis', 'role' => 'developer', 'designation' => 'Frontend Developer'],
            ['name' => 'David Wilson', 'role' => 'developer', 'designation' => 'Backend Developer'],
            ['name' => 'Jessica Martinez', 'role' => 'project_manager', 'designation' => 'Project Manager'],
            ['name' => 'Daniel Anderson', 'role' => 'developer', 'designation' => 'Junior Developer'],
            ['name' => 'Ashley Taylor', 'role' => 'developer', 'designation' => 'UI/UX Developer'],
            ['name' => 'Christopher Thomas', 'role' => 'project_manager', 'designation' => 'Technical Lead'],
            ['name' => 'Amanda Jackson', 'role' => 'developer', 'designation' => 'Mobile Developer'],
            ['name' => 'Matthew White', 'role' => 'developer', 'designation' => 'DevOps Engineer'],
            ['name' => 'Jennifer Harris', 'role' => 'project_manager', 'designation' => 'Scrum Master'],
            ['name' => 'Joshua Martin', 'role' => 'developer', 'designation' => 'Database Developer'],
            ['name' => 'Samantha Thompson', 'role' => 'developer', 'designation' => 'QA Engineer'],
            ['name' => 'Andrew Garcia', 'role' => 'developer', 'designation' => 'Software Engineer'],
            ['name' => 'Nicole Martinez', 'role' => 'project_manager', 'designation' => 'Product Manager'],
            ['name' => 'Ryan Robinson', 'role' => 'developer', 'designation' => 'Cloud Engineer'],
            ['name' => 'Lauren Clark', 'role' => 'developer', 'designation' => 'Security Engineer'],
            ['name' => 'Kevin Rodriguez', 'role' => 'developer', 'designation' => 'System Architect'],
            ['name' => 'Stephanie Lewis', 'role' => 'project_manager', 'designation' => 'Delivery Manager'],
        ];

        foreach ($employeeNames as $index => $employeeData) {
            $email = strtolower(str_replace(' ', '.', $employeeData['name'])) . '@sohojsync.com';
            
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $employeeData['name'],
                    'role' => $employeeData['role'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Generate avatar using UI Avatars API
            $avatarUrl = 'https://ui-avatars.com/api/?name=' . urlencode($employeeData['name']) . '&size=200&background=random';
            $avatarContent = @file_get_contents($avatarUrl);
            
            $profileImagePath = null;
            if ($avatarContent) {
                $filename = 'avatar_' . $user->id . '_' . time() . '.png';
                $path = storage_path('app/public/profile_images/' . $filename);
                
                // Create directory if it doesn't exist
                if (!File::exists(storage_path('app/public/profile_images'))) {
                    File::makeDirectory(storage_path('app/public/profile_images'), 0755, true);
                }
                
                file_put_contents($path, $avatarContent);
                $profileImagePath = 'profile_images/' . $filename;
            }

            Employee::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'profile_image' => $profileImagePath,
                    'date_of_birth' => now()->subYears(rand(25, 45))->format('Y-m-d'),
                    'joining_date' => now()->subMonths(rand(1, 36))->format('Y-m-d'),
                    'designation' => $employeeData['designation'],
                    'salary' => rand(50000, 150000),
                    'phone' => '+1' . rand(2000000000, 9999999999),
                    'emergency_contact' => '+1' . rand(2000000000, 9999999999),
                    'tasks_completed' => rand(10, 100),
                    'tasks_rejected' => rand(0, 10),
                    'client_satisfaction_points' => rand(50, 100),
                    'performance_score' => rand(60, 100),
                ]
            );
        }

        // Create 10 Clients
        $clientCompanies = [
            ['name' => 'Robert Johnson', 'company' => 'TechCorp Solutions'],
            ['name' => 'Maria Garcia', 'company' => 'Digital Innovations Inc'],
            ['name' => 'James Wilson', 'company' => 'CloudNet Systems'],
            ['name' => 'Linda Martinez', 'company' => 'DataFlow Technologies'],
            ['name' => 'William Anderson', 'company' => 'NextGen Software'],
            ['name' => 'Patricia Thomas', 'company' => 'Smart Business Group'],
            ['name' => 'Richard Taylor', 'company' => 'Global Tech Partners'],
            ['name' => 'Elizabeth Moore', 'company' => 'Innovative Solutions Ltd'],
            ['name' => 'Charles Jackson', 'company' => 'Future Systems Corp'],
            ['name' => 'Barbara White', 'company' => 'Enterprise Tech Hub'],
        ];

        foreach ($clientCompanies as $clientData) {
            $email = strtolower(str_replace(' ', '.', $clientData['name'])) . '@' . strtolower(str_replace(' ', '', $clientData['company'])) . '.com';
            
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $clientData['name'],
                    'role' => 'client',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            Client::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'company' => $clientData['company'],
                    'phone' => '+1' . rand(2000000000, 9999999999),
                    'address' => rand(100, 9999) . ' ' . ['Main St', 'Oak Ave', 'Maple Dr', 'Park Blvd'][rand(0, 3)] . ', ' . ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][rand(0, 4)] . ', USA',
                    'website' => 'https://www.' . strtolower(str_replace(' ', '', $clientData['company'])) . '.com',
                ]
            );
        }

        // Demo project with manager, 3 developers, and client
        $this->call(ProjectDemoSeeder::class);

        // Finally, generate realistic tasks across existing projects
        $this->call(TaskSeeder::class);
    }
}
