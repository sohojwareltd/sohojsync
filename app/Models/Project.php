<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'title',
        'description',
        'owner_id',
        'client_id',
        'project_manager_id',
        'deadline',
        'status',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    /**
     * Get the owner of the project.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the project manager.
     */
    public function projectManager()
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    /**
     * Get the client.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the team members.
     */
    public function members()
    {
        return $this->hasMany(ProjectMember::class);
    }

    /**
     * Get the developer users.
     */
    public function developers()
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->where('role', 'developer');
    }

    /**
     * Get the workflow statuses for the project.
     */
    public function workflowStatuses()
    {
        return $this->hasMany(WorkflowStatus::class)->orderBy('order');
    }
}
