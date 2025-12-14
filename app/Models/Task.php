<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'workflow_status_id',
        'priority',
        'start_date',
        'due_date',
        'estimated_hours',
        'actual_hours',
        'labels',
        'order',
        'assigned_to',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'labels' => 'array',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'assigned_to' => 'integer',
    ];

    /**
     * Get the project that owns the task.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the workflow status.
     */
    public function workflowStatus()
    {
        return $this->belongsTo(WorkflowStatus::class);
    }

    /**
     * Get the assigned users (many-to-many).
     */
    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'task_assignments')
            ->withPivot('assigned_at', 'assigned_by')
            ->withTimestamps();
    }

    /**
     * Get the task assignments.
     */
    public function assignments()
    {
        return $this->hasMany(TaskAssignment::class);
    }

    /**
     * Get all comments for this task.
     */
    public function comments()
    {
        return $this->hasMany(TaskComment::class)->orderBy('created_at');
    }

    /**
     * Get the user assigned to the task (legacy).
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get labels as an array.
     */
    public function getLabelsAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    /**
     * Scope to filter by priority.
     */
    public function scopePriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to filter by workflow status.
     */
    public function scopeInStatus($query, $statusId)
    {
        return $query->where('workflow_status_id', $statusId);
    }

    /**
     * Scope to get tasks assigned to a user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->whereHas('assignedUsers', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }
}
