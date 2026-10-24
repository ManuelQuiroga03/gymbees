import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "GYMBEES | Heavyweight Athletic & Gym Streetwear",
  description: "Ropa de entrenamiento de alto rendimiento, pump covers de 240+ GSM y prendas de compresión para levantadores pesados en México.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground flex flex-col">
        <AuthProvider>
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
