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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("returns");

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/product?_t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products)) {
            const found = data.products.find((p: any) => String(p.id) === String(id));
            if (found) {
              setProduct(found);
              // REINICIO CLAVE: Volver a la foto 1 y talla inicial al cambiar de producto
              setSelectedImageIndex(0);
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
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 text-[11px] font-mono tracking-[0.3em] uppercase">Cargando colección exclusiva...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-center items-center px-4 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">Artículo no disponible</h1>
        <p className="text-xs text-zinc-500 font-mono uppercase">El perfil de este producto ya no se encuentra activo en el inventario.</p>
        <Link href="/" className="bg-black text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-sm">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  // EXTRACCIÓN BLINDADA Y ROBUSTA PARA EL CAMPO String SEPARADO POR COMAS O ARREGLOS
  let productImages = ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"];

  if (typeof product.images === "string" && product.images.trim() !== "") {
    productImages = product.images.split(",").map((i: string) => i.trim()).filter(Boolean);
  } else if (Array.isArray(product.images) && product.images.length > 0) {
    productImages = product.images.map((i: any) => String(i).trim()).filter(Boolean);
  } else if (typeof product.image === "string" && product.image.trim() !== "") {
    productImages = product.image.split(",").map((i: string) => i.trim()).filter(Boolean);
  }

  if (productImages.length === 0) {
    productImages = ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"];
  }

  // Objeto unificado que lleva la talla y la imagen seleccionada al carrito
  const productWithSize = {
    ...product,
    images: productImages,
    image: productImages[selectedImageIndex] || productImages[0],
    selectedSize: selectedSize
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans py-10 px-6 lg:px-16 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <button 
          onClick={() => router.back()} 
          className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-black flex items-center gap-2 cursor-pointer transition"
        >
          ← Volver al catálogo
        </button>

        {/* SECCIÓN PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUMNA DE IMÁGENES */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-center lg:items-start">
            
            {/* Miniaturas laterales */}
            {productImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible">
                {productImages.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-zinc-100 rounded-sm overflow-hidden border cursor-pointer transition-all flex-shrink-0 ${
                      selectedImageIndex === idx ? 'border-black ring-1 ring-black' : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen Principal */}
            <div className="flex-1 order-1 sm:order-2 w-full max-w-[500px] aspect-[4/5] max-h-[520px] bg-zinc-50 rounded-sm overflow-hidden border border-zinc-200 shadow-sm relative flex items-center justify-center">
              {product.badge && (
                <span className={`absolute top-4 left-4 z-10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm ${
                  product.badge === 'Oferta' ? 'bg-red-600 text-white' : 'bg-black text-white'
                }`}>
                  {product.badge}
                </span>
              )}
              <img 
                src={productImages[selectedImageIndex] || productImages[0]} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105" 
              />
            </div>

          </div>

          {/* INFORMACIÓN Y ACCIONES */}
          <div className="lg:col-span-5 space-y-6 bg-zinc-50/80 p-8 border border-zinc-200 rounded-sm shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-mono uppercase bg-zinc-200 text-zinc-800 px-3 py-1 font-bold rounded-full">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-[10px] font-mono uppercase bg-black text-white px-3 py-1 font-bold rounded-full">
                    {product.brand}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <p className="text-2xl font-black font-mono tracking-tight text-zinc-900">
                  ${Number(product.price).toFixed(2)} <span className="text-xs font-normal text-zinc-500">USD</span>
                </p>
                {product.oldPrice && (
                  <p className="text-sm font-mono text-zinc-400 line-through">
                    ${Number(product.oldPrice).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="border-t border-zinc-200 py-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-bold">Descripción del Artículo:</span>
              <p className="text-xs text-zinc-700 uppercase font-sans leading-relaxed tracking-wide">
                {product.description || "Prenda exclusiva confeccionada bajo estrictos estándares de calidad, garantizando máxima comodidad y durabilidad."}
              </p>
              <div className="pt-2 flex items-center justify-between font-mono text-xs text-zinc-600">
                <span>Disponibilidad en tienda:</span>
                <span className="text-emerald-600 font-bold uppercase">{product.stock} unidades en stock</span>
              </div>
            </div>

            {/* TALLAS */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Seleccionar Talla:</span>
                  <span className="text-[10px] font-mono uppercase text-black font-bold">Activa: {selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: string) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-white text-zinc-800 border-zinc-300 hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BOTÓN DE COMPRA */}
            <div className="pt-4">
              <AddToCartButton product={productWithSize} />
            </div>

            {/* ACORDEÓN DE POLÍTICAS */}
            <div className="border-t border-zinc-200 pt-6 space-y-3 text-xs font-sans">
              
              <div className="border border-zinc-200 bg-white rounded-sm overflow-hidden">
                <button 
                  onClick={() => toggleAccordion("returns")}
                  className="w-full flex justify-between items-center p-3.5 text-left font-bold uppercase text-zinc-800 bg-zinc-100/70 cursor-pointer"
                >
                  <span>🔄 Políticas de Cambios y Devoluciones</span>
                  <span className="font-mono text-sm">{activeAccordion === "returns" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "returns" && (
                  <div className="p-4 space-y-2 text-zinc-600 text-[11px] leading-relaxed uppercase">
                    <p>• <strong>Plazo de garantía:</strong> Tienes hasta <strong>15 días continuos</strong> a partir de la fecha de entrega para solicitar cambios por talla, color o modelo.</p>
                    <p>• <strong>Condición indispensable:</strong> La prenda debe estar nueva, sin señales de uso, con sus etiquetas originales intactas y en su empaque correspondiente.</p>
                    <p>• <strong>Costos de traslado:</strong> Los cambios por error de talla por parte del cliente corren por cuenta del comprador.</p>
                  </div>
                )}
              </div>

              <div className="border border-zinc-200 bg-white rounded-sm overflow-hidden">
                <button 
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex justify-between items-center p-3.5 text-left font-bold uppercase text-zinc-800 bg-zinc-100/70 cursor-pointer"
                >
                  <span>📦 Envíos Nacionales (Tealca)</span>
                  <span className="font-mono text-sm">{activeAccordion === "shipping" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "shipping" && (
                  <div className="p-4 space-y-2 text-zinc-600 text-[11px] leading-relaxed uppercase">
                    <p>• <strong>Despachos seguros:</strong> Realizamos envíos diarios a nivel nacional a través de <strong>Tealca</strong> con cobro en destino.</p>
                    <p>• <strong>Tiempos de entrega:</strong> Se procesan y despachan en un lapso de 24 a 48 horas hábiles tras verificar el pago.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ARTÍCULOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-zinc-200 pt-16 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-zinc-900">También te puede interesar</h2>
              <Link href="/" className="text-xs font-mono uppercase text-zinc-600 hover:text-black underline">Ver todo el catálogo →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => {
                let relImages = ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"];
                if (typeof rel.images === "string" && rel.images.trim() !== "") {
                  relImages = rel.images.split(",").map((i: string) => i.trim()).filter(Boolean);
                } else if (Array.isArray(rel.images) && rel.images.length > 0) {
                  relImages = rel.images.map((i: any) => String(i).trim()).filter(Boolean);
                } else if (typeof rel.image === "string" && rel.image.trim() !== "") {
                  relImages = rel.image.split(",").map((i: string) => i.trim()).filter(Boolean);
                }

                return (
                  <Link key={rel.id} href={`/product/${rel.id}`} className="group flex flex-col bg-zinc-50 p-3.5 rounded-sm border border-zinc-200 hover:border-black transition-all shadow-sm">
                    <div className="aspect-[4/5] w-full bg-zinc-100 overflow-hidden mb-3 rounded-sm">
                      <img src={relImages[0]} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 mb-1">{rel.category}</span>
                    <h3 className="text-xs font-bold uppercase tracking-tight line-clamp-1 mb-2 text-zinc-800">{rel.name}</h3>
                    <span className="text-xs font-black font-mono text-zinc-900">${Number(rel.price).toFixed(2)} USD</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}