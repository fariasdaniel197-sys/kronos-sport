export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-zinc-900 font-sans">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-2">
        Privacidad y Confidencialidad
      </span>
      <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-zinc-200">
        Política de Privacidad
      </h1>

      <div className="space-y-8 text-xs leading-relaxed text-zinc-700">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            1. Recopilación y Tratamiento de Información
          </h2>
          <p>
            En <strong>Kronos Rock Store C.A.</strong> recopilamos únicamente los datos de carácter personal estrictamente necesarios para procesar pedidos de manera eficiente, gestionar registros de usuarios y optimizar la experiencia de navegación en nuestra plataforma. Esto comprende información como nombre completo, correo electrónico, direcciones de envío y números de contacto.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            2. Finalidad y Uso de los Datos
          </h2>
          <p>
            La información suministrada se destina exclusivamente al cumplimiento de transacciones comerciales, validación de pagos, logística de despachos y comunicaciones informativas o promocionales autorizadas previamente por el titular. Garantizamos que bajo ninguna circunstancia comercializaremos, cederemos ni divulgaremos su información a terceros no autorizados.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            3. Protocolos de Seguridad y Cifrado
          </h2>
          <p>
            Implementamos estrictas medidas de seguridad técnica a nivel de infraestructura y aplicación —incluyendo protocolos de cifrado SSL y controles de acceso basados en normativas de desarrollo defensivo— para salvaguardar todos sus registros personales y garantizar la total confidencialidad de sus operaciones.
          </p>
        </section>
      </div>
    </div>
  );
}