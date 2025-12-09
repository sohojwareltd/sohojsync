<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'profile_image',
        'date_of_birth',
        'joining_date',
        'cv_path',
        'last_promotion_date',
        'designation',
        'salary',
        'address',
        'phone',
        'emergency_contact',
        'tasks_completed',
        'tasks_rejected',
        'client_satisfaction_points',
        'performance_score',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'joining_date' => 'date',
        'last_promotion_date' => 'date',
    ];

    /**
     * Get the user that owns the employee.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate performance score based on tasks and satisfaction
     */
    public function calculatePerformanceScore()
    {
        $completionRate = $this->tasks_completed > 0 
            ? ($this->tasks_completed / ($this->tasks_completed + $this->tasks_rejected)) * 100 
            : 0;
        
        $score = ($completionRate * 0.6) + ($this->client_satisfaction_points * 0.4);
        
        $this->update(['performance_score' => round($score)]);
        
        return $score;
    }
}
