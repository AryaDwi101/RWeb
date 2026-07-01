<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Pastikan user yang login memiliki salah satu peran yang diizinkan.
     * Pemakaian di route: ->middleware('role:admin,kasir')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Belum login.'], 401);
        }

        if (! empty($roles) && ! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Akses ditolak untuk peran "' . $user->role . '".',
            ], 403);
        }

        return $next($request);
    }
}
