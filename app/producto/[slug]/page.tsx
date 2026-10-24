import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getFeaturedProducts } from "@/lib/products";
import { ProductPageClient } from "@/components/product/ProductPageClient";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Gymbees México",
      description: "La prenda de entrenamiento solicitada no se encuentra disponible.",
    };
  }

  return {
    title: `${product.name} | Gymbees Heavy Club`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Gymbees Heavy Club`,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Obtener otros productos para sección de recomendados (excluyendo el actual)
  const allProducts = await getFeaturedProducts();
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <ProductPageClient product={product} relatedProducts={relatedProducts} />
  );
}
