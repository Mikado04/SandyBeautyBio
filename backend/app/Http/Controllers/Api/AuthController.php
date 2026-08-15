<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $donnees = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $utilisateur = User::where('email', $donnees['email'])->first();

        if (! $utilisateur) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 422);
        }

        if (! Hash::check($donnees['password'], $utilisateur->password)) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 422);
        }

        // Un seul jeton actif a la fois : on efface les anciens
        $utilisateur->tokens()->delete();

        $jeton = $utilisateur->createToken('admin')->plainTextToken;

        return response()->json([
            'token' => $jeton,
            'data'  => [
                'id'    => $utilisateur->id,
                'name'  => $utilisateur->name,
                'email' => $utilisateur->email,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function me(Request $request)
    {
        $utilisateur = $request->user();

        return response()->json([
            'data' => [
                'id'    => $utilisateur->id,
                'name'  => $utilisateur->name,
                'email' => $utilisateur->email,
            ],
        ]);
    }
}
