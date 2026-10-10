"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

const CATEGORIES = [
  { name: "Calzado", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800", href: "/categoria/calzado" },
  { name: "Hoodies/Sweater", image: "https://m.media-amazon.com/images/I/51T195j3PGL._AC_SX679_.jpg", href: "/categoria/hoodies" },
  { name: "Franelas/T-Shirts", image: "https://m.media-amazon.com/images/I/61p0xqHe3fL._AC_SX679_.jpg", href: "/categoria/franelas" },
  { name: "Accesorios", image: "https://m.media-amazon.com/images/I/71iISnErSrL._AC_SX679_.jpg", href: "/categoria/accesorios" },
];

const BRANDS = [
  { name: "Adidas", logo: "/logos/adidas.png" },
  { name: "Under Armour", logo: "/logos/under-armour.png" },
  { name: "Puma", logo: "/logos/puma.png" },
  { name: "Nike", logo: "/logos/nike.png" },
];

export default function HomePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const searchParams = useSearchParams();
  const loginSuccessParam = searchParams.get("loginSuccess");
  const [showLoginBanner, setShowLoginBanner] = useState(!!loginSuccessParam);

  const [sportsProducts, setSportsProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const phoneNumber = "584120298624";
  const defaultWhatsAppMessage = "¡Hola! Vengo de Kronos Rock Store y quiero información sobre un producto o talla.";

  const handleOpenWhatsAppChat = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultWhatsAppMessage)}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (loginSuccessParam) {
      const timer = setTimeout(() => setShowLoginBanner(false), 5500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccessParam]);

  useEffect(() => {
    const loadProductsFromDB = async () => {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        
        if (data.success && Array.isArray(data.products)) {
          setSportsProducts(data.products);
        } else {
          setSportsProducts([]);
        }
      } catch (err) {
        console.error("Error al conectar con la API de productos:", err);
        setSportsProducts([]);
      }
    };

    loadProductsFromDB();

    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
      loadProductsFromDB();
    };

    window.addEventListener("globalSearch", handleGlobalSearch as EventListener);
    window.addEventListener("storage", loadProductsFromDB);

    return () => {
      window.removeEventListener("globalSearch", handleGlobalSearch as EventListener);
      window.removeEventListener("storage", loadProductsFromDB);
    };
  }, []);

  const filteredProducts = sportsProducts.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const nameMatch = product.name?.toLowerCase().includes(query);
    const categoryMatch = product.category?.toLowerCase().includes(query);
    const brandMatch = product.brand?.toLowerCase().includes(query);
    const descMatch = product.description?.toLowerCase().includes(query);

    return nameMatch || categoryMatch || brandMatch || descMatch;
  });

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white relative">
      
      {showLoginBanner && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-lg animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="bg-neutral-900 text-white border-2 border-orange-500 p-5 rounded-lg shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-orange-500 text-black font-black flex items-center justify-center rounded-md shadow-md text-lg flex-shrink-0 animate-bounce">
                ✓
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">¡Sesión Iniciada con Éxito!</p>
                <p className="text-[11px] text-neutral-300 font-mono mt-0.5">Bienvenido de nuevo a Kronos Store. Tu cuenta está activa.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowLoginBanner(false)} 
              className="relative z-10 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider transition rounded cursor-pointer border border-neutral-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION DIVIDIDO EN 3: 2 IMÁGENES Y 1 VIDEO EN MOVIMIENTO */}
      {!searchQuery && (
        <section className="relative w-full h-[85vh] bg-neutral-950 grid grid-cols-1 lg:grid-cols-3 gap-2 p-2 overflow-hidden">
          
          {/* 1. Imagen Lateral Izquierda */}
          <div className="relative hidden lg:block h-full overflow-hidden group rounded-sm">
            <img 
              src="/imagen-izquierda.jpg"
              alt="Colección Izquierda" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-8 left-8 right-8 text-white z-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 font-bold block mb-1">Entrenamiento</span>
              <h3 className="text-xl font-black uppercase tracking-tight">Rendimiento Extremo</h3>
            </div>
          </div>

          {/* 2. Video en Movimiento Central con tipografía mejor integrada */}
          <div className="relative h-full overflow-hidden group rounded-sm flex items-center justify-center bg-black">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            >
              <source src="/video-hero.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
            
            {/* Capa de degradado profesional para integrar los textos sobre el video */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 backdrop-blur-[0.5px]" />

            {/* Contenido de Texto y Botones Centrados y Pulidos */}
            <div className="relative z-10 text-center text-white px-6 flex flex-col items-center max-w-lg mx-auto">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-orange-400 font-bold mb-3 px-3 py-1 bg-black/40 border border-orange-500/30 rounded-full">
                Professional Tech-Wear
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-[1.1] drop-shadow-md">
                Nueva Colección <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Alto Rendimiento</span>
              </h1>
              <p className="text-xs md:text-sm font-mono uppercase tracking-[0.2em] mb-8 text-neutral-300/90 drop-shadow">
                Diseño técnico para entrenar sin límites.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="#catalogo" className="bg-white text-black text-xs font-black uppercase tracking-[0.2em] px-8 py-3.5 hover:bg-neutral-200 transition-colors w-full sm:w-auto text-center shadow-2xl rounded-sm">
                  Comprar Ahora
                </Link>
                <Link href="/coleccion" className="bg-black/40 backdrop-blur-md border border-white/40 text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-3.5 hover:bg-white hover:text-black transition-all w-full sm:w-auto text-center shadow-2xl rounded-sm">
                  Ver Colección
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Imagen Lateral Derecha */}
          <div className="relative hidden lg:block h-full overflow-hidden group rounded-sm">
            <img 
              src="/imagen-derecha.jpg" 
              alt="Colección Derecha" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-8 left-8 right-8 text-white z-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 font-bold block mb-1">Estilo Urbano</span>
              <h3 className="text-xl font-black uppercase tracking-tight">K-Sport Drop</h3>
            </div>
          </div>

        </section>
      )}

      {/* CATEGORÍAS */}
      {!searchQuery && (
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Equipamiento Profesional</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">Categorías Principales</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map((cat, index) => (
              <Link 
                key={index} 
                href={cat.href} 
                className="group relative aspect-[4/5] bg-zinc-900 rounded-lg overflow-hidden flex flex-col justify-end p-6 shadow-md hover:shadow-2xl transition-all duration-500 ease-out"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-85 group-hover:scale-110 group-hover:opacity-100 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                
                <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase mb-1 block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Ver Colección →
                  </span>
                  <span className="text-white text-xl md:text-2xl font-black uppercase tracking-wider block leading-none">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <main id="catalogo" className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              {searchQuery ? `Resultados de búsqueda: "${searchQuery}"` : "Nuevos Ingresos"}
            </h2>
            {searchQuery && (
              <p className="text-xs font-mono text-zinc-500 mt-1 uppercase">
                Se encontraron {filteredProducts.length} producto(s)
              </p>
            )}
          </div>
          <Link href="/productos" className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 mt-4 md:mt-0 transition-colors">
            Ver Todo El Catálogo
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-zinc-200 rounded-sm bg-zinc-50">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">No hay productos disponibles en el inventario actual.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                window.dispatchEvent(new CustomEvent("globalSearch", { detail: "" }));
              }} 
              className="text-xs font-black uppercase tracking-widest underline cursor-pointer mt-2"
            >
              Recargar catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                
                <Link href={`/product/${product.id}`} className="relative aspect-[4/5] w-full bg-zinc-100 overflow-hidden mb-4 cursor-pointer block">
                  {product.badge && (
                    <span className={`absolute top-0 left-0 z-10 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 ${product.badge === 'Oferta' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                      {product.badge}
                    </span>
                  )}
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />
                </Link>

                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1 block">
                      {product.brand ? `${product.brand} • ` : ""}{product.category}
                    </span>
                    <Link href={`/product/${product.id}`} className="text-sm font-bold uppercase tracking-tight text-black mb-2 line-clamp-1 hover:underline">
                      {product.name}
                    </Link>
                  </div>
                  
                  <div className="mt-2 space-y-3">
                    <span className="text-sm font-black tracking-tight text-black block">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <section className="border-t border-gray-200 py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-12">Distribuidores Autorizados de Marcas Globales • Calidad 100% Verificada</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {BRANDS.map((brand, idx) => (
              <div key={idx} className="flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300">
                <img src={brand.logo} alt={brand.name} className="max-h-8 md:max-h-12 w-auto object-contain filter brightness-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        {isWhatsAppOpen && (
          <div className="mb-3 w-72 bg-white text-black rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="bg-black text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Atención al Cliente</p>
                  <p className="text-[10px] text-zinc-400">Kronos Sport</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWhatsAppOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-zinc-50 text-xs text-zinc-700 space-y-3">
              <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                <p className="font-bold text-black mb-1">¡Hola! 👋</p>
                <p>¿Tienes dudas con tu pedido, tallas o métodos de pago? Escríbenos directamente.</p>
              </div>
              <button
                onClick={handleOpenWhatsAppChat}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.25.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Iniciar Chat en Vivo
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative cursor-pointer"
          aria-label="Abrir WhatsApp"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.25.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}