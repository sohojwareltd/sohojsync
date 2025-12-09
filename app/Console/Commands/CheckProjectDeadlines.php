<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\Notification;
use App\Models\Reminder;
use Carbon\Carbon;

class CheckProjectDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'project:check-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check project deadlines and create reminders/notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        
        // Get projects with upcoming deadlines (1 day, 3 days, 7 days)
        $projects = Project::whereNotNull('deadline')
            ->where('deadline', '>=', $now)
            ->where('deadline', '<=', $now->copy()->addDays(7))
            ->with(['projectManager', 'client', 'members.user'])
            ->get();

        $count = 0;

        foreach ($projects as $project) {
            $daysUntilDeadline = $now->diffInDays($project->deadline, false);
            
            // Check if we should send reminder (1, 3, or 7 days)
            if (in_array($daysUntilDeadline, [1, 3, 7])) {
                $message = "Project '{$project->name}' deadline is in {$daysUntilDeadline} day(s) - " . 
                          Carbon::parse($project->deadline)->format('M d, Y');

                // Notify project manager
                if ($project->projectManager) {
                    $this->createNotification($project->projectManager->id, $project, $message);
                    $this->createReminder($project->projectManager->id, $project, $message);
                }

                // Notify all team members
                foreach ($project->members as $member) {
                    $this->createNotification($member->user_id, $project, $message);
                    $this->createReminder($member->user_id, $project, $message);
                }

                $count++;
            }
        }

        $this->info("Checked {$projects->count()} projects. Created reminders for {$count} projects.");
    }

    private function createNotification($userId, $project, $message)
    {
        Notification::firstOrCreate([
            'user_id' => $userId,
            'type' => 'deadline_reminder',
            'related_type' => 'Project',
            'related_id' => $project->id,
            'title' => 'Project Deadline Reminder',
            'message' => $message,
        ]);
    }

    private function createReminder($userId, $project, $message)
    {
        Reminder::firstOrCreate([
            'user_id' => $userId,
            'type' => 'deadline',
            'related_model' => 'Project',
            'related_model_id' => $project->id,
            'title' => 'Project Deadline Reminder',
            'description' => $message,
            'remind_at' => Carbon::parse($project->deadline)->subDay(),
        ]);
    }
}
