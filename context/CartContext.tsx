"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types/commerce";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
  freeShippingProgress: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 1299;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito persistido en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gymbees_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error al cargar carrito:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar carrito en localStorage ante cambios
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("gymbees_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.variantId === newItem.variantId);
      if (index > -1) {
        const updated = [...prev];
        const nextQty = Math.min(updated[index].quantity + newItem.quantity, newItem.maxStock);
        updated[index] = { ...updated[index], quantity: nextQty };
        return updated;
      }
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("gymbees_cart");
    } catch {}
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountUntilFreeShipping,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
