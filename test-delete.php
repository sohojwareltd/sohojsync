<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\WorkflowStatus;

echo "Statuses for project 8:\n";
$statuses = WorkflowStatus::where('project_id', 8)->get();

foreach ($statuses as $status) {
    $taskCount = $status->tasks()->count();
    echo "- {$status->name} (ID: {$status->id}) - Tasks: {$taskCount}, Default: " . ($status->is_default ? 'Yes' : 'No') . "\n";
}

echo "\nTrying to delete status 43...\n";
$status = WorkflowStatus::find(43);
if ($status) {
    if ($status->tasks()->count() > 0) {
        echo "Cannot delete - has tasks\n";
    } else {
        $status->delete();
        echo "Deleted successfully!\n";
    }
} else {
    echo "Status 43 not found (already deleted)\n";
}
