"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Product } from "@/types/commerce";
import { ProductGallery } from "./ProductGallery";
import { ProductDetails } from "./ProductDetails";
import { StickyAddToCart } from "./StickyAddToCart";
import { ProductCard } from "./ProductCard";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const mainButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Breadcrumbs de Navegación */}
      <nav className="border-b border-border-subtle bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <ol className="flex items-center gap-1.5 text-muted-foreground overflow-x-auto whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            </li>
            {product.categoryName && product.categoryId && (
              <>
                <li>
                  <Link
                    href={`/categoria/${product.slug.includes("pump") ? "pump-covers" : product.slug.includes("akaza") ? "compresion" : "pump-covers"}`}
                    className="hover:text-primary transition-colors uppercase font-medium"
                  >
                    {product.categoryName}
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                </li>
              </>
            )}
            <li className="text-foreground font-bold uppercase truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </li>
          </ol>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la tienda</span>
          </Link>
        </div>
      </nav>

      {/* 2. Área Principal de la Ficha de Producto (PDP) Compacta */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Galería Visual (Columna Izquierda: 6 columnas) */}
          <div className="lg:col-span-6 sticky top-20">
            <ProductGallery
              images={product.images}
              productName={product.name}
              materialGsm={product.materialGsm}
            />
          </div>

          {/* Detalles Transaccionales (Columna Derecha: 6 columnas) */}
          <div className="lg:col-span-6">
            <ProductDetails
              product={product}
              onButtonRef={(el) => {
                mainButtonRef.current = el;
              }}
            />
          </div>
        </div>

        {/* 3. Productos Relacionados / Drop Completo */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-border-subtle">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  COMPLETA TU ARMADURA
                </span>
                <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-foreground mt-1">
                  MÁS PIEZAS DEL HEAVY CLUB
                </h3>
              </div>
              <Link
                href="/#drop"
                className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
              >
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 4. Sticky Mobile Bar al hacer scroll */}
      <StickyAddToCart product={product} targetRef={mainButtonRef} />
    </div>
  );
}
