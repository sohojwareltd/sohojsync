<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    /**
     * Display a listing of reminders for authenticated user.
     */
    public function index(Request $request)
    {
        $query = Reminder::where('user_id', auth()->id());

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'pending') {
                $query->pending();
            }
        }

        $reminders = $query->latest('remind_at')->paginate(50);
        
        return response()->json($reminders);
    }

    /**
     * Store a newly created reminder.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:task,meeting,deadline,event,other',
            'remind_at' => 'required|date',
            'user_id' => 'nullable|exists:users,id', // For admin creating reminders for others
            'related_model' => 'nullable|string',
            'related_model_id' => 'nullable|integer',
        ]);

        $reminder = Reminder::create([
            'user_id' => $request->user_id ?? auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'remind_at' => $request->remind_at,
            'related_model' => $request->related_model,
            'related_model_id' => $request->related_model_id,
        ]);

        return response()->json([
            'message' => 'Reminder created successfully',
            'reminder' => $reminder,
        ], 201);
    }

    /**
     * Display the specified reminder.
     */
    public function show(Reminder $reminder)
    {
        // Ensure user can only see their own reminders
        if ($reminder->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($reminder);
    }

    /**
     * Update the specified reminder.
     */
    public function update(Request $request, Reminder $reminder)
    {
        // Ensure user can only update their own reminders
        if ($reminder->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:task,meeting,deadline,event,other',
            'remind_at' => 'required|date',
        ]);

        $reminder->update($request->only([
            'title',
            'description',
            'type',
            'remind_at',
        ]));

        return response()->json([
            'message' => 'Reminder updated successfully',
            'reminder' => $reminder,
        ]);
    }

    /**
     * Mark reminder as read.
     */
    public function markAsRead(Reminder $reminder)
    {
        if ($reminder->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reminder->update(['is_read' => true]);

        return response()->json([
            'message' => 'Reminder marked as read',
        ]);
    }

    /**
     * Remove the specified reminder.
     */
    public function destroy(Reminder $reminder)
    {
        if ($reminder->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reminder->delete();

        return response()->json([
            'message' => 'Reminder deleted successfully',
        ]);
    }

    /**
     * Get pending reminders count.
     */
    public function pendingCount()
    {
        $count = Reminder::where('user_id', auth()->id())
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }
}
