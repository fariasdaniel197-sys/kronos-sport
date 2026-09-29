export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-zinc-900">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-2">
        Protección de Datos
      </span>
      <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-zinc-200">
        Política de Privacidad
      </h1>

      <div className="space-y-8 text-xs leading-relaxed text-zinc-700">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            1. Recopilación de Información
          </h2>
          <p>
            Recopilamos la información personal necesaria para procesar tus pedidos y personalizar tu experiencia de compra. Esto incluye tu nombre, correo electrónico, dirección de envío y número telefónico.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            2. Uso de los Datos
          </h2>
          <p>
            Tus datos únicamente se utilizan para la gestión de compras, procesamiento de pagos, entregas físicas y envío de promociones exclusivas (en caso de que hayas aceptado recibirlas). Nunca venderemos ni compartiremos tu información con terceros no autorizados.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            3. Seguridad
          </h2>
          <p>
            Implementamos cifrado SSL y buenas prácticas de desarrollo web para garantizar que todos tus datos personales y transacciones se mantengan confidenciales y protegidos en todo momento.
          </p>
        </section>
      </div>
    </div>
  );
}