<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use App\Mail\EmployeeCredentialsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index()
    {
        $employees = Employee::with('user')->latest()->get();
        
        return response()->json($employees);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:developer,project_manager',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'nullable|date',
            'designation' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'emergency_contact' => 'nullable|string|max:20',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120', // 5MB max
            'notes' => 'nullable|string',
        ]);

        // Generate random password
        $password = Str::random(12);

        // Create user account
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'role' => $request->role,
        ]);

        // Handle profile image upload
        $profileImagePath = null;
        if ($request->hasFile('profile_image')) {
            $profileImagePath = $request->file('profile_image')->store('profile_images', 'public');
        }

        // Handle CV upload
        $cvPath = null;
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('cvs', 'public');
        }

        // Create employee profile
        $employee = Employee::create([
            'user_id' => $user->id,
            'profile_image' => $profileImagePath,
            'date_of_birth' => $request->date_of_birth,
            'joining_date' => $request->joining_date ?? now(),
            'cv_path' => $cvPath,
            'designation' => $request->designation,
            'salary' => $request->salary,
            'address' => $request->address,
            'phone' => $request->phone,
            'emergency_contact' => $request->emergency_contact,
            'notes' => $request->notes,
        ]);

        // Send credentials email
        try {
            Mail::to($user->email)->send(new EmployeeCredentialsMail($user, $password));
        } catch (\Exception $e) {
            \Log::error('Failed to send employee credentials email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Employee created successfully and credentials sent to email',
            'employee' => $employee->load('user'),
            'password' => $password, // Return password for admin to share
        ], 201);
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee)
    {
        return response()->json($employee->load('user'));
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($employee->user_id)],
            'role' => 'required|in:developer,project_manager',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'nullable|date',
            'designation' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'emergency_contact' => 'nullable|string|max:20',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'notes' => 'nullable|string',
        ]);

        // Update user
        $employee->user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ]);

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($employee->profile_image) {
                Storage::disk('public')->delete($employee->profile_image);
            }
            $employee->profile_image = $request->file('profile_image')->store('profile_images', 'public');
        }

        // Handle CV upload
        if ($request->hasFile('cv')) {
            // Delete old CV if exists
            if ($employee->cv_path) {
                Storage::disk('public')->delete($employee->cv_path);
            }
            $cvPath = $request->file('cv')->store('cvs', 'public');
            $employee->cv_path = $cvPath;
        }

        // Update employee profile
        $employee->update([
            'date_of_birth' => $request->date_of_birth,
            'joining_date' => $request->joining_date,
            'designation' => $request->designation,
            'salary' => $request->salary,
            'address' => $request->address,
            'phone' => $request->phone,
            'emergency_contact' => $request->emergency_contact,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee->load('user'),
        ]);
    }

    /**
     * Update employee performance metrics.
     */
    public function updatePerformance(Request $request, Employee $employee)
    {
        $request->validate([
            'tasks_completed' => 'nullable|integer|min:0',
            'tasks_rejected' => 'nullable|integer|min:0',
            'client_satisfaction_points' => 'nullable|integer|min:0',
        ]);

        $employee->update($request->only([
            'tasks_completed',
            'tasks_rejected',
            'client_satisfaction_points',
        ]));

        // Recalculate performance score
        $employee->calculatePerformanceScore();

        return response()->json([
            'message' => 'Performance updated successfully',
            'employee' => $employee->fresh()->load('user'),
        ]);
    }

    /**
     * Record a promotion for employee.
     */
    public function promote(Request $request, Employee $employee)
    {
        $request->validate([
            'designation' => 'required|string|max:255',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $employee->update([
            'designation' => $request->designation,
            'salary' => $request->salary ?? $employee->salary,
            'last_promotion_date' => now(),
        ]);

        return response()->json([
            'message' => 'Employee promoted successfully',
            'employee' => $employee->fresh()->load('user'),
        ]);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee)
    {
        // Delete profile image if exists
        if ($employee->profile_image) {
            Storage::disk('public')->delete($employee->profile_image);
        }

        // Delete CV if exists
        if ($employee->cv_path) {
            Storage::disk('public')->delete($employee->cv_path);
        }

        $user = $employee->user;
        $employee->delete();
        $user->delete();

        return response()->json([
            'message' => 'Employee deleted successfully',
        ]);
    }

    /**
     * Get employee statistics.
     */
    public function statistics()
    {
        $total = Employee::count();
        $developers = Employee::whereHas('user', function ($query) {
            $query->where('role', 'developer');
        })->count();
        $managers = Employee::whereHas('user', function ($query) {
            $query->where('role', 'project_manager');
        })->count();

        return response()->json([
            'total_employees' => $total,
            'developers' => $developers,
            'project_managers' => $managers,
            'avg_performance' => Employee::avg('performance_score') ?? 0,
        ]);
    }
}
