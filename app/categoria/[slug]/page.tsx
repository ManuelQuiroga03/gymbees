import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductsByCategory, getAllCategories } from "@/lib/products";
import { CategoryView } from "@/components/category/CategoryView";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getProductsByCategory(slug);

  if (!category) {
    return {
      title: "Categoría no encontrada | Gymbees México",
      description: "La colección solicitada no se encuentra disponible.",
    };
  }

  return {
    title: `${category.name} | Gymbees Heavy Club`,
    description: category.description || `Explora las prendas de ${category.name} en Gymbees México.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategory(slug);

  if (!category) {
    notFound();
  }

  const allCategories = await getAllCategories();

  return (
    <CategoryView
      category={category}
      products={products}
      allCategories={allCategories}
    />
  );
}
