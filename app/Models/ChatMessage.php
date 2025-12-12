<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'user_id',
        'message',
        'type', // 'text', 'file', 'image'
        'file_path',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $with = ['user'];

    /**
     * Get the chat room this message belongs to
     */
    public function room()
    {
        return $this->belongsTo(ChatRoom::class, 'room_id');
    }

    /**
     * Get the user who sent this message
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get users who have read this message
     */
    public function readBy()
    {
        return $this->belongsToMany(User::class, 'chat_message_reads', 'message_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get read records for this message
     */
    public function reads()
    {
        return $this->belongsToMany(User::class, 'chat_message_reads', 'message_id', 'user_id')
            ->withPivot('read_at')
            ->withTimestamps();
    }
}
