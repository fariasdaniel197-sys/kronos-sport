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
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleCloseSearch = () => {
    setSearchQuery("");
    window.dispatchEvent(new CustomEvent("globalSearch", { detail: "" }));
    setIsSearchOpen(false);
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
      animation: marquee 15s linear infinite;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
      
      {/* MARQUESINA SUPERIOR */}
      <div className="bg-black text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase py-2 overflow-hidden flex">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-4">⚡ ENVÍO GRATIS EN TODA VENEZUELA EN COMPRAS MAYORES A $50</span>
          <span className="mx-4">•</span>
          <span className="mx-4">NUEVA COLECCIÓN DISPONIBLE</span>
          <span className="mx-4">•</span>
          <span className="mx-4">CALZADO Y ROPA DEPORTIVA ORIGINAL</span>
          <span className="mx-4">•</span>
          <span className="mx-4">⚡ ENVÍO GRATIS EN TODA VENEZUELA EN COMPRAS MAYORES A $50</span>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 w-full">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between relative">
          
          {/* 1. LOGOTIPO A LA IZQUIERDA */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-3 py-1">
              <div className="w-9 h-9 bg-black rounded-sm flex items-center justify-center p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <img 
                  src="/logo-icon.png" 
                  alt="Atlanta Isotipo" 
                  className="w-full h-full object-contain filter invert" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-black tracking-tighter uppercase text-black leading-tight">
                  ATLANTA
                </span>
                <span className="text-[7px] font-bold tracking-[0.3em] uppercase text-zinc-400">
                  FLAGSHIP STORE
                </span>
              </div>
            </Link>
          </div>

          {/* 2. CATEGORÍAS Y APARTADOS EN EL CENTRO */}
          <nav className="hidden xl:flex items-center gap-6 h-full">
            <div className="group/hombres h-full flex items-center relative">
              <Link href="/hombres" className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors h-full flex items-center border-b-2 border-transparent group-hover/hombres:border-black">
                Hombres
              </Link>
              <div className="absolute top-full left-0 w-screen max-w-screen-xl bg-white border-t border-zinc-200 shadow-2xl opacity-0 invisible group-hover/hombres:opacity-100 group-hover/hombres:visible transition-all duration-300 -ml-40 px-8 py-10 grid grid-cols-4 gap-12">
                {MEGA_MENU_CATEGORIES.map((col, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">{col.title}</span>
                    <ul className="space-y-4">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link href={`/hombres/${item.toLowerCase().replace(/ \/\/ /g, "-").replace(/ /g, "-")}`} className="text-xs font-medium text-zinc-800 hover:text-black hover:underline underline-offset-4 transition-all">
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/mujeres" className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors h-full flex items-center">
              Mujeres
            </Link>

            <Link href="/accesorios" className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors h-full flex items-center">
              Accesorios
            </Link>

            <Link href="/promociones" className="text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors h-full flex items-center">
              Promociones
            </Link>

            <Link href="/descuentos" className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors h-full flex items-center">
              Descuentos
            </Link>

            <Link href="/marcas" className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors h-full flex items-center">
              Marcas
            </Link>
          </nav>

          {/* 3. ICONOS, CUENTA, BÚSQUEDA Y ACCIONES A LA DERECHA */}
          <div className="flex items-center gap-3 relative">
            
            {/* Opciones de Cuenta (Sesión no iniciada) */}
            {!session ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-black transition-colors py-2">
                  <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden lg:inline">Iniciar Sesión</span>
                </Link>

                <span className="text-zinc-300">|</span>

                <Link href="/register" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-black transition-colors py-2">
                  <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="hidden lg:inline">Registrarse</span>
                </Link>
              </div>
            ) : (
              <Link href="/profile" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-black transition-colors py-2">
                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="hidden lg:inline">{session.user?.name?.split(" ")[0] || "Mi Cuenta"}</span>
              </Link>
            )}

            <span className="text-zinc-300">|</span>

            {/* BOTÓN Y BARRA DE BÚSQUEDA COLOCADOS JUSTO AQUÍ (AL LADO DE INICIAR SESIÓN / CUENTA) */}
            <div className="flex items-center relative">
              <div className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden absolute right-full mr-2 bg-white z-20 ${isSearchOpen ? 'w-[180px] sm:w-[240px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                <div className="relative w-full flex items-center">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar producto..." 
                    className="w-full bg-zinc-100 text-black placeholder-zinc-400 text-xs font-mono uppercase px-3 py-2 border border-zinc-300 focus:outline-none focus:border-black rounded-sm shadow-inner"
                    autoFocus={isSearchOpen}
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (isSearchOpen) {
                    handleCloseSearch();
                  } else {
                    setIsSearchOpen(true);
                  }
                }}
                title={isSearchOpen ? "Cerrar búsqueda" : "Buscar"}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-black transition-colors py-2 cursor-pointer"
              >
                {isSearchOpen ? (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}
                <span className="hidden lg:inline">{isSearchOpen ? "Cerrar" : "Búsqueda"}</span>
              </button>
            </div>

            {/* Carrito (Solo visible si hay sesión) */}
            {session && (
              <>
                <span className="text-zinc-300">|</span>
                <Link href="/cart" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-black transition-colors py-2 relative">
                  <div className="relative">
                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className={`absolute -top-1.5 -right-2 bg-black text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-transform duration-300 ${
                        isAnimating ? "scale-125 bg-orange-600" : "scale-100"
                      }`}>
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">Carrito</span>
                </Link>
              </>
            )}

            {/* BOTÓN DE SALIR */}
            {session && (
              <>
                <span className="text-zinc-300">|</span>
                <button 
                  onClick={handleSignOut} 
                  title="Cerrar Sesión"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors py-2 cursor-pointer relative"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 0H9" />
                  </svg>
                  <span className="hidden lg:inline">Salir</span>

                  {isLoggingOut && (
                    <div className="absolute right-0 top-full mt-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded shadow-2xl whitespace-nowrap z-50 border border-zinc-700 animate-fadeIn">
                      ¡Cerrando sesión... Hasta pronto! 👋
                    </div>
                  )}
                </button>
              </>
            )}

          </div>

        </div>
      </header>
    </>
  );
}