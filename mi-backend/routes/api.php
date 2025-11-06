<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FirmaFEAController;
use App\Http\Controllers\WebhookController;

// Protege estas rutas con middleware 'internal.apikey'
Route::middleware(['internal.apikey'])->prefix('fea')->group(function () {
    Route::post('consulta-vigencia', [FirmaFEAController::class, 'consultaVigencia']);
    Route::post('enrolar-firmantes', [FirmaFEAController::class, 'enrolarFirmantes']);
    Route::post('solicitar-segundo-factor', [FirmaFEAController::class, 'solicitarSegundoFactor']);
    Route::post('firmar-documento', [FirmaFEAController::class, 'firmarDocumento']);
    Route::post('flujo-minimo', [FirmaFEAController::class, 'flujoMinimo']);
    Route::post('flujo-simple', [FirmaFEAController::class, 'flujoSimple']);
    Route::post('flujo-secuencial', [FirmaFEAController::class, 'flujoSecuencial']);
    Route::post('obtener-documento', [FirmaFEAController::class, 'obtenerDocumentoPorCodigo']);
    Route::post('obtener-estado', [FirmaFEAController::class, 'obtenerEstadoSolicitud']);
    Route::post('obtener-url', [FirmaFEAController::class, 'obtenerURL']);
});

// Webhook pública (FEA llamará aquí)
Route::post('fea/webhook/notificacion', [WebhookController::class, 'handleNotification']);