<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Tutores",
 *     description="API Endpoints para gestión de tutores"
 * )
 */
class TutorController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/inscripcion/tutor",
     *     tags={"Tutores"},
     *     summary="Registrar nuevo tutor",
     *     description="Registra un nuevo tutor en el sistema",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombres","apellidos","documento_identidad","telefono","correo_electronico","direccion"},
     *             @OA\Property(property="nombres", type="string", example="María"),
     *             @OA\Property(property="apellidos", type="string", example="González"),
     *             @OA\Property(property="documento_identidad", type="string", example="87654321"),
     *             @OA\Property(property="telefono", type="string", example="77712345"),
     *             @OA\Property(property="correo_electronico", type="string", format="email", example="maria@ejemplo.com"),
     *             @OA\Property(property="direccion", type="string", example="Av. Principal #123"),
     *             @OA\Property(
     *                 property="competidores",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="es_principal", type="boolean", example=true),
     *                     @OA\Property(property="relacion", type="string", example="madre")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tutor registrado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tutor registrado exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Tutor")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error de validación"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'correo_electronico' => 'required|email',
            'telefono' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tutor = Tutor::create($request->all());

        return response()->json([
            'message' => 'Tutor registrado exitosamente',
            'data' => $tutor
        ], 201);
    }
}

