"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

// Banners promocionales oficiales actualizados con tus imágenes exactas
const BRAND_PROMO_BANNERS: { [key: string]: { title: string; subtitle: string; images: string[] } } = {
  "Under Armour": {
    title: "UNDER ARMOUR • PERFORMANCE & FREEDOM",
    subtitle: "Diseñado para mantenerte en movimiento, combinando confort superior y la más alta tecnología en cada prenda.",
    images: [
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/259388f2-3d8b-4537-959d-b351bdf2c733.__CR0,0,970,300_PT0_SX970_V1___.jpg",
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/162cadfe-b318-4738-9de7-26ec3ed66bc4.__CR0,0,970,600_PT0_SX970_V1___.jpg"
    ]
  },
  "Puma": {
    title: "DESIGN FOR COMFORT • PUMA PERFORMANCE",
    subtitle: "Level up your everyday with PUMA - where performance meets comfort in the essentials you rely on.",
    images: [
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/259388f2-3d8b-4537-959d-b351bdf2c733.__CR0,0,970,300_PT0_SX970_V1___.jpg",
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/162cadfe-b318-4738-9de7-26ec3ed66bc4.__CR0,0,970,600_PT0_SX970_V1___.jpg"
    ]
  },
  "Nike": {
    title: "JUST DO IT • NIKE INNOVATION",
    subtitle: "Engineered to keep you moving, pushing limits, and reaching peak athletic performance.",
    images: [
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/259388f2-3d8b-4537-959d-b351bdf2c733.__CR0,0,970,300_PT0_SX970_V1___.jpg",
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/162cadfe-b318-4738-9de7-26ec3ed66bc4.__CR0,0,970,600_PT0_SX970_V1___.jpg"
    ]
  },
  "Adidas": {
    title: "IMPOSSIBLE IS NOTHING • ADIDAS SPORT",
    subtitle: "Created for athletes who refuse to settle, combining sustainable tech with street culture.",
    images: [
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/259388f2-3d8b-4537-959d-b351bdf2c733.__CR0,0,970,300_PT0_SX970_V1___.jpg",
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/162cadfe-b318-4738-9de7-26ec3ed66bc4.__CR0,0,970,600_PT0_SX970_V1___.jpg"
    ]
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const storedProds = localStorage.getItem("vault_store_products");
      if (storedProds) {
        const parsed = JSON.parse(storedProds);
        const found = parsed.find((p: any) => String(p.id) === String(id));
        if (found) {
          setProduct(found);
        }
      }
      setLoading(false);
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
        <p className="text-xs text-neutral-500 font-mono uppercase">El perfil de este artículo no existe o fue eliminado del inventario.</p>
        <Link href="/" className="bg-black text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  const brandBannerInfo = BRAND_PROMO_BANNERS[product.brand] || BRAND_PROMO_BANNERS["Under Armour"];

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
          
          <div className="relative aspect-[4/5] bg-neutral-100 rounded-sm overflow-hidden border border-neutral-200">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-black text-white">
                {product.badge}
              </span>
            )}
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover object-center" 
            />
          </div>

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
              <p className="text-2xl font-black font-mono tracking-tight text-emerald-700 mt-3">
                ${Number(product.price).toFixed(2)} USD
              </p>
            </div>

            <div className="border-t border-b border-neutral-200 py-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Descripción del Artículo:</span>
              <p className="text-xs text-neutral-700 uppercase font-sans leading-relaxed">
                {product.description || "Sin descripción detallada para este producto. Diseñado con altos estándares de calidad y rendimiento."}
              </p>
              <p className="text-[11px] font-mono text-neutral-500 pt-1">
                Stock disponible: <strong className="text-black">{product.stock} unidades</strong>
              </p>
            </div>

            <div className="pt-2">
              <AddToCartButton product={product} />
            </div>

            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm space-y-2 text-xs font-mono text-neutral-600">
              <p className="font-bold text-black uppercase">🛡️ Garantía y Envíos Atlanta:</p>
              <p>• Envíos asegurados a nivel nacional a través de Tealca y MRW.</p>
              <p>• Acumula puntos Atlanta canjeables en tus próximas compras.</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE BANNERS PROMOCIONALES OFICIALES */}
        <div className="border-t border-neutral-200 pt-16 space-y-8">
          <div className="bg-black text-white p-8 md:p-12 text-center rounded-sm space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-orange-500 font-bold block">
              Campaña Oficial • {product.brand || "Exclusive Brand"}
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
              {brandBannerInfo.title}
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 max-w-2xl mx-auto uppercase font-medium leading-relaxed">
              {brandBannerInfo.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {brandBannerInfo.images.map((imgUrl, idx) => (
              <div key={idx} className="w-full bg-neutral-100 rounded-sm overflow-hidden border border-neutral-200 shadow-md">
                <img 
                  src={imgUrl} 
                  alt={`Campaña ${product.brand}`} 
                  className="w-full h-auto object-cover object-center" 
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}