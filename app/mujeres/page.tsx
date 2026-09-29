"use client";

import Link from "next/link";

export default function MujeresNoticePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full my-auto text-center space-y-8 py-16">
        
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neutral-400 block">
            Comunicado Oficial • Vault Store
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Colección Femenina Próximamente
          </h1>
        </div>

        <div className="w-16 h-[2px] bg-black mx-auto" />

        <div className="space-y-4 text-xs md:text-sm uppercase font-mono tracking-wider text-neutral-600 leading-relaxed max-w-xl mx-auto">
          <p>
            Estimados clientes y entusiastas de la marca, les informamos que en estos momentos nuestras operaciones comerciales se encuentran enfocadas de manera exclusiva en el catálogo y equipamiento para caballeros.
          </p>
          <p className="text-black font-bold">
            Próximamente estaremos incorporando novedades, colecciones cápsula y prendas exclusivas diseñadas para mujeres.
          </p>
          <p className="text-[11px] text-neutral-400 normal-case">
            Agradecemos su comprensión y fidelidad hacia nuestra marca.
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
        Vault Store C.A. • Todos los derechos reservados.
      </footer>
    </div>
  );
}