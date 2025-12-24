<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('LegacyApp');
})->name('home');

// Catch-all route for legacy SPA routes (admin/*, manager/*, developer/*, client/*)
Route::get('/{any}', function () {
    return Inertia::render('LegacyApp');
})->where('any', '(admin|manager|developer|client|login).*');

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
