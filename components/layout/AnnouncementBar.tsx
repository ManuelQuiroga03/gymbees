"use client";

import React, { useState, useEffect } from "react";
import { Truck, CreditCard, Sparkles } from "lucide-react";

const announcements = [
  {
    icon: Truck,
    text: "ENVÍO GRATIS A TODO MÉXICO EN COMPRAS SUPERIORES A $1,299 MXN",
  },
  {
    icon: CreditCard,
    text: "PAGA EN 4 QUINCENAS SIN TARJETA DE CRÉDITO VÍA KUESKI PAY",
  },
  {
    icon: Sparkles,
    text: "DROP ACTIVO: SILUETAS HEAVYWEIGHT 240+ GSM HASTA AGOTAR EXISTENCIAS",
  },
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = announcements[index];
  const Icon = current.icon;

  return (
    <div className="bg-surface border-b border-border-subtle py-2.5 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center justify-center gap-2 select-none">
      <Icon className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
      <span className="text-foreground transition-opacity duration-300 font-bold tracking-widest text-[11px] md:text-xs text-center">
        {current.text}
      </span>
    </div>
  );
}
