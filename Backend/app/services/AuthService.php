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
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class AuthService
{

    public function createAdmin(array $data)
    {
        try {
            DB::beginTransaction();

            $adminData = $data ?? [];
            if (empty($adminData['full_name']) || empty($adminData['email']) || empty($adminData['password'])) {
                return [
                    'success' => false,
                    'message' => 'Los datos del administrador son incompletos',
                ];
            }

            $existingUser = User::where('email', $adminData['email'])->first();
            if ($existingUser) {
                return [
                    'success' => false,
                    'message' => 'Ya existe un usuario con ese correo electrónico',
                    'user' => $existingUser
                ];
            }

            $adminCount = User::where('role', UserRoles::ADMIN->value)->count();
            if ($adminCount > 0) {
                return [
                    'success' => false,
                    'message' => 'Ya existe al menos un administrador en el sistema',
                    'adminExists' => true
                ];
            }

            $admin = User::create([
                'full_name' => $adminData['full_name'],
                'email' => $adminData['email'],
                'password' => Hash::make($adminData['password']),
                'role' => UserRoles::ADMIN->value,
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Administrador creado exitosamente',
                'user' => $admin
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Error al crear administrador: ' . $e->getMessage()
            ];
        }
    }

    public function registerUser(array $data)
    {
        try {
            DB::beginTransaction();

            if (!isset($data['role'])) {
                $data['role'] = UserRoles::USER->value;
            }

            $user = User::create([
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ]);
            //$user->sendEmailVerificationNotification();

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


    public function verifyEmail(EmailVerificationRequest $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'El correo ya ha sido verificado.'
            ]);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return response()->json([
            'message' => 'Correo verificado exitosamente'
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return [
                    'success' => false,
                    'message' => 'El correo ya ha sido verificado.',
                    'status' => 400
                ];
            }

            $request->user()->sendEmailVerificationNotification();

            return [
                'success' => true,
                'message' => 'Link de verificación reenviado exitosamente',
                'status' => 200
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al reenviar el email de verificación: ' . $e->getMessage(),
                'status' => 500
            ];
        }
    }
}
