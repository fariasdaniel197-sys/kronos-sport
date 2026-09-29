export default function TerminosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-zinc-900">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-2">
        Aviso Legal
      </span>
      <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-zinc-200">
        Términos y Condiciones
      </h1>

      <div className="space-y-8 text-xs leading-relaxed text-zinc-700">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            1. Uso de la Plataforma
          </h2>
          <p>
            Al navegar y realizar compras en Pacific Coast (desarrollado por Atlanta Rock Store), aceptas cumplir con nuestros términos de servicio. Nos reservamos el derecho de modificar o actualizar estos términos en cualquier momento sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            2. Precios y Disponibilidad
          </h2>
          <p>
            Todos los precios están expresados en USD. Nos reservamos el derecho de modificar los precios de nuestros productos en cualquier momento, así como de descontinuar artículos sin previo aviso debido a disponibilidad de inventario.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            3. Propiedad Intelectual
          </h2>
          <p>
            Todo el contenido presente en este sitio web, incluyendo logotipos, gráficos, texto, diseños de prendas y código, es propiedad exclusiva de Atlanta Rock Store y está protegido por las leyes de derecho de autor.
          </p>
        </section>
      </div>
    </div>
  );
}