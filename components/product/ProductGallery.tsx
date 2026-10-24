"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ZoomIn, ShieldCheck } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  materialGsm?: string;
}

export function ProductGallery({ images, productName, materialGsm }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const safeImages = images && images.length > 0 ? images : [];
  const currentImage = safeImages[activeImageIndex] || null;

  return (
    <div className="space-y-4">
      {/* Contenedor Principal de Imagen */}
      <div className="relative aspect-[4/5] bg-surface-elevated rounded-2xl border border-border-subtle overflow-hidden group shadow-lg">
        {/* Badges Superiores */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
          <span className="bg-background/85 border border-border-subtle text-foreground text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg tracking-wider backdrop-blur-md shadow-sm">
            DROP OFICIAL
          </span>
          {materialGsm && (
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {materialGsm}
            </span>
          )}
        </div>

        {/* Garantía de Calidad en Badge */}
        <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-1.5 bg-black/75 border border-border-subtle text-muted-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-md backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>SERIGRAFÍA DE ALTA DENSIDAD</span>
        </div>

        {currentImage ? (
          <div 
            className="w-full h-full relative cursor-crosshair overflow-hidden"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <img
              src={currentImage}
              alt={`${productName} - Vista ${activeImageIndex + 1}`}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                isZoomed ? "scale-125" : "scale-100"
              }`}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Sparkles className="w-12 h-12 text-primary opacity-60 mb-3" />
            <span className="font-display text-lg uppercase text-foreground">{productName}</span>
            <span className="text-xs mt-1 text-muted-foreground">{materialGsm || "Gramaje Pesado"}</span>
          </div>
        )}
      </div>

      {/* Miniaturas de Galería */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative w-20 h-24 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                activeImageIndex === idx
                  ? "border-primary ring-2 ring-primary/20 scale-102"
                  : "border-border-subtle hover:border-border-strong opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${productName} miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
