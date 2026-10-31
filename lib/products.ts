import { query } from '@/lib/db';
import { Product, ProductVariant, Category } from '@/types/commerce';

const parseImages = (images: any): string[] => {
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Seed / Demo fallback data in case local DB is not currently running
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Pump Covers (Oversized)',
    slug: 'pump-covers',
    description: 'Playeras pesadas de 240+ GSM con corte de hombro caído y serigrafía de alto impacto.',
    tag: '240+ GSM HEAVYWEIGHT',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200',
    sortOrder: 1,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Compression Wear',
    slug: 'compresion',
    description: 'Playeras de compresión de alta elasticidad para soporte muscular y máxima definición.',
    tag: '4-WAY STRETCH',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
    sortOrder: 2,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Baggys & Bottoms',
    slug: 'bottoms',
    description: 'Pants holgados, shorts de entrenamiento y joggers estilo Golden Era con movilidad total.',
    tag: 'GOLDEN ERA MOBILITY',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    sortOrder: 3,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Accesorios de Fuerza',
    slug: 'accesorios',
    description: 'Straps de levantamiento, muñequeras reforzadas y calcetas tubulares Heavy Club.',
    tag: 'HEAVY CLUB ESSENTIALS',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    sortOrder: 4,
  },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    categoryName: 'Pump Covers (Oversized)',
    name: 'Nolan Grayson Heavy Pump Cover',
    slug: 'nolan-heavy-pump-cover',
    description:
      'Playera oversized de alto gramaje inspirada en Nolan Grayson. Confeccionada con algodón peinado premium de 240 GSM con costuras reforzadas en hombro y cuello acanalado anti-deformación. Diseñada para cubrir el físico durante el calentamiento y revelar el bombeo muscular con caída impecable.',
    materialGsm: '240 GSM Algodón Peinado',
    fitType: 'oversized',
    basePrice: 649.0,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    ],
    variants: [
      {
        id: 'b1111111-1111-1111-1111-111111111101',
        productId: 'a1111111-1111-1111-1111-111111111111',
        sku: 'GB-NOLAN-BLK-S',
        size: 'S',
        colorName: 'Negro Deslavado',
        colorHex: '#18181B',
        price: 649.0,
        compareAtPrice: 799.0,
        stockQuantity: 15,
        isLowStock: false,
        isAvailable: true,
      },
      {
        id: 'b1111111-1111-1111-1111-111111111102',
        productId: 'a1111111-1111-1111-1111-111111111111',
        sku: 'GB-NOLAN-BLK-M',
        size: 'M',
        colorName: 'Negro Deslavado',
        colorHex: '#18181B',
        price: 649.0,
        compareAtPrice: 799.0,
        stockQuantity: 25,
        isLowStock: false,
        isAvailable: true,
      },
      {
        id: 'b1111111-1111-1111-1111-111111111103',
        productId: 'a1111111-1111-1111-1111-111111111111',
        sku: 'GB-NOLAN-BLK-L',
        size: 'L',
        colorName: 'Negro Deslavado',
        colorHex: '#18181B',
        price: 649.0,
        compareAtPrice: 799.0,
        stockQuantity: 3,
        isLowStock: true,
        isAvailable: true,
      },
      {
        id: 'b1111111-1111-1111-1111-111111111104',
        productId: 'a1111111-1111-1111-1111-111111111111',
        sku: 'GB-NOLAN-BLK-XL',
        size: 'XL',
        colorName: 'Negro Deslavado',
        colorHex: '#18181B',
        price: 649.0,
        compareAtPrice: 799.0,
        stockQuantity: 10,
        isLowStock: false,
        isAvailable: true,
      },
      {
        id: 'b1111111-1111-1111-1111-111111111105',
        productId: 'a1111111-1111-1111-1111-111111111111',
        sku: 'GB-NOLAN-BLK-2XL',
        size: '2XL',
        colorName: 'Negro Deslavado',
        colorHex: '#18181B',
        price: 649.0,
        compareAtPrice: 799.0,
        stockQuantity: 0,
        isLowStock: false,
        isAvailable: false,
      },
    ],
    hasLowStock: true,
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    categoryId: 'c2222222-2222-2222-2222-222222222222',
    categoryName: 'Compression Wear',
    name: 'Akaza Blood Compression Tee',
    slug: 'akaza-compression-tee',
    description:
      'Prenda de compresión técnica de alto rendimiento. Tejido elástico en 4 direcciones que optimiza la circulación y el soporte muscular durante series pesadas de empuje y tirón. Secado ultrarrápido y silueta de segunda piel.',
    materialGsm: '220 GSM Spandex Blend',
    fitType: 'compression',
    basePrice: 599.0,
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&q=80&w=800',
    ],
    variants: [
      {
        id: 'b2222222-2222-2222-2222-222222222201',
        productId: 'a2222222-2222-2222-2222-222222222222',
        sku: 'GB-AKAZA-BLK-M',
        size: 'M',
        colorName: 'Negro Grafito',
        colorHex: '#0D0D0E',
        price: 599.0,
        compareAtPrice: 699.0,
        stockQuantity: 20,
        isLowStock: false,
        isAvailable: true,
      },
      {
        id: 'b2222222-2222-2222-2222-222222222202',
        productId: 'a2222222-2222-2222-2222-222222222222',
        sku: 'GB-AKAZA-BLK-L',
        size: 'L',
        colorName: 'Negro Grafito',
        colorHex: '#0D0D0E',
        price: 599.0,
        compareAtPrice: 699.0,
        stockQuantity: 2,
        isLowStock: true,
        isAvailable: true,
      },
      {
        id: 'b2222222-2222-2222-2222-222222222203',
        productId: 'a2222222-2222-2222-2222-222222222222',
        sku: 'GB-AKAZA-BLK-XL',
        size: 'XL',
        colorName: 'Negro Grafito',
        colorHex: '#0D0D0E',
        price: 599.0,
        compareAtPrice: 699.0,
        stockQuantity: 8,
        isLowStock: false,
        isAvailable: true,
      },
    ],
    hasLowStock: true,
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    categoryId: 'c3333333-3333-3333-3333-333333333333',
    categoryName: 'Bottoms & Baggys',
    name: 'Berserk Golden Age Baggy Pants',
    slug: 'berserk-golden-age-baggy-pants',
    description:
      'Pants de entrenamiento con silueta baggy ancha inspirada en la época dorada del culturismo. Cintura elástica gruesa con cordón interno de ajuste y bolsillos laterales con cierre para tus llaves y celular.',
    materialGsm: '320 GSM French Terry',
    fitType: 'regular',
    basePrice: 799.0,
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800',
    ],
    variants: [
      {
        id: 'b3333333-3333-3333-3333-333333333301',
        productId: 'a3333333-3333-3333-3333-333333333333',
        sku: 'GB-BAGGY-BLK-M',
        size: 'M',
        colorName: 'Negro Carbón',
        colorHex: '#121212',
        price: 799.0,
        compareAtPrice: 899.0,
        stockQuantity: 12,
        isLowStock: false,
        isAvailable: true,
      },
      {
        id: 'b3333333-3333-3333-3333-333333333302',
        productId: 'a3333333-3333-3333-3333-333333333333',
        sku: 'GB-BAGGY-BLK-L',
        size: 'L',
        colorName: 'Negro Carbón',
        colorHex: '#121212',
        price: 799.0,
        compareAtPrice: 899.0,
        stockQuantity: 14,
        isLowStock: false,
        isAvailable: true,
      },
    ],
    hasLowStock: false,
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    categoryId: 'c4444444-4444-4444-4444-444444444444',
    categoryName: 'Accesorios de Levantamiento',
    name: 'Heavy Duty Figure 8 Straps',
    slug: 'heavy-duty-figure-8-straps',
    description:
      'Straps en forma de 8 de algodón y nylon reforzado para peso muerto pesado. Elimina la fatiga del agarre y transfiere la carga directamente a los dorsales con seguridad absoluta.',
    materialGsm: 'Nylon reforzado con costura cruzada',
    fitType: 'athletic',
    basePrice: 299.0,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    ],
    variants: [
      {
        id: 'b4444444-4444-4444-4444-444444444401',
        productId: 'a4444444-4444-4444-4444-444444444444',
        sku: 'GB-STRAPS-OS',
        size: 'OS',
        colorName: 'Negro / Amarillo Abeja',
        colorHex: '#EAB308',
        price: 299.0,
        compareAtPrice: 350.0,
        stockQuantity: 40,
        isLowStock: false,
        isAvailable: true,
      },
    ],
    hasLowStock: false,
  },
];

