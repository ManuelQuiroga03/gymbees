"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Product, Category, ProductFit } from "@/types/commerce";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronRight, ArrowUpDown, Filter, Sparkles, SlidersHorizontal } from "lucide-react";

interface CategoryViewProps {
  category: Category;
  products: Product[];
  allCategories: Category[];
}

export function CategoryView({ category, products, allCategories }: CategoryViewProps) {
  const [selectedFit, setSelectedFit] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Filtros de ajuste disponibles en esta categoría
  const availableFits = useMemo(() => {
    const fits = new Set<string>();
    products.forEach((p) => fits.add(p.fitType));
    return Array.from(fits);
  }, [products]);

  // Filtrado y ordenamiento en memoria
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedFit !== "all") {
      result = result.filter((p) => p.fitType === selectedFit);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.basePrice - a.basePrice);
    }

    return result;
  }, [products, selectedFit, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Breadcrumbs */}
      <nav className="border-b border-border-subtle bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-xs">
          <ol className="flex items-center gap-1.5 text-muted-foreground overflow-x-auto whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            </li>
            <li>
              <span className="text-muted-foreground">Categorías</span>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            </li>
            <li className="text-foreground font-bold uppercase truncate">
              {category.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* 2. Category Header / Banner */}
      <section className="bg-surface/60 border-b border-border-subtle py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary bg-background border border-border-subtle px-2.5 py-1 rounded uppercase">
                COLECCIÓN OFICIAL
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {products.length} {products.length === 1 ? "PIEZA ACTIVA" : "PIEZAS ACTIVAS"}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-wider text-foreground leading-none">
              {category.name}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
              {category.description || "Prendas de alta resistencia y siluetas forjadas para el entrenamiento con pesas."}
            </p>
          </div>

          {/* Selector de Otras Categorías (Pills rápidas) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-8 pb-1 scrollbar-none">
            <span className="text-xs font-bold text-muted-foreground uppercase shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Explorar:
            </span>
            {allCategories.map((cat) => {
              const isCurrent = cat.slug === category.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground border-border-subtle"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Barra de Filtros y Ordenamiento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filtro por Ajuste / Fit */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-primary" />
              Ajuste:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFit("all")}
              className={`text-xs font-bold uppercase px-3 py-1 rounded-md transition-colors ${
                selectedFit === "all"
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border-subtle"
              }`}
            >
              Todos ({products.length})
            </button>
            {availableFits.map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => setSelectedFit(fit)}
                className={`text-xs font-bold uppercase px-3 py-1 rounded-md transition-colors ${
                  selectedFit === fit
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted-foreground hover:text-foreground border border-border-subtle"
                }`}
              >
                {fit}
              </button>
            ))}
          </div>

          {/* Ordenar por Precio */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
              Ordenar:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface border border-border-subtle text-foreground text-xs font-bold uppercase rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. Grid de Productos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="bg-surface border border-border-subtle rounded-2xl p-16 text-center space-y-4">
            <SlidersHorizontal className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-display text-2xl uppercase tracking-wider text-foreground">
              No hay prendas con el filtro seleccionado
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Prueba cambiando los filtros de ajuste o explora otras categorías activas de Gymbees.
            </p>
            <button
              onClick={() => setSelectedFit("all")}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
