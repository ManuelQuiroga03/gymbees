"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { CartItem } from "@/types/commerce";

export interface AppliedDiscount {
  code: string;
  discountAmount: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

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
  appliedDiscount: AppliedDiscount | null;
  discountAmount: number;
  applyDiscount: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 1299;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

  // Cargar carrito y cupón persistidos en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gymbees_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedDiscount = localStorage.getItem("gymbees_discount");
      if (savedDiscount) {
        setAppliedDiscount(JSON.parse(savedDiscount));
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
      prev.map((i) =>
        i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedDiscount(null);
    try {
      localStorage.removeItem("gymbees_cart");
      localStorage.removeItem("gymbees_discount");
    } catch {}
  };

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  // Recalcular dinámicamente el valor del descuento según el subtotal vigente
  const discountAmount = useMemo(() => {
    if (!appliedDiscount || subtotal <= 0) return 0;
    if (appliedDiscount.discountType === "percentage") {
      return Math.round(((subtotal * appliedDiscount.discountValue) / 100) * 100) / 100;
    }
    return Math.min(subtotal, appliedDiscount.discountValue);
  }, [appliedDiscount, subtotal]);

  const applyDiscount = async (code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: "Ingresa un código de descuento" };

    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, error: data.error || "Cupón no válido o expirado" };
      }

      const disc: AppliedDiscount = {
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
      };

      setAppliedDiscount(disc);
      try {
        localStorage.setItem("gymbees_discount", JSON.stringify(disc));
      } catch {}

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al validar el cupón" };
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    try {
      localStorage.removeItem("gymbees_discount");
    } catch {}
  };

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
        appliedDiscount,
        discountAmount,
        applyDiscount,
        removeDiscount,
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
