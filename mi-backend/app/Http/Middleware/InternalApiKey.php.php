<php? 

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Farcades\Log;

Class InternalApiKey
{
    /**
     * Comprueba el header X-INTERNAL-API-KEY o Bearer token contra INTERNAL_API_KEY.
     */
    public function handle(Request $request, Closure $next)
    {
        $expected = env('INTERNAL_API_KEY');

        if(!$expected){
            Log::warning('internalApiKey middleware: INTERNAL_API_KEY not set');
            return response()->json(['message' => 'Internal API Key not configured'], 500);
        }
        $incoming = $request->header('X-INTERNAL-API-KEY') ?? $request->bearerToken();
        
        if(!$incoming || $incoming !== $expected){
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
