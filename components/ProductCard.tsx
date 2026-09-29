"use client";

import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col bg-white border border-neutral-200 overflow-hidden rounded-sm hover:shadow-md transition">
      {/* Etiqueta / Badge */}
      {product.badge && (
        <span className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
          {product.badge}
        </span>
      )}

      {/* Imagen del producto */}
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] w-full bg-neutral-200 overflow-hidden block">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-300"
        />
      </Link>

      {/* Detalles del producto */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
            {product.category}
          </p>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 mt-1 uppercase tracking-tight hover:underline">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <span className="text-base font-black text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          
          {/* BOTÓN INTERACTIVO CON ANIMACIÓN DE VUELO Y AVISO */}
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}