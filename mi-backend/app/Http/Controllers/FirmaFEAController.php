<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class FirmaFEAController extends Controller
{
    protected $client;
    protected $base;
    protected $usuario;
    protected $clave;

    public function __construct()
    {
        $this->base = config('fea.base') ?? env('FEA_API_BASE');
        $this->usuario = config('fea.usuario') ?? env('FEA_USER');
        $this->clave = config('fea.clave') ?? env('FEA_PASS');

        $this->client = new Client([
            'base_uri' => $this->base,
            'timeout' => 30,
        ]);
    }

    protected function buildEnvelope(array $params)
    {
        return [
            'request' => [
                'encabezado' => [
                    'usuario' => $this->usuario,
                    'clave' => $this->clave,
                ],
                'parametro' => $params,
            ],
        ];
    }

    protected function postToFEA(string $path, array $params)
    {
        $payload = $this->buildEnvelope($params);

        try {
            $res = $this->client->post($path, [
                'json' => $payload,
            ]);
            $json = json_decode($res->getBody()->getContents(), true);

            Log::info('FEA request', ['path' => $path, 'params_keys' => array_keys($params)]);
            Log::debug('FEA response', ['path' => $path, 'response' => $json]);

            return response()->json($json);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $body = null;
            if ($e->hasResponse()) {
                $body = (string) $e->getResponse()->getBody();
            }
            Log::error('FEA proxy error', ['path' => $path, 'error' => $e->getMessage(), 'body' => $body]);

            return response()->json([
                'estado' => 'FAIL',
                'comentarios' => 'Error interno proxy FEA',
                'errorCode' => 106,
                'detail' => $body,
            ], 500);
        } catch (\Exception $e) {
            Log::error('FEA unexpected error', ['message' => $e->getMessage()]);
            return response()->json([
                'estado' => 'FAIL',
                'comentarios' => 'Error interno proxy FEA',
                'errorCode' => 106,
            ], 500);
        }
    }

    // Métodos expuestos (consultaVigencia, enrolar, obtenerURL, etc.)
    public function consultaVigencia(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'firmantes' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => 'FAIL',
                'comentarios' => 'Request incompleto',
                'errorCode' => 202,
                'errors' => $validator->errors()
            ], 400);
        }

        $params = ['firmantes' => $req->input('firmantes')];
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/consultaVigenciaFEA', $params);
    }

    public function enrolarFirmantes(Request $req)
    {
        $params = $req->all();
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/enrolarFirmanteFEA', $params);
    }

    public function solicitarSegundoFactor(Request $req)
    {
        $params = ['solicitante' => $req->input('solicitante')];
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/solicitarSegundoFactor', $params);
    }

    public function firmarDocumento(Request $req)
    {
        $params = $req->all();
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/firmaMultipleFeaApi', $params);
    }

    public function flujoMinimo(Request $req)
    {
        $params = $req->all();
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/flujoMinimoFEA', $params);
    }

    public function flujoSimple(Request $req)
    {
        $params = $req->all();
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/flujoSimpleFEA', $params);
    }

    public function flujoSecuencial(Request $req)
    {
        $params = $req->all();
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracionFEA/flujoSecuencialFEA', $params);
    }

    public function obtenerDocumentoPorCodigo(Request $req)
    {
        $params = ['codigoTransaccion' => $req->input('codigoTransaccion')];
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracion/obtenerDocumentoPorCodigo', $params);
    }

    public function obtenerEstadoSolicitud(Request $req)
    {
        $params = ['codigoTransaccion' => $req->input('codigoTransaccion')];
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracion/obtenerEstadoSolicitud', $params);
    }

    public function obtenerURL(Request $req)
    {
        $params = [
            'codigoTransaccion' => $req->input('codigoTransaccion'),
            'solicitante' => $req->input('solicitante')
        ];
        return $this->postToFEA('/workflow/rest-services/public/firmaIntegracion/obtenerURL', $params);
    }
}