function mapDatabaseProducts(rawProducts: any[], rawVariants: any[]): Product[] {
  return rawProducts.map((p) => {
    const variants: ProductVariant[] = rawVariants
      .filter((v) => v.product_id === p.id)
      .map((v) => {
        const stock = v.stock_quantity || 0;
        const lowThreshold = v.low_stock_threshold || 3;
        return {
          id: v.id,
          productId: v.product_id,
          sku: v.sku,
          size: v.size,
          colorName: v.color_name,
          colorHex: v.color_hex,
          price: Number(v.price_override || p.base_price),
          compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
          stockQuantity: stock,
          isLowStock: stock > 0 && stock <= lowThreshold,
          isAvailable: stock > 0,
        };
      });

    return {
      id: p.id,
      categoryId: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      materialGsm: p.material_gsm,
      fitType: p.fit_type,
      basePrice: Number(p.base_price),
      categoryName: p.category_name,
      images: parseImages(p.images),
      variants,
      hasLowStock: variants.some((v) => v.isLowStock),
    };
  });
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const rawProducts = await query(`
      SELECT 
        p.id, 
        p.category_id,
        p.name, 
        p.slug, 
        p.description, 
        p.material_gsm, 
        p.fit_type, 
        p.base_price, 
        p.images,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `);

    if (!rawProducts || rawProducts.length === 0) {
      return FALLBACK_PRODUCTS;
    }

    const rawVariants = await query(`
      SELECT 
        v.id, 
        v.product_id, 
        v.sku, 
        v.size, 
        v.color_name, 
        v.color_hex, 
        v.price_override, 
        v.compare_at_price,
        i.stock_quantity,
        i.low_stock_threshold
      FROM product_variants v
      LEFT JOIN inventory i ON v.id = i.variant_id
      WHERE v.is_active = true
      ORDER BY v.size ASC
    `);

    return mapDatabaseProducts(rawProducts, rawVariants);
  } catch (err) {
    console.warn('DB connection error, using fallback catalog:', (err as any)?.message || err);
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rawProducts = await query(
      `
      SELECT 
        p.id, 
        p.category_id,
        p.name, 
        p.slug, 
        p.description, 
        p.material_gsm, 
        p.fit_type, 
        p.base_price, 
        p.images,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
      LIMIT 1
      `,
      [slug]
    );

    if (!rawProducts || rawProducts.length === 0) {
      const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
      return fallback || null;
    }

    const product = rawProducts[0];

    const rawVariants = await query(
      `
      SELECT 
        v.id, 
        v.product_id, 
        v.sku, 
        v.size, 
        v.color_name, 
        v.color_hex, 
        v.price_override, 
        v.compare_at_price,
        i.stock_quantity,
        i.low_stock_threshold
      FROM product_variants v
      LEFT JOIN inventory i ON v.id = i.variant_id
      WHERE v.product_id = $1 AND v.is_active = true
      ORDER BY v.size ASC
      `,
      [product.id]
    );

    const mapped = mapDatabaseProducts([product], rawVariants);
    return mapped[0] || null;
  } catch (err) {
    console.warn('DB error in getProductBySlug, checking fallback:', (err as any)?.message || err);
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    // Intentar leer con columnas extendidas (image_url, tag)
    const rows = await query(`
      SELECT id, name, slug, description, sort_order,
             COALESCE(image_url, NULL) as image_url,
             COALESCE(tag, NULL) as tag
      FROM categories
      ORDER BY sort_order ASC
    `).catch(async () => {
      // Fallback si las columnas no han sido migradas en PostgreSQL
      return await query(`
        SELECT id, name, slug, description, sort_order
        FROM categories
        ORDER BY sort_order ASC
      `);
    });

    if (!rows || rows.length === 0) {
      return FALLBACK_CATEGORIES;
    }

    return rows.map((r) => {
      const fallbackMatch = FALLBACK_CATEGORIES.find((c) => c.slug === r.slug);
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || fallbackMatch?.description,
        sortOrder: r.sort_order,
        imageUrl: r.image_url || fallbackMatch?.imageUrl,
        tag: r.tag || fallbackMatch?.tag,
      };
    });
  } catch (err) {
    console.warn('DB error in getAllCategories, using fallback:', (err as any)?.message || err);
    return FALLBACK_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const fallbackMatch = FALLBACK_CATEGORIES.find((c) => c.slug === slug) || null;
  try {
    const rows = await query(
      `
      SELECT id, name, slug, description, sort_order,
             COALESCE(image_url, NULL) as image_url,
             COALESCE(tag, NULL) as tag
      FROM categories
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    ).catch(async () => {
      return await query(
        `
        SELECT id, name, slug, description, sort_order
        FROM categories
        WHERE slug = $1
        LIMIT 1
        `,
        [slug]
      );
    });

    if (!rows || rows.length === 0) {
      return fallbackMatch;
    }

    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || fallbackMatch?.description,
      sortOrder: r.sort_order,
      imageUrl: r.image_url || fallbackMatch?.imageUrl,
      tag: r.tag || fallbackMatch?.tag,
    };
  } catch (err) {
    console.warn('DB error in getCategoryBySlug, using fallback:', (err as any)?.message || err);
    return fallbackMatch;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<{ category: Category | null; products: Product[] }> {
  try {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) {
      return { category: null, products: [] };
    }

    const rawProducts = await query(
      `
      SELECT 
        p.id, 
        p.category_id,
        p.name, 
        p.slug, 
        p.description, 
        p.material_gsm, 
        p.fit_type, 
        p.base_price, 
        p.images,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1 AND p.is_active = true
      ORDER BY p.created_at DESC
      `,
      [category.id]
    );

    if (!rawProducts || rawProducts.length === 0) {
      const fallbackProducts = FALLBACK_PRODUCTS.filter((p) => p.categoryId === category.id);
      return { category, products: fallbackProducts };
    }

    const rawVariants = await query(`
      SELECT 
        v.id, 
        v.product_id, 
        v.sku, 
        v.size, 
        v.color_name, 
        v.color_hex, 
        v.price_override, 
        v.compare_at_price,
        i.stock_quantity,
        i.low_stock_threshold
      FROM product_variants v
      LEFT JOIN inventory i ON v.id = i.variant_id
      WHERE v.is_active = true
      ORDER BY v.size ASC
    `);

    const products = mapDatabaseProducts(rawProducts, rawVariants);
    return { category, products };
  } catch (err) {
    console.warn('DB error in getProductsByCategory, using fallback:', (err as any)?.message || err);
    const category = FALLBACK_CATEGORIES.find((c) => c.slug === categorySlug) || null;
    const products = category
      ? FALLBACK_PRODUCTS.filter((p) => p.categoryId === category.id)
      : [];
    return { category, products };
  }
}
