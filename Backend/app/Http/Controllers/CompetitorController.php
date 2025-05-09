<?php

namespace App\Http\Controllers;

use App\Models\Competitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Competidores",
 *     description="API Endpoints para gestión de competidores"
 * )
 */
class CompetitorController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/inscripcion/competidor",
     *     tags={"Competidores"},
     *     summary="Registrar nuevo competidor",
     *     description="Registra un nuevo competidor en el sistema",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombres","apellidos","documento_identidad","fecha_nacimiento","curso","correo_electronico","colegio"},
     *             @OA\Property(property="nombres", type="string", example="Juan"),
     *             @OA\Property(property="apellidos", type="string", example="Pérez"),
     *             @OA\Property(property="documento_identidad", type="string", example="12345678"),
     *             @OA\Property(property="fecha_nacimiento", type="string", format="date", example="2010-01-01"),
     *             @OA\Property(property="curso", type="string", example="4to de Secundaria"),
     *             @OA\Property(property="correo_electronico", type="string", format="email", example="juan@ejemplo.com"),
     *             @OA\Property(property="colegio", type="string", example="Colegio San Francisco")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Competidor registrado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Competidor registrado exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Competitor")
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
            'documento_identidad' => 'required|string|max:20|unique:competitor',
            'provincia' => 'required|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'curso' => 'required|string|max:100',
            'correo_electronico' => 'required|email|unique:competitor',
            'colegio' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $competitor = Competitor::create($request->all());

        return response()->json([
            'message' => 'Competidor registrado exitosamente',
            'data' => $competitor
        ], 201);
    }
}

