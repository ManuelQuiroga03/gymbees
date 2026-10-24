import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-background py-20 md:py-28">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-subtle text-xs font-bold uppercase tracking-widest text-primary mb-6 shadow-sm">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span>DROP 01: HEAVYWEIGHT CLUB</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-foreground uppercase leading-[0.88] max-w-5xl mx-auto">
          FORJADO PARA<br />
          <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-2">
            EL HIERRO
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Siluetas masivas de 240 GSM con caída pronunciada de hombro y prendas de compresión muscular. Diseñadas para resistir las sesiones de entrenamiento más pesadas en México.
        </p>

        {/* Dual Call To Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#drop"
            className="w-full sm:w-auto bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>COMPRAR DROP ACTIVO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="#categories"
            className="w-full sm:w-auto bg-surface hover:bg-surface-elevated text-foreground border border-border-subtle hover:border-border-strong font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center justify-center"
          >
            EXPLORAR CATEGORÍAS
          </Link>
        </div>
      </div>
    </section>
  );
}
