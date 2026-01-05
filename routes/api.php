<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController as ApiTaskController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkflowStatusController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']); // Logout doesn't require auth

// Debug route (remove in production)
Route::get('/debug-session', function(Request $request) {
    return response()->json([
        'authenticated' => Auth::check(),
        'user_id' => Auth::id(),
        'session_id' => session()->getId(),
        'session_name' => config('session.cookie'),
        'session_domain' => config('session.domain'),
        'has_session' => $request->hasSession(),
    ]);
});

// Protected routes - require authentication via Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    
    // Project routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/statistics', [ProjectController::class, 'statistics']);
    Route::get('/projects/users-for-assignment', [ProjectController::class, 'getUsersForAssignment']);
    Route::post('/projects/upload-attachment', [ProjectController::class, 'uploadAttachment']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    
    // Task routes (for dashboards - uses simple task model)
    Route::get('/tasks', [ApiTaskController::class, 'index']);
    Route::post('/tasks', [ApiTaskController::class, 'store']);
    Route::get('/tasks/{id}', [ApiTaskController::class, 'show']);
    Route::put('/tasks/{id}', [ApiTaskController::class, 'update']);
    Route::delete('/tasks/{id}', [ApiTaskController::class, 'destroy']);
    
    // Project Task routes with workflow support (for task board)
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
    Route::put('/projects/{project}/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/projects/{project}/tasks/{task}', [TaskController::class, 'destroy']);
    Route::patch('/projects/{project}/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::post('/projects/{project}/tasks/reorder', [TaskController::class, 'reorder']);
    
    // Workflow Status routes
    Route::get('/projects/{project}/workflow-statuses', [WorkflowStatusController::class, 'index']);
    Route::post('/projects/{project}/workflow-statuses', [WorkflowStatusController::class, 'store']);
    Route::put('/projects/{project}/workflow-statuses/{status}', [WorkflowStatusController::class, 'update']);
    Route::delete('/projects/{project}/workflow-statuses/{status}', [WorkflowStatusController::class, 'destroy']);
    Route::post('/projects/{project}/workflow-statuses/reorder', [WorkflowStatusController::class, 'reorder']);
    Route::patch('/projects/{project}/workflow-statuses/{status}/set-default', [WorkflowStatusController::class, 'setDefault']);
    
    // Task Comment routes
    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::put('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);
    
    // Client routes
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::get('/clients/{client}', [ClientController::class, 'show']);
    Route::put('/clients/{client}', [ClientController::class, 'update']);
    Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
    
    // Activity Log routes
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/screen-time-today', [ActivityLogController::class, 'screenTimeToday']);
    Route::get('/activity-logs/statistics', [ActivityLogController::class, 'statistics']);
    
    // Employee routes
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/statistics', [EmployeeController::class, 'statistics']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);
    Route::patch('/employees/{employee}/performance', [EmployeeController::class, 'updatePerformance']);
    Route::patch('/employees/{employee}/promote', [EmployeeController::class, 'promote']);
    
    // Reminder routes
    Route::get('/reminders', [ReminderController::class, 'index']);
    Route::post('/reminders', [ReminderController::class, 'store']);
    Route::get('/reminders/pending-count', [ReminderController::class, 'pendingCount']);
    Route::get('/reminders/{reminder}', [ReminderController::class, 'show']);
    Route::put('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::patch('/reminders/{reminder}/mark-read', [ReminderController::class, 'markAsRead']);
    Route::delete('/reminders/{reminder}', [ReminderController::class, 'destroy']);
    
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Calendar Event routes
    Route::get('/calendar-events', [CalendarEventController::class, 'index']);
    Route::post('/calendar-events', [CalendarEventController::class, 'store']);
    Route::get('/calendar-events/{calendarEvent}', [CalendarEventController::class, 'show']);
    Route::put('/calendar-events/{calendarEvent}', [CalendarEventController::class, 'update']);
    Route::delete('/calendar-events/{calendarEvent}', [CalendarEventController::class, 'destroy']);
    
    // Chat routes
    Route::get('/chat/rooms', [ChatController::class, 'getRooms']);
    Route::get('/chat/rooms/{roomId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/rooms/{roomId}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chat/rooms', [ChatController::class, 'createRoom']);
    Route::post('/chat/rooms/{roomId}/mark-read', [ChatController::class, 'markAsRead']);
    Route::post('/chat/online-status', [ChatController::class, 'updateOnlineStatus']);
    Route::get('/chat/online-users', [ChatController::class, 'getOnlineUsers']);
    Route::get('/chat/team-members', [ChatController::class, 'getTeamMembers']);
    
    // User routes
    Route::get('/users/{id}', [AuthController::class, 'getUserById']);
    Route::get('/users/{id}/projects', [ProjectController::class, 'getUserProjects']);
    Route::get('/users/{id}/tasks', [ApiTaskController::class, 'getUserTasks']);
});
