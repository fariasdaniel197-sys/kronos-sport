"use client";

import { useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
  [key: string]: any;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Única"
  );
  
  // Estado para controlar si se está mostrando el selector de tallas tras hacer clic
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const [animating, setAnimating] = useState(false);
  const [added, setAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [animStyle, setAnimStyle] = useState<any>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleInitialClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Si el producto tiene tallas disponibles y aún no se abrió el selector, lo mostramos primero
    if (product.sizes && product.sizes.length > 0 && !showSizeSelector) {
      setShowSizeSelector(true);
      return;
    }

    // Si ya seleccionó la talla o el producto no requiere tallas, procedemos a añadir
    executeAddToCart();
  };

  const executeAddToCart = () => {
    if (buttonRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const startX = btnRect.left + btnRect.width / 2 - 28;
      const startY = btnRect.top + btnRect.height / 2 - 28;

      const cartIcon = document.querySelector('a[href="/cart"]');
      let targetX = window.innerWidth - 60;
      let targetY = 30;

      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        targetX = cartRect.left + cartRect.width / 2 - 28;
        targetY = cartRect.top + cartRect.height / 2 - 28;
      }

      const deltaX = targetX - startX;
      const deltaY = targetY - startY;

      setAnimStyle({
        left: `${startX}px`,
        top: `${startY}px`,
        ['--target-x' as any]: `${deltaX}px`,
        ['--target-y' as any]: `${deltaY}px`,
      });
    }

    addToCart({
      id: `${product.id}-${selectedSize}`,
      name: `${product.name} (Talla: ${selectedSize})`,
      price: product.price,
      image: product.image || "/logo-icon.png",
      category: product.category || "general",
    });

    setShowSizeSelector(false);
    setAnimating(true);
    setAdded(true);
    setShowNotification(true);

    setTimeout(() => {
      setAnimating(false);
    }, 750);

    setTimeout(() => {
      setAdded(false);
    }, 1800);

    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);

    return () => clearTimeout(timer);
  };

  return (
    <div className="relative inline-block w-full space-y-2">
      
      {/* Selector de tallas desplegable (Aparece únicamente al hacer clic en Añadir) */}
      {showSizeSelector && product.sizes && product.sizes.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 p-2.5 rounded-sm space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest font-bold">
              Selecciona tu Talla:
            </span>
            <button 
              onClick={() => setShowSizeSelector(false)}
              className="text-[10px] text-neutral-400 hover:text-black uppercase cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((sz: string, idx: number) => (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setSelectedSize(sz);
                  executeAddToCart(); // Al hacer clic en la talla, se añade automáticamente
                }}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                  selectedSize === sz
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-800 border-neutral-300 hover:border-black"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      <button 
        ref={buttonRef}
        onClick={handleInitialClick}
        className="w-full bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-wider font-semibold py-2.5 transition cursor-pointer flex items-center justify-center gap-2"
      >
        {!session ? (
          <span className="text-orange-400 text-[10px] font-bold tracking-widest uppercase">
            Inicia sesión para comprar
          </span>
        ) : added ? (
          "¡Añadido ✓!"
        ) : showSizeSelector ? (
          "Elige una talla arriba ↗"
        ) : (
          "Añadir a la Bolsa"
        )}
      </button>

      {session && animating && (
        <div 
          className="animate-fly-to-cart w-14 h-14 rounded-md overflow-hidden border-2 border-orange-500 shadow-2xl bg-white absolute z-50 pointer-events-none"
          style={animStyle}
        >
          <img 
            src={product.image || "/logo-icon.png"} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      {session && showNotification && (
        <div className="bg-zinc-900 text-white border border-orange-500/50 p-2.5 rounded-sm flex items-center justify-between gap-2 text-xs shadow-lg">
          <span className="text-[10px] font-medium text-zinc-200 truncate">
            ¡Agregado (Talla: {selectedSize})!
          </span>
          <Link 
            href="/cart" 
            className="text-orange-400 font-black uppercase tracking-widest text-[9px] underline underline-offset-2 whitespace-nowrap"
          >
            Ver carrito →
          </Link>
        </div>
      )}
    </div>
  );
}