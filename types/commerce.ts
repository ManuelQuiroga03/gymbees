export type ProductFit = 'oversized' | 'compression' | 'regular' | 'athletic';
export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | 'OS';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: ClothingSize;
  colorName: string;
  colorHex: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isLowStock: boolean;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  materialGsm: string;
  fitType: ProductFit;
  basePrice: number;
  images: string[];
  variants: ProductVariant[];
  hasLowStock?: boolean;
}

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  size: ClothingSize;
  colorName: string;
  price: number;
  image?: string;
  quantity: number;
  maxStock: number;
}
