import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border-subtle pt-16 pb-12 text-muted-foreground">
      {/* Value props strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-border-subtle">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-foreground">ENVÍOS A TODO MÉXICO</h4>
              <p className="text-[11px] text-muted-foreground">Gratis en compras &gt;$1,299 MXN</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-foreground">GARANTÍA DE AJUSTE</h4>
              <p className="text-[11px] text-muted-foreground">Primer cambio de talla sin fricción</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-foreground">PAGA EN QUINCENAS</h4>
              <p className="text-[11px] text-muted-foreground">Sin tarjeta con Kueski Pay</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-foreground">ALGODÓN 240+ GSM</h4>
              <p className="text-[11px] text-muted-foreground">Confección nacional prémium</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo/white_bee.png"
                alt="Gymbees Isotipo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display text-3xl tracking-widest text-foreground">
              GYMBEES
            </span>
          </div>
          <p className="text-xs leading-relaxed max-w-sm">
            Indumentaria deportiva forjada para levantadores de fuerza y entusiastas del fitness en México. Siluetas masivas de 240 GSM y estética de culto.
          </p>
        </div>

        <div>
          <h5 className="font-display text-lg tracking-wider uppercase text-foreground mb-4">
            COLECCIONES
          </h5>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li><Link href="/#drop" className="hover:text-foreground transition-colors">Nuevo Drop 01</Link></li>
            <li><Link href="/categoria/pump-covers" className="hover:text-foreground transition-colors">Pump Covers (Oversized)</Link></li>
            <li><Link href="/categoria/compresion" className="hover:text-foreground transition-colors">Playeras de Compresión</Link></li>
            <li><Link href="/categoria/bottoms" className="hover:text-foreground transition-colors">Baggys y Sweatpants</Link></li>
            <li><Link href="/categoria/accesorios" className="hover:text-foreground transition-colors">Accesorios de Levantamiento</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-display text-lg tracking-wider uppercase text-foreground mb-4">
            ATENCIÓN AL ATLETA
          </h5>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li><Link href="#size-guide" className="hover:text-foreground transition-colors">Guía de Tallas &amp; Medidas</Link></li>
            <li><Link href="#shipping" className="hover:text-foreground transition-colors">Tiempos y Costos de Envío</Link></li>
            <li><Link href="#returns" className="hover:text-foreground transition-colors">Política de Cambios</Link></li>
            <li><Link href="#contact" className="hover:text-foreground transition-colors">WhatsApp de Soporte</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-display text-lg tracking-wider uppercase text-foreground mb-4">
            MÉTODOS DE PAGO
          </h5>
          <p className="text-xs mb-3">
            Aceptamos pagos seguros en México a través de pasarelas certificadas:
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-foreground">
            <span className="bg-surface-elevated border border-border-subtle px-2.5 py-1 rounded">KUESKI PAY</span>
            <span className="bg-surface-elevated border border-border-subtle px-2.5 py-1 rounded">MERCADO PAGO</span>
            <span className="bg-surface-elevated border border-border-subtle px-2.5 py-1 rounded">OXXO PAY</span>
            <span className="bg-surface-elevated border border-border-subtle px-2.5 py-1 rounded">VISA / MC</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-border-subtle text-center text-xs">
        <p>© 2026 GYMBEES MÉXICO. Todos los derechos reservados. Diseñado para atletas de alto rendimiento.</p>
      </div>
    </footer>
  );
}
