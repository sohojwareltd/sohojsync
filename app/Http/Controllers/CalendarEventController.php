<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    /**
     * Get all calendar events for the authenticated user
     */
    public function index()
    {
        $events = CalendarEvent::where('user_id', Auth::id())
            ->orWhereHas('sharedUsers', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json($events);
    }

    /**
     * Store a new calendar event
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:custom,google_meet,meeting,reminder',
            'meeting_link' => 'nullable|url',
            'color' => 'nullable|string|max:7',
        ]);

        $validated['user_id'] = Auth::id();

        $event = CalendarEvent::create($validated);

        return response()->json($event, 201);
    }

    /**
     * Get a specific calendar event
     */
    public function show(CalendarEvent $calendarEvent)
    {
        // Check if user owns the event or has access to it
        if ($calendarEvent->user_id !== Auth::id() && 
            !$calendarEvent->sharedUsers()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($calendarEvent);
    }

    /**
     * Update a calendar event
     */
    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        // Check if user owns the event
        if ($calendarEvent->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'type' => 'sometimes|required|in:custom,google_meet,meeting,reminder',
            'meeting_link' => 'nullable|url',
            'color' => 'nullable|string|max:7',
        ]);

        $calendarEvent->update($validated);

        return response()->json($calendarEvent);
    }

    /**
     * Delete a calendar event
     */
    public function destroy(CalendarEvent $calendarEvent)
    {
        // Check if user owns the event
        if ($calendarEvent->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $calendarEvent->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
