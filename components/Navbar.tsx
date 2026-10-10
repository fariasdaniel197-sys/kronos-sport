"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

const MEGA_MENU_CATEGORIES = [
  {
    title: "CASUAL",
    items: ["Franelas Básicas", "Franelas Gráficas", "Franelas Oversized", "Suéteres // Chaquetas", "Suéteres Gráficos"]
  },
  {
    title: "SPORT",
    items: ["Chaquetas // Cortavientos", "Chemises", "Joggers", "Franelas", "Mangas Largas", "Shorts"]
  },
  {
    title: "PAWA - PLAYA",
    items: ["Mangas Largas", "Trajes de baño"]
  },
  {
    title: "MAGENTA",
    items: ["Franelas", "Joggers", "Suéteres"]
  }
];

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    window.dispatchEvent(new CustomEvent("globalSearch", { detail: query }));
  };

  const handleSignOut = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      signOut({ callbackUrl: "/goodbye" });
    }, 1000);
  };

  const marqueeStyle = `
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: inline-block;
      white-space: nowrap;
      animation: marquee 18s linear infinite;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
      
      {/* 1. MARQUESINA SUPERIOR */}
      <div className="bg-red-600 text-white text-xs font-black tracking-[0.2em] uppercase py-2.5 overflow-hidden flex shadow-md relative z-50">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-6">⚡ ENVÍO GRATIS EN COMPRAS MAYORES A $50</span>
          <span className="mx-4">•</span>
          <span className="mx-6">⚡ ENVÍO GRATIS EN COMPRAS MAYORES A $50</span>
          <span className="mx-4">•</span>
          <span className="mx-6">⚡ ENVÍO GRATIS EN COMPRAS MAYORES A $50</span>
          <span className="mx-4">•</span>
          <span className="mx-6">⚡ ENVÍO GRATIS EN COMPRAS MAYORES A $50</span>
        </div>
      </div>

      {/* 2. HEADER PRINCIPAL */}
      <header className="sticky top-0 z-40 bg-[#121212] text-white border-b border-zinc-800 w-full shadow-xl">
        <div className="max-w-screen-2xl mx-auto px-6 h-24 flex items-center justify-between gap-6">
          
          {/* Logo Estilizado KRONOS */}
          <div className="flex items-center min-w-[160px]">
            <Link href="/" className="group flex items-center gap-3 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="145" height="42">
                <g transform="translate(2, 2)">
                  <rect x="0" y="0" width="4" height="42" fill="#ffffff" rx="1"/>
                  <path d="M4 21L20 4H26L10 23Z" fill="#ea580c"/>
                  <path d="M10 21L26 42H20L4 23Z" fill="#ffffff"/>
                </g>
                <text x="42" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="19" fill="#ffffff" letterSpacing="2.5">
                  KRONOS
                </text>
                <text x="43" y="40" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9" fill="#ea580c" letterSpacing="5">
                  SPORT
                </text>
              </svg>
            </Link>
          </div>

          {/* Menú Central de Categorías */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            <div 
              className="group/hombres h-full flex items-center relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <Link href="/hombres" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent group-hover/hombres:border-red-600">
                Hombre
              </Link>
              
              {isMegaMenuOpen && (
                <div className="absolute top-full left-0 w-screen max-w-screen-xl bg-white text-black border-t border-zinc-200 shadow-2xl px-8 py-10 grid grid-cols-4 gap-12 -ml-40 z-50">
                  {MEGA_MENU_CATEGORIES.map((col, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">{col.title}</span>
                      <ul className="space-y-4">
                        {col.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link 
                              href={`/hombres/${item.toLowerCase().replace(/ \/\/ /g, "-").replace(/ /g, "-")}`} 
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="text-xs font-medium text-zinc-800 hover:text-black hover:underline underline-offset-4 transition-all"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/mujeres" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors h-full flex items-center">
              Mujer
            </Link>

            <Link href="/ninos" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors h-full flex items-center">
              Niños
            </Link>

            <Link href="/accesorios" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors h-full flex items-center">
              Accesorios
            </Link>

            <Link href="/novedades" className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors h-full flex items-center">
              Novedades
            </Link>

            <Link href="/descuentos" className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors h-full flex items-center">
              Descuentos
            </Link>
          </nav>

          {/* Barra de Búsqueda Funcional */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Busca productos..." 
                className="w-full bg-white text-black placeholder-zinc-500 text-xs font-medium uppercase px-4 py-2.5 pr-10 rounded-full focus:outline-none shadow-inner"
              />
              <svg className="w-5 h-5 text-red-600 absolute right-3.5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          {/* Acciones de Cuenta, Sesión y Carrito a la Derecha */}
          <div className="flex items-center gap-5 relative z-50">
            
            {!session ? (
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <Link href="/login" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors py-2">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden xl:inline">Iniciar Sesión</span>
                </Link>

                <span className="text-zinc-600">|</span>

                <Link href="/register" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors py-2">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="hidden xl:inline">Registrarse</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <Link href="/profile" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors py-2">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>{session.user?.name?.split(" ")[0] || "Mi Cuenta"}</span>
                </Link>
              </div>
            )}

            <span className="text-zinc-600">|</span>

            {/* Carrito */}
            <Link href="/cart" className="relative flex items-center text-zinc-300 hover:text-white transition-colors py-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-2 bg-red-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold transition-transform duration-300 ${
                  isAnimating ? "scale-125" : "scale-100"
                }`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Botón Salir */}
            {session && (
              <>
                <span className="text-zinc-600">|</span>
                <button onClick={handleSignOut} className="text-red-500 hover:text-red-400 transition-colors py-2 cursor-pointer" title="Cerrar Sesión">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 0H9" />
                  </svg>
                </button>
              </>
            )}

          </div>

        </div>
      </header>

      {/* 3. BARRA INFERIOR DE GARANTÍAS Y CONFIANZA */}
      <div className="bg-[#f4f4f5] border-b border-zinc-300 py-4 px-6 text-zinc-900 shadow-inner relative z-30">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-300">
          
          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
            <svg className="w-8 h-8 text-black shrink-0 stroke-[1.7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-black">Compra segura</p>
              <p className="text-[11px] text-zinc-600 font-medium">y confiable</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
            <svg className="w-8 h-8 text-black shrink-0 stroke-[1.7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h4" />
            </svg>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-black">Pagos seguros</p>
              <p className="text-[11px] text-zinc-600 font-medium">múltiples métodos</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
            <svg className="w-8 h-8 text-black shrink-0 stroke-[1.7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-black">Productos 100% originales</p>
              <p className="text-[11px] text-zinc-600 font-medium">certificación auténtica</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
            <svg className="w-8 h-8 text-black shrink-0 stroke-[1.7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-black">Certificación de productos</p>
              <p className="text-[11px] text-zinc-600 font-medium">máxima calidad garantizada</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}