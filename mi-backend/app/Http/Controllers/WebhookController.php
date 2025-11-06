<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleNotification(Request $req)
    {
        // Validar header authorization si tienes configurado FEA_AUTH_HEADER
        $expected = config('fea.authorization') ?? env('FEA_AUTH_HEADER');
        if ($expected) {
            $incoming = $req->header('Authorization') ?? $req->header('authorization') ?? $req->header('X-Authorization') ?? $req->header('x-authorization');
            if (!$incoming || trim($incoming) !== trim($expected)) {
                Log::warning('FEA webhook unauthorized', ['incoming' => $incoming]);
                return response('Unauthorized', 401)->header('Content-Type', 'text/plain');
            }
        }

        $payload = $req->all();
        $headers = $req->headers->all();

        Log::info('FEA webhook received', ['payload' => $payload, 'headers' => $headers]);

        // Persistir o notificar al sistema si quieres (broadcast, DB, etc).

        // El servicio FEA exige exactamente la respuesta "OK" como texto plano.
        return response('OK', 200)->header('Content-Type', 'text/plain');
    }
}