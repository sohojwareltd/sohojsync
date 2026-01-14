<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        // Filter by user role
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('user_role', $request->role);
        }

        // Filter by action
        if ($request->has('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search by description
        if ($request->has('search') && $request->search) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $logs = $query->paginate(50);

        return response()->json($logs);
    }

    /**
     * Get activity statistics
     */
    public function statistics()
    {
        $stats = [
            'total_activities' => ActivityLog::count(),
            'today_activities' => ActivityLog::whereDate('created_at', today())->count(),
            'by_role' => ActivityLog::selectRaw('user_role, COUNT(*) as count')
                ->groupBy('user_role')
                ->get(),
            'by_action' => ActivityLog::selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get the authenticated user's screen time for today.
     */
    public function screenTimeToday(Request $request)
    {
        $userId = $request->user()?->id;

        if (!$userId) {
            return response()->json([
                'screen_time_seconds' => 0,
                'formatted' => '0m',
            ]);
        }

        $today = now()->toDateString();
        
        $seconds = (int) ActivityLog::where('user_id', $userId)
            ->where('event_type', 'screen_time')
            ->whereDate('created_at', $today)
            ->sum('screen_time');

        // Log debug info
        $totalLogs = ActivityLog::where('user_id', $userId)
            ->whereDate('created_at', $today)
            ->count();

        \Log::debug('[ScreenTime Debug]', [
            'user_id' => $userId,
            'today' => $today,
            'total_logs' => $totalLogs,
            'screen_time_logs' => ActivityLog::where('user_id', $userId)
                ->where('event_type', 'screen_time')
                ->whereDate('created_at', $today)
                ->count(),
            'total_seconds' => $seconds,
        ]);

        return response()->json([
            'screen_time_seconds' => $seconds,
            'formatted' => $this->formatSeconds($seconds),
        ]);
    }

    /**
     * Track screen time - receives duration from frontend.
     */
    public function trackScreenTime(Request $request)
    {
        $validated = $request->validate([
            'duration' => 'required|integer|min:1|max:7200',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        \Log::debug('[ScreenTime Track]', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'duration' => $validated['duration'],
            'timestamp' => now()->toDateTimeString(),
        ]);

        $log = ActivityLog::create([
            'user_id' => $user->id,
            'user_role' => $user->role ?? 'client',
            'action' => 'active',
            'model' => null,
            'model_id' => null,
            'description' => "{$user->name} was active on the platform",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'event_type' => 'screen_time',
            'screen_time' => $validated['duration'],
        ]);

        return response()->json(['success' => true, 'log_id' => $log->id]);
    }

    protected function formatSeconds(int $seconds): string
    {
        if ($seconds <= 0) {
            return '0m';
        }

        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);

        if ($hours > 0 && $minutes > 0) {
            return sprintf('%dh %dm', $hours, $minutes);
        }

        if ($hours > 0) {
            return sprintf('%dh', $hours);
        }

        return sprintf('%dm', $minutes);
    }
}
