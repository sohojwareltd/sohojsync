<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Serve React app at root
Route::view('/', 'react-app')->name('react-app');

// Catch-all to serve React for non-API routes (ensures login page at /)
Route::view('/{path}', 'react-app')
    ->where('path', '^(?!api|storage|vendor|horizon|nova|telescope|_debugbar).*$');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('projects/{project}/tasks', function ($projectId) {
        $project = \App\Models\Project::findOrFail($projectId);
        return Inertia::render('TaskBoard', [
            'project' => $project,
        ]);
    })->name('projects.tasks');
    
    Route::get('chat', function () {
        return Inertia::render('Chat');
    })->name('chat');
});

require __DIR__.'/settings.php';
