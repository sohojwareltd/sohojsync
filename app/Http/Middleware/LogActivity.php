<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users
        if ($request->user()) {
            $this->logActivity($request);
        }

        return $response;
    }

    /**
     * Log the activity
     */
    protected function logActivity(Request $request): void
    {
        try {
            $user = $request->user();
            $method = $request->method();
            $path = $request->path();
            
            // Determine action based on HTTP method
            $action = match($method) {
                'POST' => 'create',
                'PUT', 'PATCH' => 'update',
                'DELETE' => 'delete',
                default => 'view',
            };

            // Extract model from path (e.g., /api/projects/1 -> Project)
            $pathParts = explode('/', $path);
            $model = null;
            $modelId = null;
            
            if (isset($pathParts[1])) {
                $model = ucfirst(rtrim($pathParts[1], 's')); // Remove 's' and capitalize
                if (isset($pathParts[2]) && is_numeric($pathParts[2])) {
                    $modelId = $pathParts[2];
                }
            }

            // Generate description
            $description = $this->generateDescription($action, $model, $user->name);

            ActivityLog::create([
                'user_id' => $user->id,
                'user_role' => $user->role ?? 'client',
                'action' => $action,
                'model' => $model,
                'model_id' => $modelId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'event_type' => $method . ' ' . $path,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to log activity: ' . $e->getMessage());
        }
    }

    /**
     * Generate human-readable description
     */
    protected function generateDescription(string $action, ?string $model, string $userName): string
    {
        $actionText = match($action) {
            'create' => 'created',
            'update' => 'updated',
            'delete' => 'deleted',
            default => 'viewed',
        };

        if ($model) {
            return "{$userName} {$actionText} a {$model}";
        }

        return "{$userName} performed {$action} action";
    }
}
