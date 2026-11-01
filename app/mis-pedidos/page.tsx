import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowLeft, ArrowUpRight, ShoppingBag } from "lucide-react";

export default async function MisPedidosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/mis-pedidos");
  }

  const orders = await query(
    `SELECT * FROM orders WHERE user_id::text = $1::text ORDER BY created_at DESC`,
    [user.id]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <Link
            href="/"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la tienda</span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-foreground">
            MIS PEDIDOS &amp; HISTORIAL
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Atleta: <strong className="text-foreground">{user.fullName}</strong> ({user.email})
          </p>
        </div>

        <Link
          href="/"
          className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-glow transition-all text-center"
        >
          Explorar Nuevo Drop
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-surface border border-border-subtle rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-2xl uppercase tracking-wider text-foreground">
            AÚN NO TIENES COMPRAS REGISTRADAS
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tus órdenes confirmadas y números de rastreo de DHL/Estafeta se archivarán aquí.
          </p>
          <Link
            href="/"
            className="inline-block bg-surface-elevated hover:bg-border-subtle text-foreground text-xs font-bold px-6 py-2.5 rounded-xl border border-border-subtle transition-colors"
          >
            Ver Catálogo Activo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-border-strong transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-base text-foreground">
                    {o.order_number}
                  </span>
                  <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    {o.status === "processing" ? "EN PREPARACIÓN" : o.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comprado el {new Date(o.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">TOTAL</span>
                  <span className="font-mono font-black text-primary text-base">
                    {formatPrice(o.total)}
                  </span>
                </div>

                <Link
                  href={`/orden/${o.order_number}`}
                  className="bg-surface-elevated hover:bg-border-subtle text-foreground text-xs font-bold px-4 py-2.5 rounded-xl border border-border-subtle flex items-center gap-1.5 transition-colors"
                >
                  <span>Ver Ticket</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
