<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'remind_at',
        'is_sent',
        'is_read',
        'related_model',
        'related_model_id',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'is_sent' => 'boolean',
        'is_read' => 'boolean',
    ];

    /**
     * Get the user that owns the reminder.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get pending reminders that should be sent
     */
    public function scopePending($query)
    {
        return $query->where('is_sent', false)
                    ->where('remind_at', '<=', now());
    }

    /**
     * Scope to get unread reminders
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
