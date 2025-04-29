<?php

namespace App\Http\Middleware;

use App\Enums\UserRoles;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */


    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if ($user && $user->role === UserRoles::ADMIN) {
            return $next($request);
        } else {
            return response()->json(['message' => 'You are not ADMIN!'], 403);
        }
    }
}
