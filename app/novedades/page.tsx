"use client";

import Link from "next/link";

export default function NovedadesNoticePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full my-auto text-center space-y-8 py-16">
        
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neutral-400 block">
            Comunicado Oficial • Kronos Sport
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Próximas Gotas y Lanzamientos
          </h1>
        </div>

        <div className="w-16 h-[2px] bg-black mx-auto" />

        <div className="space-y-4 text-xs md:text-sm uppercase font-mono tracking-wider text-neutral-600 leading-relaxed max-w-xl mx-auto">
          <p>
            Nuestra sección de novedades se está preparando para recibir las próximas colecciones cápsula de edición limitada y piezas de alto impacto.
          </p>
          <p className="text-black font-bold">
            Estamos seleccionando minuciosamente el próximo lote de equipamiento global para asegurar el nivel de exclusividad que caracteriza a nuestra comunidad.
          </p>
          <p className="text-[11px] text-neutral-400 normal-case">
            Mantente atento a nuestras actualizaciones para ser de los primeros en acceder a los nuevos drops.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-block bg-black text-white px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
          >
            Volver a la Tienda Principal
          </Link>
        </div>

      </div>

      <footer className="text-center text-[10px] font-mono uppercase tracking-widest text-neutral-400 border-t border-neutral-100 pt-8">
        Kronos Sport C.A. • Todos los derechos reservados.
      </footer>
    </div>
  );
}