"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  LayoutDashboard, 
  PackageCheck, 
  LogOut 
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "DROPS", href: "/#drop", isHighlight: true },
  { label: "PUMP COVERS", href: "/categoria/pump-covers" },
  { label: "COMPRESIÓN", href: "/categoria/compresion" },
  { label: "BAGGYS", href: "/categoria/bottoms" },
  { label: "ACCESORIOS", href: "/categoria/accesorios" },
];

export function Header() {
  const { totalItems, openCart } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border-subtle transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Lado Izquierdo: Botón Menú Mobile + Logo GYMBEES */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-8 h-8 md:w-9 md:h-9 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo/white_bee.png"
                  alt="Gymbees Isotipo"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_2px_8px_rgba(240,237,230,0.15)]"
                />
              </div>
              <span className="font-display text-2xl md:text-3xl tracking-widest text-foreground group-hover:text-primary transition-colors">
                GYMBEES
              </span>
            </Link>
          </div>

          {/* Navegación Desktop: Centrada y limpia */}
          <nav className="hidden lg:flex items-center space-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-bold tracking-widest uppercase transition-colors hover:text-foreground ${
                  link.isHighlight
                    ? "text-primary border-b border-primary pb-0.5"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Lado Derecho: Menú de Usuario / Login + Carrito */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              /* Menú desplegable cuando el usuario está logueado */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider transition-all ${
                    user.role === "admin"
                      ? "border-primary/40 bg-surface-elevated text-primary hover:border-primary"
                      : "border-border-subtle bg-surface hover:bg-surface-elevated text-foreground"
                  }`}
                  aria-expanded={userDropdownOpen}
                >
                  {user.role === "admin" ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-mono text-[11px] font-black uppercase">ADMIN</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[85px] sm:max-w-[120px]">
                        {user.fullName.split(" ")[0]}
                      </span>
                    </>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown flotante */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border-subtle shadow-2xl p-2 py-2 text-xs z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-2 border-b border-border-subtle mb-1">
                      <p className="font-bold text-foreground truncate">{user.fullName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        user.role === "admin" 
                          ? "bg-primary/20 text-primary border border-primary/30" 
                          : "bg-surface-elevated text-muted-foreground border border-border-subtle"
                      }`}>
                        {user.role === "admin" ? "⚡ Administrador" : "Atleta Miembro"}
                      </span>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated hover:text-primary transition-colors font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary shrink-0" />
                        <span>Panel de Control</span>
                      </Link>
                    )}

                    <Link
                      href="/mis-pedidos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated hover:text-primary transition-colors font-medium"
                    >
                      <PackageCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>Mis Pedidos</span>
                    </Link>

                    <div className="my-1 border-t border-border-subtle" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Enlace para Ingresar */
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>INGRESAR</span>
              </Link>
            )}

            {/* Botón Carrito / Bolsa */}
            <button
              onClick={openCart}
              className="bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-border-strong text-foreground px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-sm active:scale-95 shrink-0"
              aria-label="Abrir bolsa de compra"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline font-mono">BOLSA</span>
              <span className="bg-primary text-primary-foreground text-[10px] font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-surface border-r border-border-subtle p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7">
                    <Image
                      src="/images/logo/white_bee.png"
                      alt="Gymbees Isotipo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-display text-2xl tracking-widest text-foreground">
                    GYMBEES
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Info de Usuario Móvil */}
              {user ? (
                <div className="mt-4 p-3 bg-surface-elevated rounded-xl border border-border-subtle">
                  <p className="text-xs font-bold text-foreground">{user.fullName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    {user.role === "admin" ? "👑 Admin" : "Atleta"}
                  </span>
                </div>
              ) : (
                <div className="mt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl"
                  >
                    <User className="w-4 h-4" />
                    <span>Iniciar Sesión / Registrarse</span>
                  </Link>
                </div>
              )}

              <nav className="mt-6 flex flex-col space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold tracking-wider uppercase transition-colors ${
                      link.isHighlight ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary pt-3 border-t border-border-subtle"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Panel de Control (Admin)</span>
                  </Link>
                )}

                {user && (
                  <Link
                    href="/mis-pedidos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground pt-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Mis Pedidos</span>
                  </Link>
                )}

                {user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider text-rose-400 pt-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </nav>
            </div>

            <div className="pt-6 border-t border-border-subtle text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">HEAVYWEIGHT ATHLETIC CLUB</p>
              <p>Envíos a todo México vía DHL / Estafeta.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
