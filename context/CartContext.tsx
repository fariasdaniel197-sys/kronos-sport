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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Clave dinámica basada en el correo del usuario actual (si no hay sesión, se usa una de invitado vacía)
  const userKey = session?.user?.email ? `atlanta_cart_${session.user.email}` : "atlanta_cart_guest";

  // Cargar carrito desde localStorage al iniciar o al cambiar de sesión
  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user?.email) {
      // Si no hay sesión iniciada, el carrito se blanquea por completo
      setCart([]);
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
    } else {
      setCart([]);
    }
    setIsLoaded(true);
  }, [session, status, userKey]);

  // Guardar en localStorage exclusivo del usuario activo cada vez que el carrito cambie
  useEffect(() => {
    if (isLoaded && session?.user?.email) {
      localStorage.setItem(userKey, JSON.stringify(cart));
    }
  }, [cart, isLoaded, userKey]);

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

  const clearCart = () => {
    setCart([]);
    if (session?.user?.email) {
      localStorage.removeItem(`atlanta_cart_${session.user.email}`);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
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