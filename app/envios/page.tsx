export default function EnviosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-zinc-900">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-2">
        Información Logística
      </span>
      <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-zinc-200">
        Políticas de Envío
      </h1>

      <div className="space-y-8 text-xs leading-relaxed text-zinc-700">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            1. Tiempos de Procesamiento
          </h2>
          <p>
            Los pedidos se procesan de 24 a 48 horas hábiles después de confirmado el pago. Recibirás una notificación por correo electrónico una vez que tu paquete haya sido despachado.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            2. Envíos Gratis
          </h2>
          <p>
            Ofrecemos envío estándar gratuito en todas las compras superiores a $75. Para compras de menor valor, la tarifa de envío se calculará automáticamente durante el proceso de pago.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            3. Seguimiento de Pedidos
          </h2>
          <p>
            Puedes revisar el estado de tus entregas en cualquier momento desde la sección de historial de pedidos dentro de tu Perfil de Usuario.
          </p>
        </section>
      </div>
    </div>
  );
}