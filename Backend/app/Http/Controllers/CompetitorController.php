<?php

namespace App\Http\Controllers;

use App\Models\Competitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompetitorController extends Controller
{
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

