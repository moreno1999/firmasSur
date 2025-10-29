<?php

namespace App\Http\Controllers;

use App\Models\Templates;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TemplateController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        //Admin ve todas, otros solo sus plantilla
        $query = $user->isAdmin()
        ? Template::with('user')
        : Template::where('user_id', $user->id);

        $Templates = $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'name' => 'required|string|max:255',
            'content' => 'required|string',
            'fields' => 'nullable|array',
            'signature_fields' => 'nullable|array',
            'page_size' => 'required|in:letter,oficio',
            'font_size' => 'required|integer|min:8|max:72',
            'title' => 'nullable|string|max:255',
            'title_font_size' => 'nullable|integer|min:8|max:72',
        ]);

        if ($validator->fails()){
            return response()->json($validator->errors(), 422);
        }

        $template = Template::create([
            'user_id' => auth() ->id(),
            ...$request->all()
        ]);

        return response()->json($template, 201);
    }

    public function show($id)
    {

        $template = Template::findOrFail($id);

        //Verificar permisos
        $user = auth()->user();
        if(!$user->isAdmin() && $template->user_id !== $user->id){
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json($template);
    }

    public function update(Request $request,$id)
    {
        $template = Template::findOrFail($id);

        //Verificar permisos
        $user = auth()->user();
        if(!$user->isAdmin() && $template->user_id !== $user->id){
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'fields' => 'nullable|array',
            'signature_fields' => 'nullable|array',
            'page_size' => 'sometimes|required|in:letter,oficio',
            'font_size' => 'sometimes|required|integer|min:8|max:72',
            'title' => 'nullable|string|max:255',
            'title_font_size' => 'nullable|integer|min:8|max:72',
        ]);
        if($validator->fails()){
            return response()->json($validator->errors(), 422);
        }
        $template->update($request->all());

        return response()->json($template);
    }

    public function destroy($id)
    {
        $template = Template::findOrFail($id);

        //Verificar permisos
        $user = auth()->user();
        if(!$user->isAdmin() && $template->user_id !== $user->id){
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $template->delete();

        return response()->json(null, 204);
    }

    public function dashboard()
    {
        $user = auth()->user();

        $stats = [
            'total_templates' => Template::when(!$user->isAdmin(), function($query) use($user){
                return $query->where('user_id', $user->id);
            })->count(),
            'recent_templates' => Template::when(!$user->isAdmin(), function($query) use ($user){
                return $query->where('user_id', $user->id);
            })->latest()->limit(5)->get()
        ];
        return response()->json($stats);
    }
}

