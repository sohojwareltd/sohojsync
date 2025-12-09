<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskComment extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'parent_id',
        'content',
        'mentions',
    ];

    protected $casts = [
        'mentions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $with = ['user'];

    /**
     * Get the task this comment belongs to.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user who created the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment (for replies).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(TaskComment::class, 'parent_id');
    }

    /**
     * Get all replies to this comment.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(TaskComment::class, 'parent_id')->orderBy('created_at');
    }

    /**
     * Scope to get only top-level comments (not replies).
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}
