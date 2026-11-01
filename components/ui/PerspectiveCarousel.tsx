"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface PerspectiveProductItem {
  id: string;
  name: string;
  slug: string;
  src: string;
  price: number;
  compareAtPrice?: number;
  materialGsm?: string;
  fitType?: string;
  categoryName?: string;
}

interface PerspectiveCarouselProps {
  items: PerspectiveProductItem[];
  defaultActiveIndex?: number;
  slideWidth?: number;
  rotationStep?: number;
  inactiveScale?: number;
  className?: string;
}

export function PerspectiveCarousel({
  items,
  defaultActiveIndex = 0,
  slideWidth = 280,
  rotationStep = 45,
  inactiveScale = 0.84,
  className = "",
}: PerspectiveCarouselProps) {
  const maxIndex = Math.max(0, items.length - 1);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(defaultActiveIndex, 0), maxIndex)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const selectSlide = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), maxIndex);
      setCurrentIndex(clamped);
    },
    [maxIndex]
  );

  // Navegación por teclado (Flechas izq / der)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        selectSlide(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        selectSlide(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, selectSlide]);

  // Gestos táctiles / Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        selectSlide(currentIndex + 1);
      } else {
        selectSlide(currentIndex - 1);
      }
    }
    touchStartX.current = null;
  };

  if (!items || items.length === 0) {
    return null;
  }

  const activeItem = items[currentIndex];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative isolate w-full h-[620px] sm:h-[660px] overflow-hidden select-none bg-surface/20 rounded-3xl border border-border-subtle/80 ${className}`}
    >
      {/* Fondo con resplandor ambiental centrado */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Escenario 3D con Perspectiva */}
      <div
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {/* Riel móvil animado con aceleración por GPU */}
        <div
          className="absolute left-1/2 top-1/2 flex items-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          style={{
            transform: `translate3d(${-(currentIndex * slideWidth + slideWidth / 2)}px, -50%, 0)`,
          }}
        >
          {items.map((item, index) => {
            const isActive = currentIndex === index;
            const offset = currentIndex - index;
            const rotation = offset * rotationStep;
            const scale = isActive ? 1 : inactiveScale;
            const opacity = isActive ? 1 : Math.max(0.4, 1 - Math.abs(offset) * 0.25);
            const zIndex = 50 - Math.abs(offset);

            return (
              <div
                key={`${item.id}-${index}`}
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: slideWidth,
                  perspective: "1200px",
                  zIndex,
                }}
              >
                <div
                  onClick={() => selectSlide(index)}
                  className={`relative flex flex-col items-center cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform ${
                    isActive ? "cursor-default" : "cursor-pointer hover:opacity-80"
                  }`}
                  style={{
                    transform: `rotateY(${rotation}deg) scale(${scale})`,
                    transformStyle: "preserve-3d",
                    opacity,
                  }}
                >
                  {/* Tarjeta de Prenda 3D */}
                  <div className={`relative w-[240px] sm:w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border transition-all duration-500 shadow-2xl ${
                    isActive
                      ? "border-primary/80 ring-2 ring-primary/20 shadow-primary/20 bg-surface-elevated"
                      : "border-border-subtle bg-surface"
                  }`}>
                    {/* Imagen de la Prenda */}
                    <img
                      src={item.src}
                      alt={item.name}
                      draggable={false}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradiente cinemático inferior */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                    {/* Badge de Gramaje / Fit en la tarjeta */}
                    {item.materialGsm && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-primary bg-black/80 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur-md uppercase">
                          {item.materialGsm}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Etiqueta flotante con desenfoque dinámico */}
                  <div
                    className={`mt-4 text-center transition-all duration-500 ${
                      isActive ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-95"
                    }`}
                  >
                    <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-foreground">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="font-mono font-bold text-lg text-primary">
                        {formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="font-mono text-xs line-through text-muted-foreground">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón CTA Central para la Prenda Activa */}
      {activeItem && (
        <div className="absolute bottom-20 inset-x-0 z-20 flex justify-center pointer-events-none">
          <Link
            href={`/producto/${activeItem.slug}`}
            className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>VER ARMADURA COMPLETA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Barra de Controles Flotante (Flechas + Indicador de Píldora Expandible) */}
      <div className="absolute inset-x-4 bottom-5 z-20 mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-border-subtle bg-background/85 px-3 py-1.5 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          aria-label="Prenda anterior"
          disabled={currentIndex === 0}
          onClick={() => selectSlide(currentIndex - 1)}
          className="inline-flex w-8 h-8 items-center justify-center rounded-full text-foreground hover:bg-surface-elevated hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dots / Pills animadas */}
        <div className="flex items-center gap-1.5 px-1">
          {items.map((it, idx) => (
            <button
              key={it.id || idx}
              type="button"
              aria-label={`Ir a prenda ${idx + 1}`}
              onClick={() => selectSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Siguiente prenda"
          disabled={currentIndex === maxIndex}
          onClick={() => selectSlide(currentIndex + 1)}
          className="inline-flex w-8 h-8 items-center justify-center rounded-full text-foreground hover:bg-surface-elevated hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
