<?php

namespace App\Http\Controllers\API;

use App\services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest\AuthStoreRequest;
use App\Http\Requests\AuthRequest\AuthLoginRequest;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(AuthLoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        $response = $this->authService->login($credentials);

        return response()->json([
            'success' => $response['success'],
            'message' => $response['message'],
            'user' => $response['user'] ?? null,
            'token' => $response['token'] ?? null,
            'token_type' => $response['token_type'] ?? null,
            'expires_in' => $response['expires_in'] ?? null,
        ], $response['status']);
    }

    public function register(AuthStoreRequest $request)
    {
        [$user, $token] = $this->authService->registerUser($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function logout(): JsonResponse
    {
        $response = $this->authService->logout();

        return response()->json([
            'success' => $response['success'],
            'message' => $response['message'],
        ], 200);
    }

    public function getUser(): JsonResponse
    {
        $user = $this->authService->getUser();

        if ($user) {
            return response()->json($user, 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'User not authenticated',
        ], 401);
    }

    public function crearAdmin()
    {
        $result = $this->authService->createAdmin();

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'user' => $result['user']
            ], 201);
        } else {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'user' => $result['user'] ?? null
            ], 400);
        }
    }
}
