<?php

namespace App\Http\Controllers\API;

use App\services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest\AuthStoreRequest;
use App\Http\Requests\AuthRequest\AuthLoginRequest;

/**
 * @OA\Tag(
 *     name="Autenticación",
 *     description="Endpoints para autenticación de usuarios"
 * )
 */
class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     tags={"Autenticación"},
     *     summary="Iniciar sesión",
     *     description="Iniciar sesión y obtener token JWT",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@ejemplo.com"),
     *             @OA\Property(property="password", type="string", format="password", example="123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales incorrectas"
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/register",
     *     tags={"Autenticación"},
     *     summary="Registrar usuario",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Juan Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@ejemplo.com"),
     *             @OA\Property(property="password", type="string", format="password", example="123456"),
     *             @OA\Property(property="password_confirmation", type="string", example="123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario registrado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     tags={"Autenticación"},
     *     summary="Cerrar sesión",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Sesión cerrada exitosamente"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function logout(): JsonResponse
    {
        $response = $this->authService->logout();

        return response()->json([
            'success' => $response['success'],
            'message' => $response['message'],
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/me",
     *     tags={"Autenticación"},
     *     summary="Obtener usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del usuario autenticado",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/crear-admin",
     *     tags={"Autenticación"},
     *     summary="Crear usuario administrador",
     *     description="Crea un usuario con rol de administrador en el sistema",
     *     @OA\Response(
     *         response=201,
     *         description="Administrador creado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Usuario administrador creado exitosamente"),
     *             @OA\Property(
     *                 property="user",
     *                 ref="#/components/schemas/User"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error al crear el administrador",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error al crear el administrador")
     *         )
     *     )
     * )
     */
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
