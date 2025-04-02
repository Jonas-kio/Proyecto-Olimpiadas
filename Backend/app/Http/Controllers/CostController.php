<?php

namespace App\Http\Controllers;

use App\Models\Cost;
use Illuminate\Http\Request;

class CostController extends Controller
{
    public function index()
    {
        return response()->json(Cost::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|numeric|min:0',
            'area' => 'required|string|max:255',
            'category' => 'required|string|max:255',
        ]);

        return response()->json(Cost::create($request->all()), 201);
    }

    public function update(Request $request, Cost $cost)
    {
        $request->validate([
            'name' => 'string|max:255',
            'value' => 'numeric|min:0',
            'area' => 'string|max:255',
            'category' => 'string|max:255',
        ]);

        $cost->update($request->all());
        return response()->json($cost);
    }

    public function destroy(Cost $cost)
    {
        $cost->delete();
        return response()->json(null, 204);
    }
}