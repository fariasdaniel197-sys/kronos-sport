"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch("/api/product")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products)) {
            const found = data.products.find((p: any) => String(p.id) === String(id));
            if (found) {
              setProduct(found);
              if (found.sizes && found.sizes.length > 0) {
                setSelectedSize(found.sizes[0]);
              }
              const related = data.products.filter(
                (p: any) => p.category === found.category && String(p.id) !== String(id)
              );
              setRelatedProducts(related.slice(0, 4));
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar detalles:", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] animate-pulse">Cargando perfil del producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">Producto no encontrado</h1>
        <p className="text-xs text-neutral-500 font-mono uppercase">El perfil de este artículo no existe o fue eliminado.</p>
        <Link href="/" className="bg-black text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  // Objeto con la talla seleccionada que viaja directo al carrito
  const productWithSize = {
    ...product,
    selectedSize: selectedSize
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <button 
          onClick={() => router.back()} 
          className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black flex items-center gap-2 cursor-pointer"
        >
          ← Volver atrás
        </button>

        {/* SECCIÓN PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* IMAGEN */}
          <div className="relative aspect-[4/5] bg-neutral-100 rounded-sm overflow-hidden border border-neutral-200">
            {product.badge && (
              <span className={`absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 ${product.badge === 'Oferta' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                {product.badge}
              </span>
            )}
            <img 
              src={product.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"} 
              alt={product.name} 
              className="w-full h-full object-cover object-center" 
            />
          </div>

          {/* INFORMACIÓN Y ACCIONES */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-800 px-2.5 py-1 font-bold border border-neutral-200">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-[10px] font-mono uppercase bg-black text-white px-2.5 py-1 font-bold">
                    {product.brand}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mt-1">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <p className="text-2xl font-black font-mono tracking-tight text-black">
                  ${Number(product.price).toFixed(2)} USD
                </p>
                {product.oldPrice && (
                  <p className="text-sm font-mono text-neutral-400 line-through">
                    ${Number(product.oldPrice).toFixed(2)} USD
                  </p>
                )}
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="border-t border-b border-neutral-200 py-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Descripción del Artículo:</span>
              <p className="text-xs text-neutral-700 uppercase font-sans leading-relaxed">
                {product.description || "Sin descripción detallada para este producto. Diseñado con altos estándares de calidad y rendimiento."}
              </p>
              <p className="text-[11px] font-mono text-neutral-500 pt-1">
                Stock disponible: <strong className="text-black">{product.stock} unidades</strong>
              </p>
            </div>

            {/* BOTÓN DE COMPRA Y SELECTOR INTEGRADO */}
            <div className="pt-2">
              <AddToCartButton product={productWithSize} />
            </div>

            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm space-y-2 text-xs font-mono text-neutral-600">
              <p className="font-bold text-black uppercase">🛡️ Garantía y Envíos Kronos:</p>
              <p>• Envíos asegurados a nivel nacional a través de Tealca.</p>
              <p>• Acumula puntos Kronos canjeables en tus próximas adquisiciones.</p>
            </div>
          </div>
        </div>

        {/* ARTÍCULOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-neutral-200 pt-16 space-y-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Artículos Relacionados</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <Link key={rel.id} href={`/product/${rel.id}`} className="group flex flex-col bg-neutral-50 p-3 rounded-sm border border-neutral-200 hover:shadow-lg transition-all">
                  <div className="aspect-[4/5] w-full bg-neutral-200 overflow-hidden mb-3">
                    <img src={rel.image || ""} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">{rel.category}</span>
                  <h3 className="text-xs font-bold uppercase tracking-tight line-clamp-1 mb-2 text-black">{rel.name}</h3>
                  <span className="text-xs font-black font-mono text-black">${Number(rel.price).toFixed(2)} USD</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}