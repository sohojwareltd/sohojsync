<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    /**
     * Get all comments for a task.
     */
    public function index($taskId)
    {
        $task = Task::findOrFail($taskId);
        
        // Get top-level comments with their replies
        $comments = $task->comments()
            ->topLevel()
            ->with(['replies.user'])
            ->get();

        return response()->json($comments);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request, $taskId)
    {
        $task = Task::findOrFail($taskId);
        
        $validated = $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:task_comments,id',
            'mentions' => 'nullable|array',
            'mentions.*' => 'exists:users,id',
        ]);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
            'mentions' => $validated['mentions'] ?? null,
        ]);

        // Send notifications to mentioned users
        if (!empty($validated['mentions'])) {
            foreach ($validated['mentions'] as $userId) {
                if ($userId != Auth::id()) {
                    Notification::create([
                        'user_id' => $userId,
                        'type' => 'task_mention',
                        'title' => 'You were mentioned in a comment',
                        'message' => Auth::user()->name . " mentioned you in task: {$task->title}",
                        'data' => json_encode([
                            'task_id' => $task->id,
                            'comment_id' => $comment->id,
                            'project_id' => $task->project_id,
                        ]),
                    ]);
                }
            }
        }

        // Notify parent comment author if this is a reply
        if ($validated['parent_id'] ?? false) {
            $parentComment = TaskComment::find($validated['parent_id']);
            if ($parentComment && $parentComment->user_id != Auth::id()) {
                Notification::create([
                    'user_id' => $parentComment->user_id,
                    'type' => 'comment_reply',
                    'title' => 'Someone replied to your comment',
                    'message' => Auth::user()->name . " replied to your comment on task: {$task->title}",
                    'data' => json_encode([
                        'task_id' => $task->id,
                        'comment_id' => $comment->id,
                        'parent_comment_id' => $parentComment->id,
                        'project_id' => $task->project_id,
                    ]),
                ]);
            }
        }

        return response()->json($comment->load(['user', 'replies.user']), 201);
    }

    /**
     * Update a comment.
     */
    public function update(Request $request, $taskId, $commentId)
    {
        $comment = TaskComment::where('task_id', $taskId)
            ->where('id', $commentId)
            ->firstOrFail();

        // Check if user owns the comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'mentions' => 'nullable|array',
            'mentions.*' => 'exists:users,id',
        ]);

        $comment->update($validated);

        return response()->json($comment->load(['user', 'replies.user']));
    }

    /**
     * Delete a comment.
     */
    public function destroy($taskId, $commentId)
    {
        $comment = TaskComment::where('task_id', $taskId)
            ->where('id', $commentId)
            ->firstOrFail();

        // Check if user owns the comment or has admin role
        if ($comment->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
