"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const SHIPPING_THRESHOLD = 50;
  const isShippingFree = cartTotal >= SHIPPING_THRESHOLD;
  const shippingCost = isShippingFree ? 0 : 5.99;
  const finalTotal = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 selection:bg-black selection:text-white">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Tu bolsa está vacía</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-8">Descubre nuestra nueva colección de temporada.</p>
        <Link href="/" className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors">
          Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black py-12 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 border-b border-zinc-200 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">Bolsa de Compras</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* LISTA DE PRODUCTOS */}
          <div className="flex-1 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 sm:gap-6 border border-zinc-200 p-4">
                <img src={item.image} alt={item.name} className="w-24 h-32 object-cover bg-zinc-100" />
                
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mb-1">{item.category}</span>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">{item.name}</h3>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-600 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-zinc-300">
                      <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="px-3 py-1 hover:bg-zinc-100 transition-colors">-</button>
                      <span className="px-3 py-1 text-xs font-bold font-mono">{item.qty}</span>
                      <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-3 py-1 hover:bg-zinc-100 transition-colors">+</button>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-zinc-50 border border-zinc-200 p-6 sticky top-24">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 pb-4 border-b border-zinc-200">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-600">
                  <span>Envío a Venezuela</span>
                  <span className={isShippingFree ? "text-emerald-600 font-bold" : ""}>
                    {isShippingFree ? "GRATIS" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {!isShippingFree && (
                <div className="mb-6 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full" style={{ width: `${(cartTotal / SHIPPING_THRESHOLD) * 100}%` }} />
                  <p className="text-[9px] uppercase tracking-widest text-zinc-500 mt-2 text-center">
                    Agrega ${(SHIPPING_THRESHOLD - cartTotal).toFixed(2)} más para envío gratis
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-zinc-200 pt-4 mb-8">
                <span className="text-xs font-black uppercase tracking-widest">Total Final</span>
                <span className="text-xl font-black">${finalTotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="block w-full text-center bg-black hover:bg-zinc-800 text-white text-[10px] uppercase font-black tracking-[0.2em] py-4 transition-colors">
                Proceder al Pago
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}