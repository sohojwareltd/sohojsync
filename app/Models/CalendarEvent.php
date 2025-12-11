<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'type',
        'meeting_link',
        'color',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Get the user who created this event
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get users this event is shared with
     */
    public function sharedUsers()
    {
        return $this->belongsToMany(User::class, 'calendar_event_user', 'calendar_event_id', 'user_id');
    }
}
