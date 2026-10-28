"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  appliedCoupon: string | null;
  discountPercent: number;
  applyCouponCode: (code: string, percent: number) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Claves dinámicas basadas en el correo del usuario actual
  const userKey = session?.user?.email ? `kronos_cart_${session.user.email}` : "kronos_cart_guest";
  const couponKey = session?.user?.email ? `kronos_coupon_${session.user.email}` : "kronos_coupon_guest";

  // Cargar carrito y cupón desde localStorage al iniciar
  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user?.email) {
      setCart([]);
      setAppliedCoupon(null);
      setDiscountPercent(0);
      setIsLoaded(true);
      return;
    }

    const savedCart = localStorage.getItem(userKey);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }

    const savedCoupon = localStorage.getItem(couponKey);
    if (savedCoupon) {
      try {
        const parsedCoupon = JSON.parse(savedCoupon);
        setAppliedCoupon(parsedCoupon.code);
        setDiscountPercent(parsedCoupon.percent);
      } catch (e) {
        setAppliedCoupon(null);
        setDiscountPercent(0);
      }
    }

    setIsLoaded(true);
  }, [session, status, userKey, couponKey]);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded && session?.user?.email) {
      localStorage.setItem(userKey, JSON.stringify(cart));
    }
  }, [cart, isLoaded, userKey]);

  // Guardar cupón en localStorage cada vez que cambie para que sea fijo
  useEffect(() => {
    if (isLoaded && session?.user?.email) {
      if (appliedCoupon) {
        localStorage.setItem(couponKey, JSON.stringify({ code: appliedCoupon, percent: discountPercent }));
      } else {
        localStorage.removeItem(couponKey);
      }
    }
  }, [appliedCoupon, discountPercent, isLoaded, couponKey]);

  const addToCart = (product: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const applyCouponCode = (code: string, percent: number) => {
    setAppliedCoupon(code);
    setDiscountPercent(percent);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    if (session?.user?.email) {
      localStorage.removeItem(couponKey);
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
    if (session?.user?.email) {
      localStorage.removeItem(`kronos_cart_${session.user.email}`);
      localStorage.removeItem(`kronos_coupon_${session.user.email}`);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartCount, 
        cartTotal,
        appliedCoupon,
        discountPercent,
        applyCouponCode,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}