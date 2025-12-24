<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskComment;
use App\Models\ActivityLog;
use App\Models\ProjectMember;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\CalendarEvent;
use App\Models\Reminder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Carbon\Carbon;

class RealisticDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Create Admin User
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@sync.sohojware.dev'],
            [
                'name' => 'Admin Manager',
                'email' => 'admin@sync.sohojware.dev',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        // Create Project Managers
        $projectManagers = [];
        $pmData = [
            ['name' => 'Raja Khan', 'email' => 'raj.khan@company.com', 'avatar' => 'RajaKhan'],
            ['name' => 'Priya Singh', 'email' => 'priya.singh@company.com', 'avatar' => 'PriyaSingh'],
        ];

        foreach ($pmData as $pm) {
            $user = User::updateOrCreate(
                ['email' => $pm['email']],
                [
                    'name' => $pm['name'],
                    'email' => $pm['email'],
                    'password' => bcrypt('password'),
                    'role' => 'project_manager',
                ]
            );

            $employee = Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'profile_image' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . $pm['avatar'],
                    'phone' => $faker->phoneNumber(),
                    'designation' => 'Project Manager',
                    'joining_date' => Carbon::now()->subMonths(rand(12, 36))->format('Y-m-d'),
                    'date_of_birth' => Carbon::instance($faker->dateTimeBetween('-50 years', '-30 years'))->format('Y-m-d'),
                    'performance_score' => rand(85, 100),
                    'salary' => rand(70000, 120000),
                    'address' => $faker->address(),
                    'tasks_completed' => rand(30, 100),
                    'client_satisfaction_points' => rand(85, 100),
                    'notes' => 'Experienced Project Manager with excellent leadership skills',
                ]
            );
            $projectManagers[] = $employee;
        }

        // Create Clients
        $clients = [];
        $clientNames = [
            ['name' => 'Tech Innovations Inc', 'company' => 'Tech Innovations Inc', 'email' => 'contact@techinnovations.com'],
            ['name' => 'Digital Marketing Pro', 'company' => 'Digital Marketing Pro', 'email' => 'info@digitalmarketingpro.com'],
            ['name' => 'E-Commerce Solutions', 'company' => 'E-Commerce Solutions', 'email' => 'sales@ecommercesolutions.com'],
            ['name' => 'Healthcare Plus', 'company' => 'Healthcare Plus', 'email' => 'contact@healthcareplus.com'],
            ['name' => 'Finance Tech Group', 'company' => 'Finance Tech Group', 'email' => 'info@finatech.com'],
            ['name' => 'Education Hub', 'company' => 'Education Hub', 'email' => 'support@educationhub.com'],
        ];

        foreach ($clientNames as $clientData) {
            $user = User::updateOrCreate(
                ['email' => $clientData['email']],
                [
                    'name' => $clientData['name'],
                    'email' => $clientData['email'],
                    'password' => bcrypt('password'),
                    'role' => 'client',
                ]
            );

            $client = Client::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company' => $clientData['company'],
                    'phone' => $faker->phoneNumber(),
                    'address' => $faker->address(),
                    'website' => 'https://' . strtolower(str_replace(' ', '', $clientData['company'])) . '.com',
                    'notes' => $faker->paragraph(),
                ]
            );
            $clients[] = $client;
        }

        // Create Developers/Employees
        $developers = [];
        $developerNames = [
            ['name' => 'Ahmed Hassan', 'email' => 'ahmed@company.com', 'title' => 'Senior Developer'],
            ['name' => 'Fatima Khan', 'email' => 'fatima@company.com', 'title' => 'Full Stack Developer'],
            ['name' => 'Mohammad Ali', 'email' => 'mohammadali@company.com', 'title' => 'Backend Developer'],
            ['name' => 'Saira Malik', 'email' => 'saira@company.com', 'title' => 'Frontend Developer'],
            ['name' => 'Karim Shabab', 'email' => 'karim@company.com', 'title' => 'UI/UX Designer'],
            ['name' => 'Aisha Patel', 'email' => 'aisha@company.com', 'title' => 'QA Engineer'],
        ];

        foreach ($developerNames as $devData) {
            $user = User::updateOrCreate(
                ['email' => $devData['email']],
                [
                    'name' => $devData['name'],
                    'email' => $devData['email'],
                    'password' => bcrypt('password'),
                    'role' => 'developer',
                ]
            );

            $developer = Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'profile_image' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . str_replace(' ', '', $devData['name']),
                    'phone' => $faker->phoneNumber(),
                    'designation' => $devData['title'],
                    'joining_date' => Carbon::now()->subMonths(rand(3, 24))->format('Y-m-d'),
                    'date_of_birth' => Carbon::instance($faker->dateTimeBetween('-55 years', '-25 years'))->format('Y-m-d'),
                    'performance_score' => rand(75, 100),
                    'salary' => rand(40000, 150000),
                    'address' => $faker->address(),
                    'tasks_completed' => rand(15, 80),
                    'client_satisfaction_points' => rand(80, 100),
                    'notes' => 'Expert in ' . $devData['title'],
                ]
            );
            $developers[] = $developer;
        }

        // Create Projects with realistic data
        $projects = [];
        $projectNames = [
            [
                'name' => 'E-Commerce Platform Redesign',
                'description' => 'Complete redesign of the existing e-commerce platform with modern UI/UX, improved performance, and mobile-first approach. Include advanced filtering, recommendation engine, and secure payment integration.',
                'status' => 'in_progress',
                'priority' => 'high',
            ],
            [
                'name' => 'Healthcare Mobile App',
                'description' => 'Developing a comprehensive mobile application for healthcare management. Features include appointment scheduling, patient records, telemedicine consultation, and real-time notifications for doctors and patients.',
                'status' => 'in_progress',
                'priority' => 'high',
            ],
            [
                'name' => 'Digital Marketing Dashboard',
                'description' => 'Analytics and reporting dashboard for digital marketing campaigns. Real-time data visualization, ROI tracking, multi-channel campaign management, and AI-powered insights for better decision making.',
                'status' => 'planning',
                'priority' => 'medium',
            ],
            [
                'name' => 'Financial Management System',
                'description' => 'Enterprise-level financial management system with accounts payable/receivable, general ledger, budgeting, forecasting, and comprehensive financial reporting with tax compliance.',
                'status' => 'in_progress',
                'priority' => 'high',
            ],
            [
                'name' => 'Learning Management System',
                'description' => 'Complete LMS platform for online education. Features include course management, video streaming, interactive quizzes, student progress tracking, certificates, and real-time notifications.',
                'status' => 'planning',
                'priority' => 'medium',
            ],
            [
                'name' => 'Customer Relationship Management',
                'description' => 'CRM system for managing customer interactions, sales pipeline, marketing automation, and customer service. Includes lead scoring, email integration, and automated workflows.',
                'status' => 'completed',
                'priority' => 'medium',
            ],
        ];

        foreach ($projectNames as $index => $projectData) {
            $client = $clients[$index % count($clients)];
            $project = Project::create([
                'owner_id' => $projectManagers[$index % count($projectManagers)]->user_id,
                'title' => $projectData['name'],
                'description' => $projectData['description'],
            ]);
            $projects[] = $project;
        }

        // Create project members (developers assigned to projects)
        foreach ($projects as $project) {
            $assignedDevelopers = collect($developers)->random(rand(2, 4));
            foreach ($assignedDevelopers as $employee) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id' => $employee->user_id,
                ]);
            }
        }

        // Create Tasks with assignments
        $taskStatuses = ['open', 'done'];
        $taskPriorities = ['low', 'medium', 'high', 'urgent'];
        
        $taskTitles = [
            'Design homepage mockup',
            'Implement user authentication',
            'Create API endpoints',
            'Setup database schema',
            'Develop payment gateway integration',
            'Write unit tests',
            'Code review and optimization',
            'Deploy to staging server',
            'Client UAT testing',
            'Performance optimization',
            'Security audit',
            'Documentation update',
            'Bug fixes and refinements',
            'Frontend responsive design',
            'Mobile app optimization',
        ];

        $commentTexts = [
            'Started working on this task.',
            'Completed the initial implementation.',
            'Waiting for client feedback.',
            'Ready for code review.',
            'Great progress! Moving to next phase.',
            'Found some issues, fixing them now.',
            'Tests are passing, looks good!',
            'Needs some refinements based on feedback.',
            'Blocked by another task, will resume soon.',
            'Almost done, final touches needed.',
        ];

        foreach ($projects as $project) {
            $taskCount = rand(6, 10);
            for ($i = 0; $i < $taskCount; $i++) {
                $task = Task::create([
                    'project_id' => $project->id,
                    'title' => $taskTitles[$i % count($taskTitles)] . ' - ' . ($i + 1),
                    'description' => $faker->paragraph(2),
                    'status' => $taskStatuses[$i % count($taskStatuses)],
                    'priority' => $taskPriorities[rand(0, 3)],
                    'due_date' => Carbon::now()->addDays(rand(3, 45))->format('Y-m-d'),
                    'estimated_hours' => rand(4, 40),
                    'assigned_to' => $developers[rand(0, count($developers) - 1)]->user_id,
                ]);

                // Add task comments
                $commentCount = rand(2, 4);
                for ($j = 0; $j < $commentCount; $j++) {
                    TaskComment::create([
                        'task_id' => $task->id,
                        'user_id' => $developers[rand(0, count($developers) - 1)]->user_id,
                        'content' => $commentTexts[rand(0, count($commentTexts) - 1)],
                    ]);
                }

                // Add activity logs for tasks
                ActivityLog::create([
                    'user_id' => $developers[rand(0, count($developers) - 1)]->user_id,
                    'user_role' => 'developer',
                    'action' => 'task_' . ($i % 2 === 0 ? 'created' : 'updated'),
                    'model' => 'Task',
                    'model_id' => $task->id,
                    'description' => 'Task: ' . $task->title,
                    'event_type' => 'task_management',
                ]);
            }
        }

        // Create Chat Rooms and Messages
        $allUsers = collect($developers)->map->user_id->push($adminUser->id)->push($projectManagers[0]->user_id);
        
        // Project-based chat rooms
        foreach ($projects as $project) {
            $chatRoom = ChatRoom::create([
                'name' => $project->title . ' - Team Chat',
                'type' => 'group',
                'project_id' => $project->id,
                'created_by' => $project->owner_id,
            ]);

            // Add 5-8 messages per chat room
            $messageCount = rand(5, 8);
            for ($i = 0; $i < $messageCount; $i++) {
                ChatMessage::create([
                    'room_id' => $chatRoom->id,
                    'user_id' => $developers[rand(0, count($developers) - 1)]->user_id,
                    'message' => $faker->sentence(10),
                    'type' => 'text',
                ]);
            }

            // Add activity log for chat
            ActivityLog::create([
                'user_id' => $project->owner_id,
                'user_role' => 'project_manager',
                'action' => 'chat_created',
                'model' => 'ChatRoom',
                'model_id' => $chatRoom->id,
                'description' => 'Created chat room: ' . $chatRoom->name,
                'event_type' => 'communication',
            ]);
        }

        // Create direct chat rooms between users
        for ($i = 0; $i < 3; $i++) {
            $user1 = $developers[rand(0, count($developers) - 1)]->user_id;
            $user2 = $developers[rand(0, count($developers) - 1)]->user_id;
            
            if ($user1 !== $user2) {
                $chatRoom = ChatRoom::create([
                    'name' => 'Direct Chat',
                    'type' => 'direct',
                    'created_by' => $user1,
                ]);

                // Add 3-5 direct messages
                for ($j = 0; $j < rand(3, 5); $j++) {
                    ChatMessage::create([
                        'room_id' => $chatRoom->id,
                        'user_id' => ($j % 2 === 0) ? $user1 : $user2,
                        'message' => $faker->sentence(8),
                        'type' => 'text',
                    ]);
                }
            }
        }

        // Create Calendar Events
        $eventTypes = ['custom', 'google_meet', 'meeting', 'reminder'];
        $colors = ['#59569d', '#f25292', '#FF6B6B', '#4ECDC4', '#45B7D1'];

        // Events for project managers
        foreach ($projectManagers as $pm) {
            for ($i = 0; $i < rand(3, 5); $i++) {
                $startDate = Carbon::now()->addDays(rand(1, 30));
                CalendarEvent::create([
                    'user_id' => $pm->user_id,
                    'title' => $eventTypes[rand(0, count($eventTypes) - 1)] . ' - ' . $faker->sentence(3),
                    'description' => $faker->paragraph(2),
                    'start_date' => $startDate->format('Y-m-d H:i:s'),
                    'end_date' => $startDate->addHours(rand(1, 4))->format('Y-m-d H:i:s'),
                    'type' => $eventTypes[rand(0, count($eventTypes) - 1)],
                    'meeting_link' => 'https://meet.google.com/' . Str::random(12),
                    'color' => $colors[rand(0, count($colors) - 1)],
                ]);
            }
        }

        // Events for developers
        foreach ($developers as $dev) {
            for ($i = 0; $i < rand(2, 4); $i++) {
                $startDate = Carbon::now()->addDays(rand(1, 30));
                CalendarEvent::create([
                    'user_id' => $dev->user_id,
                    'title' => $eventTypes[rand(0, count($eventTypes) - 1)] . ' - ' . $faker->sentence(3),
                    'description' => $faker->paragraph(2),
                    'start_date' => $startDate->format('Y-m-d H:i:s'),
                    'end_date' => $startDate->addHours(rand(1, 3))->format('Y-m-d H:i:s'),
                    'type' => $eventTypes[rand(0, count($eventTypes) - 1)],
                    'color' => $colors[rand(0, count($colors) - 1)],
                ]);
            }
        }

        // Create Reminders
        $reminderTypes = ['task', 'meeting', 'deadline', 'event', 'other'];

        foreach ($developers as $dev) {
            for ($i = 0; $i < rand(2, 4); $i++) {
                Reminder::create([
                    'user_id' => $dev->user_id,
                    'title' => $reminderTypes[rand(0, count($reminderTypes) - 1)] . ' reminder',
                    'description' => $faker->sentence(8),
                    'type' => $reminderTypes[rand(0, count($reminderTypes) - 1)],
                    'remind_at' => Carbon::now()->addDays(rand(1, 15))->format('Y-m-d H:i:s'),
                    'is_sent' => rand(0, 1),
                    'is_read' => 0,
                ]);
            }
        }

        // Add more activity logs
        foreach ($projects as $project) {
            ActivityLog::create([
                'user_id' => $project->owner_id,
                'user_role' => 'project_manager',
                'action' => 'project_created',
                'model' => 'Project',
                'model_id' => $project->id,
                'description' => 'Created project: ' . $project->title,
                'event_type' => 'project_management',
            ]);
        }

        $this->command->info('✅ Comprehensive seeder completed successfully!');
        $this->command->info('');
        $this->command->info('📊 Created Data:');
        $this->command->info('   ✦ Admin: 1');
        $this->command->info('   ✦ Project Managers: ' . count($projectManagers));
        $this->command->info('   ✦ Developers: ' . count($developers));
        $this->command->info('   ✦ Clients: ' . count($clients));
        $this->command->info('   ✦ Projects: ' . count($projects));
        $this->command->info('   ✦ Chat Rooms: ' . (count($projects) + 3));
        $this->command->info('   ✦ Calendar Events: ' . ((count($projectManagers) * 4) + (count($developers) * 3)));
        $this->command->info('   ✦ Reminders: ' . (count($developers) * 3));
        $this->command->info('   ✦ Activity Logs: Multiple');
        $this->command->info('');
        $this->command->info('👥 User Roles & Logins:');
        $this->command->info('   1️⃣  Admin: admin@sohojsync.test / password');
        $this->command->info('   2️⃣  Project Managers:');
        $this->command->info('       - raj.khan@company.com / password');
        $this->command->info('       - priya.singh@company.com / password');
        $this->command->info('   3️⃣  Developers: ahmed@company.com, fatima@company.com, etc / password');
        $this->command->info('   4️⃣  Clients: contact@techinnovations.com, info@digitalmarketingpro.com, etc / password');
        $this->command->info('');
        $this->command->info('🎨 Features:');
        $this->command->info('   ✓ Profile Images (DiceBear API)');
        $this->command->info('   ✓ Project & Task Management');
        $this->command->info('   ✓ Real-time Chat (Group & Direct)');
        $this->command->info('   ✓ Calendar Events with Colors');
        $this->command->info('   ✓ Reminders & Notifications');
        $this->command->info('   ✓ Activity Logs');
    }
}
