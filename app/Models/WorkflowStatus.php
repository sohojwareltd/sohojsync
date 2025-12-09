<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStatus extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'slug',
        'color',
        'order',
        'is_default',
        'is_completed',
        'description',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_completed' => 'boolean',
    ];

    /**
     * Get the project that owns the workflow status.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the tasks for this workflow status.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Scope to get default status.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get completed status.
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    /**
     * Scope to order by the order field.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
