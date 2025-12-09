<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Mail\ClientCredentialsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index()
    {
        $clients = Client::with('user')->latest()->get();
        
        return response()->json($clients);
    }

    /**
     * Store a newly created client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'website' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);

        // Generate random password
        $password = Str::random(12);

        // Create user account
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'role' => 'client',
        ]);

        // Create client profile
        $client = Client::create([
            'user_id' => $user->id,
            'company' => $request->company,
            'phone' => $request->phone,
            'address' => $request->address,
            'website' => $request->website,
            'notes' => $request->notes,
        ]);

        // Send credentials email
        try {
            Mail::to($user->email)->send(new ClientCredentialsMail($user, $password));
        } catch (\Exception $e) {
            Log::error('Failed to send client credentials email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Client created successfully and credentials sent to email',
            'client' => $client->load('user'),
        ], 201);
    }

    /**
     * Display the specified client.
     */
    public function show(Client $client)
    {
        return response()->json($client->load('user'));
    }

    /**
     * Update the specified client.
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($client->user_id)],
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'website' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);

        // Update user
        $client->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Update client profile
        $client->update([
            'company' => $request->company,
            'phone' => $request->phone,
            'address' => $request->address,
            'website' => $request->website,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Client updated successfully',
            'client' => $client->load('user'),
        ]);
    }

    /**
     * Remove the specified client.
     */
    public function destroy(Client $client)
    {
        $user = $client->user;
        $client->delete();
        $user->delete();

        return response()->json([
            'message' => 'Client deleted successfully',
        ]);
    }
}
