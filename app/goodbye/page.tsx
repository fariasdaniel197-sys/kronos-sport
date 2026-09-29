import Link from "next/link";

export default function GoodbyePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-400 block">
          Pacific Coast
        </span>

        <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-zinc-900">
          ¡Hasta Pronto!
        </h1>

        <div className="w-12 h-0.5 bg-black mx-auto" />

        <p className="text-xs uppercase tracking-widest text-zinc-600 leading-relaxed font-medium">
          Muchas gracias por visitarnos y por ser parte de nuestra comunidad. Valoramos enormemente tu preferencia y esperamos verte de vuelta muy pronto.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block bg-black text-white text-[11px] font-extrabold uppercase tracking-[0.2em] px-8 py-3.5 hover:bg-zinc-800 transition-all shadow-md"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    </div>
  );
}