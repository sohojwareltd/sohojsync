<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type', // 'direct' or 'group'
        'project_id',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the messages for this chat room
     */
    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'room_id');
    }

    /**
     * Get the users in this chat room
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'chat_room_user', 'room_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get the project this chat room belongs to
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the creator of this chat room
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the last message in this chat room
     */
    public function lastMessage()
    {
        return $this->hasOne(ChatMessage::class, 'room_id')->latest();
    }

    /**
     * Get unread message count for a user
     */
    public function unreadCountForUser($userId)
    {
        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->whereDoesntHave('readBy', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->count();
    }
}
