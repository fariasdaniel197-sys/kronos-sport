// components/Footer.tsx
import Link from "next/link";
import { SocialButtons } from "@/components/SocialButtons";

// Rutas apuntando a tu propia carpeta 'public/pagos'
const PAYMENT_METHODS = [
  { name: "Amex", src: "/pagos/amex.png" },
  { name: "Apple Pay", src: "/pagos/apple-pay.png" },
  { name: "Diners Club", src: "/pagos/diners.png" },
  { name: "Discover", src: "/pagos/discover.png" },
  { name: "Google Pay", src: "/pagos/google-pay.png" },
  { name: "Mastercard", src: "/pagos/mastercard.png" },
  { name: "PayPal", src: "/pagos/paypal.png" }, // PayPal integrado
  { name: "Shop Pay", src: "/pagos/shop-pay.png" },
  { name: "Visa", src: "/pagos/visa.png" }
];

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-zinc-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-zinc-800">
          
          {/* LOGO Y DERECHOS */}
          <div className="text-center md:text-left">
            <Link
              href="/"
              className="text-sm font-black uppercase tracking-[0.25em] text-white hover:opacity-80 transition-opacity"
            >
              ATLANTA FLAGSHIP
            </Link>
            <div className="mt-2 text-[10px] text-zinc-400 uppercase tracking-widest font-mono space-y-0.5">
              <p>© {new Date().getFullYear()} ATLANTA ROCK STORE.</p>
              <p className="text-zinc-500">Esta página actualmente se encuentra en desarrollo.</p>
              <p className="text-zinc-500">Todos los derechos reservados.</p>
            </div>
          </div>

          {/* REDES SOCIALES */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Conecta con nosotros
            </span>
            <SocialButtons />
          </div>
        </div>

        {/* NAVEGACIÓN LEGAL, MÉTODOS DE PAGO Y TAGLINE */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Enlaces Legales */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Link href="/terminos" className="hover:text-white transition-colors underline underline-offset-4">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-white transition-colors underline underline-offset-4">
              Privacidad
            </Link>
            <Link href="/envios" className="hover:text-white transition-colors underline underline-offset-4">
              Envíos
            </Link>
          </div>

          {/* Íconos de Métodos de Pago con diseño de "Tarjeta" */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PAYMENT_METHODS.map((method, idx) => (
              <div 
                key={idx} 
                // Este div crea la forma de la tarjeta blanca unificada
                className="bg-white h-6 w-10 sm:h-7 sm:w-11 rounded-[3px] flex items-center justify-center overflow-hidden border border-zinc-200 hover:scale-105 transition-transform drop-shadow-sm"
              >
                <img 
                  src={method.src} 
                  alt={method.name} 
                  // El padding (p-1) asegura que el logo respire dentro de la tarjeta
                  className="h-full w-full object-contain p-1"
                />
              </div>
            ))}
          </div>

          {/* Tagline */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center lg:text-right">
            STREETWEAR & URBAN WEAR
          </span>
          
        </div>
      </div>
    </footer>
  );
}