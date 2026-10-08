import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple almacén en memoria para control de peticiones por IP (Rate Limiting básico)
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>();

// Configuración de límites
const WINDOW_MS = 60 * 1000; // Ventana de 1 minuto
const MAX_REQUESTS_PER_WINDOW = 120; // Máximo de peticiones permitidas por minuto por IP

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();

  // Control de Rate Limiting para mitigar abuso/DDoS a nivel de aplicación
  const clientData = ipRequestCounts.get(ip);
  if (clientData) {
    if (now - clientData.timestamp < WINDOW_MS) {
      clientData.count++;
      if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
        // Bloqueo temporal devolviendo un error HTTP 429 (Too Many Requests)
        return new NextResponse(
          JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo más tarde." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      ipRequestCounts.set(ip, { count: 1, timestamp: now });
    }
  } else {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
  }

  // Obtener la respuesta base
  const response = NextResponse.next();

  // Cabeceras de seguridad estrictas (Security Headers)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );

  return response;
}

// Configurar en qué rutas se aplicará este filtro defensivo
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de la aplicación excepto archivos estáticos e imágenes de Next
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};