<?php


namespace App\Services;

use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Auth;


use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

use App\Enums\UserRoles;

class AuthService
{

    public function registerUser(array $data)
    {
        try {
            DB::beginTransaction();

            if (!isset($data['role'])) {
                $data['role'] = UserRoles::ADMIN->value;
            }

            $user = User::create([
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ]);

            $token = JWTAuth::fromUser($user);

            DB::commit();
            return [$user, $token];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function passwordRecovery($email, array $data)
    {
        try {
            DB::beginTransaction();


            DB::commit();
            return 0;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }


    public function login(array $credentials)
    {
        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return [
                    'success' => false,
                    'message' => 'Credenciales incorrectas',
                    'status' => 401,
                ];
            }

            $user = Auth::user();
            $expiresIn = config('jwt.ttl', 60) * 60;

            return [
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'user' => $user,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => $expiresIn,
                'status' => 200,
            ];
        } catch (JWTException $e) {
            return [
                'success' => false,
                'message' => 'No se pudo crear el token',
                'status' => 500,
            ];
        }
    }

    public function getUser()
    {
        return Auth::user();
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return [
            'success' => true,
            'message' => 'Logged out successfully',
        ];
    }
}
