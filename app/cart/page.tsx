"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [bcvRate, setBcvRate] = useState<number>(875.65); // Tasa base referencial de respaldo

  const SHIPPING_THRESHOLD = 50;
  const isShippingFree = cartTotal >= SHIPPING_THRESHOLD;
  const amountNeeded = Math.max(0, SHIPPING_THRESHOLD - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    // Obtener la tasa BCV oficial en tiempo real con actualización automática
    const fetchBcvRate = () => {
      fetch("https://pydolarvenezuela-api.vercel.app/api/v1/dollar/pit")
        .then((res) => res.json())
        .then((data) => {
          if (data?.monitors?.bcv?.price) {
            setBcvRate(Number(data.monitors.bcv.price));
          }
        })
        .catch(() => {
          // Mantiene la última tasa conocida si falla la red
        });
    };

    fetchBcvRate();
    const interval = setInterval(fetchBcvRate, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatBs = (usdAmount: number) => {
    const totalBs = usdAmount * bcvRate;
    return totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Bs";
  };

  const finalTotal = cartTotal;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 selection:bg-black selection:text-white">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Tu bolsa está vacía</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-8">Descubre nuestra nueva colección deportiva.</p>
        <Link href="/" className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors">
          Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black py-12 selection:bg-black selection:text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">Bolsa de Compras</h1>
          <div className="bg-zinc-100 px-4 py-2 border border-zinc-200 text-zinc-800 font-mono text-[10px] font-bold uppercase tracking-wider">
            <span>Tasa BCV Oficial: <strong>{bcvRate.toFixed(2)} Bs/$</strong></span>
          </div>
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
                    <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-zinc-300">
                      <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="px-3 py-1 hover:bg-zinc-100 transition-colors cursor-pointer">-</button>
                      <span className="px-3 py-1 text-xs font-bold font-mono">{item.qty}</span>
                      <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-3 py-1 hover:bg-zinc-100 transition-colors cursor-pointer">+</button>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black uppercase tracking-widest block">${(item.price * item.qty).toFixed(2)}</span>
                      <span className="font-mono text-[10px] text-zinc-500 block">{formatBs(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-zinc-50 border border-zinc-200 p-6 sticky top-24 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] pb-4 border-b border-zinc-200">Resumen del Pedido</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-600">
                  <span>Subtotal Mercancía</span>
                  <div className="text-right">
                    <span>${cartTotal.toFixed(2)}</span>
                    <span className="block text-[10px] text-zinc-500">{formatBs(cartTotal)}</span>
                  </div>
                </div>
              </div>

              {/* BARRA DE PROGRESO DE ENVÍO GRATIS */}
              <div className="bg-white border border-zinc-200 p-4 rounded-sm space-y-2">
                {isShippingFree ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-center">
                    🎉 ¡Felicidades! Tienes **Envío Nacional Gratuito** disponible.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider text-zinc-600">
                      <span>Progreso Envío Gratis ($50)</span>
                      <span>${cartTotal.toFixed(2)} / $50.00</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-black h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 text-center font-mono pt-1">
                      Agrega <strong className="text-black">${amountNeeded.toFixed(2)} USD</strong> más para activar el envío gratis.
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest block">Total Final</span>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Calculado a tasa BCV</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black block">${finalTotal.toFixed(2)}</span>
                  <span className="font-mono text-xs font-bold text-orange-600 block">{formatBs(finalTotal)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full text-center bg-black hover:bg-zinc-800 text-white text-[10px] uppercase font-black tracking-[0.2em] py-4 transition-colors cursor-pointer shadow-lg">
                Proceder al Pago
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}