"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

export default function HomePage() {
  const [sportsProducts, setSportsProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = () => {
      const storedProds = localStorage.getItem("vault_store_products");
      
      if (storedProds) {
        setSportsProducts(JSON.parse(storedProds));
      } else {
        const defaultProds = [
          { 
            id: "p1", 
            name: "HOODIE OVERSIZED CLASSIC", 
            category: "HOODIES/SWEATER", 
            brand: "Nike", 
            price: 48, 
            stock: 15, 
            sizes: ["S", "M", "L", "XL"], 
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600&h=750", 
            badge: "Nuevo" 
          },
          { 
            id: "p2", 
            name: "FRANELA SPORTSTYLE", 
            category: "FRANELAS/T-SHIRTS", 
            brand: "Adidas", 
            price: 32, 
            stock: 20, 
            sizes: ["M", "L", "XL"], 
            image: "https://m.media-amazon.com/images/I/61p0xqHe3fL._AC_SX679_.jpg" 
          },
          { 
            id: "p3", 
            name: "ZAPATILLAS GALAXY 8 W", 
            category: "CALZADO", 
            brand: "Under Armour", 
            price: 149, 
            stock: 10, 
            sizes: ["39", "40", "41", "42"], 
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600&h=750", 
            badge: "Top Ventas" 
          },
          { 
            id: "p4", 
            name: "FRANELA DRY-FIT PRO", 
            category: "FRANELAS/T-SHIRTS", 
            brand: "Puma", 
            price: 29, 
            stock: 25, 
            sizes: ["S", "M", "L", "XL"], 
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600&h=750" 
          },
          { 
            id: "ua-freedom-flag-01", 
            name: "UNDER ARMOUR FREEDOM FLAG T-SHIRT", 
            category: "FRANELAS/T-SHIRTS", 
            brand: "Under Armour", 
            price: 28.00, 
            stock: 25, 
            sizes: ["S", "M", "L", "XL", "XXL"], 
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600&h=750", 
            description: "Camiseta de tejido mezcla súper suave de algodón y poliéster con gráfico clásico de bandera patriótica.",
            badge: "Popular" 
          },
          { 
            id: "ua-freedom-flag-02", 
            name: "UNDER ARMOUR FREEDOM FLAG GRADIENT T-SHIRT", 
            category: "FRANELAS/T-SHIRTS", 
            brand: "Under Armour", 
            price: 30.00, 
            stock: 20, 
            sizes: ["S", "M", "L", "XL", "XXL"], 
            image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600&h=750", 
            description: "Edición con gráfico degradado de la bandera. Confeccionada con tejido de alto rendimiento.",
            badge: "Nuevo" 
          },
          { 
            id: "ua-freedom-flag-03", 
            name: "UNDER ARMOUR FREEDOM FLAG LONG SLEEVE", 
            category: "HOODIES/SWEATER", 
            brand: "Under Armour", 
            price: 33.00, 
            stock: 15, 
            sizes: ["S", "M", "L", "XL", "XXL"], 
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600&h=750", 
            description: "Camisa de manga larga de la colección Freedom. Proporciona calidez ligera y acabado anti-olor.",
            badge: "Destacado" 
          }
        ];
        setSportsProducts(defaultProds);
        localStorage.setItem("vault_store_products", JSON.stringify(defaultProds));
      }
    };

    loadProducts();

    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
      loadProducts();
    };

    window.addEventListener("globalSearch", handleGlobalSearch as EventListener);
    window.addEventListener("storage", loadProducts);

    return () => {
      window.removeEventListener("globalSearch", handleGlobalSearch as EventListener);
      window.removeEventListener("storage", loadProducts);
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
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* HERO SECTION */}
      {!searchQuery && (
        <section className="relative w-full h-[85vh] bg-zinc-100 flex items-center justify-center overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=2000" alt="Performance" className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 text-center text-white px-4 flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
              Rendimiento <br /> <span className="text-transparent text-stroke bg-clip-text text-white">Sin Límites</span>
            </h1>
            <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] mb-10 max-w-xl mx-auto">
              La nueva colección de alto impacto ya está aquí.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="#catalogo" className="bg-white text-black text-xs font-black uppercase tracking-[0.2em] px-10 py-4 hover:bg-gray-200 transition-colors w-full sm:w-auto text-center">
                Comprar Ahora
              </Link>
              <Link href="/coleccion" className="bg-transparent border border-white text-white text-xs font-black uppercase tracking-[0.2em] px-10 py-4 hover:bg-white hover:text-black transition-all w-full sm:w-auto text-center">
                Ver Colección
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORÍAS */}
      {!searchQuery && (
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Explora por estilo</span>
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

      {/* CATÁLOGO Y RESULTADOS DE BÚSQUEDA */}
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
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">No se encontraron artículos que coincidan con tu búsqueda.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                window.dispatchEvent(new CustomEvent("globalSearch", { detail: "" }));
              }} 
              className="text-xs font-black uppercase tracking-widest underline cursor-pointer mt-2"
            >
              Ver todos los productos
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

      {/* SECCIÓN DE MARCAS */}
      <section className="border-t border-gray-200 py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-12">Equipamiento Oficial de las Mejores Marcas</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {BRANDS.map((brand, idx) => (
              <div key={idx} className="flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300">
                <img src={brand.logo} alt={brand.name} className="max-h-8 md:max-h-12 w-auto object-contain filter brightness-0" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}