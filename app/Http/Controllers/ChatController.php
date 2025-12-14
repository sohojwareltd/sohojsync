<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    public function getRooms(Request $request)
    {
        $user = $request->user();
        
        $rooms = ChatRoom::with(['users', 'messages' => function($query) {
                $query->with('user')->latest()->limit(1);
            }])
            ->whereHas('users', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->latest('updated_at')
            ->get()
            ->map(function($room) use ($user) {
                $unreadCount = ChatMessage::where('room_id', $room->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', function($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->count();
                
                // For direct rooms, show the other user
                if ($room->type === 'direct' && $room->users->count() === 2) {
                    $otherUser = $room->users->firstWhere('id', '!=', $user->id);
                    $room->display_name = $otherUser ? $otherUser->name : 'Unknown User';
                } else {
                    $room->display_name = $room->name ?? 'Group Chat';
                }
                
                $room->unread_count = $unreadCount;
                $room->last_message = $room->messages->first();
                
                return $room;
            })
            ->sortByDesc(function($room) {
                return $room->last_message?->created_at ?? $room->created_at;
            })
            ->values();
        
        // Get all messages from group chats where the user participated
        $groupRoomIds = ChatRoom::where('type', 'group')
            ->whereHas('users', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->pluck('id');
        
        $groupChatMessages = ChatMessage::whereIn('room_id', $groupRoomIds)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('user_id');
        
        return response()->json([
            'rooms' => $rooms,
            'groupChatMessages' => $groupChatMessages
        ]);
    }
    
    public function getMessages(Request $request, $roomId)
    {
        $user = $request->user();
        
        // Verify user is in this room
        $room = ChatRoom::whereHas('users', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($roomId);
        
        $messages = ChatMessage::with('user')
            ->where('room_id', $roomId)
            ->orderBy('created_at', 'asc')
            ->get();
        
        return response()->json([
            'room' => $room->load('users'),
            'messages' => $messages
        ]);
    }
    
    public function sendMessage(Request $request, $roomId)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'message' => 'required_without:file|string|max:5000',
            'type' => 'required|in:text,file,image',
            'file' => 'required_if:type,file,image|file|max:10240', // 10MB max
        ]);
        
        // Verify user is in this room
        $room = ChatRoom::whereHas('users', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($roomId);
        
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('chat-files', 'public');
        }
        
        $message = ChatMessage::create([
            'room_id' => $roomId,
            'user_id' => $user->id,
            'message' => $validated['message'] ?? null,
            'type' => $validated['type'],
            'file_path' => $filePath,
        ]);
        
        return response()->json($message->load('user'));
    }
    
    public function createRoom(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'type' => 'required|in:direct,group',
            'name' => 'nullable|string|max:255',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
        ]);
        
        // Check if direct room already exists
        if ($validated['type'] === 'direct' && count($validated['user_ids']) === 1) {
            $otherUserId = $validated['user_ids'][0];
            
            $existingRoom = ChatRoom::where('type', 'direct')
                ->whereHas('users', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereHas('users', function($query) use ($otherUserId) {
                    $query->where('user_id', $otherUserId);
                })
                ->first();
            
            if ($existingRoom) {
                return response()->json($existingRoom->load('users'));
            }
        }
        
        $room = ChatRoom::create([
            'name' => $validated['name'] ?? null,
            'type' => $validated['type'],
            'project_id' => $validated['project_id'] ?? null,
            'created_by' => $user->id,
        ]);
        
        // Add current user and other users to the room
        $userIds = array_unique(array_merge([$user->id], $validated['user_ids']));
        $room->users()->attach($userIds);
        
        return response()->json($room->load('users'));
    }
    
    public function markAsRead(Request $request, $roomId)
    {
        $user = $request->user();
        
        // Get all unread messages in this room
        $messages = ChatMessage::where('room_id', $roomId)
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get();
        
        foreach ($messages as $message) {
            DB::table('chat_message_reads')->insert([
                'message_id' => $message->id,
                'user_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        return response()->json(['success' => true]);
    }
    
    public function updateOnlineStatus(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'is_online' => 'required|boolean',
        ]);
        
        DB::table('user_online_status')->updateOrInsert(
            ['user_id' => $user->id],
            [
                'is_online' => $validated['is_online'],
                'last_seen_at' => now(),
                'updated_at' => now(),
            ]
        );
        
        return response()->json(['success' => true]);
    }
    
    public function getOnlineUsers(Request $request)
    {
        $onlineUsers = DB::table('user_online_status')
            ->join('users', 'user_online_status.user_id', '=', 'users.id')
            ->where('is_online', true)
            ->select('users.id', 'users.name', 'users.email', 'user_online_status.last_seen_at')
            ->get();
        
        return response()->json($onlineUsers);
    }
    
    public function getTeamMembers(Request $request)
    {
        $user = $request->user();

        // Show everyone (clients, employees, managers, etc.) except the current user
        $teamMembers = User::where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return response()->json($teamMembers);
    }
}
