"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default function DescuentosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("vault_store_products");
    if (stored) {
      const allProds = JSON.parse(stored);
      // Filtramos los marcados como descuento
      const discountProducts = allProds.filter((p: any) => p.isDiscount === true);
      setProducts(discountProducts);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] animate-pulse">Cargando descuentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto space-y-12">
        <div className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4">
          <div>
            <Link href="/" className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-black mb-2 block">
              ← Volver al Inicio
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-red-600">
              Liquidación y Descuentos
            </h1>
          </div>
          <p className="text-xs font-mono text-neutral-500 uppercase">{products.length} producto(s) en oferta</p>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-neutral-300 rounded-sm bg-neutral-50 space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              No hay artículos en descuento por el momento.
            </p>
            <Link href="/" className="inline-block bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <Link href={`/product/${product.id}`} className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden mb-4 cursor-pointer block">
                  <span className="absolute top-0 left-0 z-10 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-red-600 text-white">
                    Oferta
                  </span>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />
                </Link>

                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1 block">
                      {product.brand ? `${product.brand} • ` : ""}{product.category}
                    </span>
                    <Link href={`/product/${product.id}`} className="text-sm font-bold uppercase tracking-tight text-black mb-2 line-clamp-1 hover:underline">
                      {product.name}
                    </Link>
                  </div>
                  
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black tracking-tight text-red-600 block">
                        ${Number(product.price).toFixed(2)} USD
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs font-mono text-neutral-400 line-through">
                          ${Number(product.oldPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}