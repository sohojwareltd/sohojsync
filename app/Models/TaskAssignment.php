<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskAssignment extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'assigned_at',
        'assigned_by',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    /**
     * Get the task that this assignment belongs to.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user assigned to the task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who made the assignment.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
