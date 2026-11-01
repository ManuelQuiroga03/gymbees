import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const products = await query(`
    SELECT p.*, c.name as category_name,
      COALESCE(
        json_agg(
          CASE WHEN v.id IS NOT NULL THEN
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'size', v.size,
              'colorName', v.color_name,
              'price', COALESCE(v.price_override, p.base_price),
              'stock', COALESCE(i.stock_quantity, 0),
              'lowStockThreshold', COALESCE(i.low_stock_threshold, 3)
            )
          ELSE NULL END
          ORDER BY v.size
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'::json
      ) as variants
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_variants v ON p.id = v.product_id
    LEFT JOIN inventory i ON v.id = i.variant_id
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
  `);

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, categoryId, description, materialGsm, fitType, basePrice, images, variants } = body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const numericPrice = Number(basePrice);

    if (!trimmedName) {
      return NextResponse.json({ error: 'El nombre de la prenda es obligatorio' }, { status: 400 });
    }

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ error: 'El precio base debe ser un número mayor a cero' }, { status: 400 });
    }

    // Generar slug limpio
    const baseSlug = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${baseSlug || 'drop'}-${Date.now().toString().slice(-4)}`;

    // Normalizar imágenes a array de strings
    const validImages = Array.isArray(images) 
      ? images.filter((img) => typeof img === 'string' && img.trim().length > 0)
      : [];

    // 1. Insertar producto en base de datos
    const prodRows = await query(
      `INSERT INTO products (name, slug, category_id, description, material_gsm, fit_type, base_price, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, slug, base_price, images`,
      [
        trimmedName,
        slug,
        categoryId && typeof categoryId === 'string' && categoryId.length === 36 ? categoryId : null,
        description || '',
        materialGsm || '240 GSM Algodón Peinado',
        ['oversized', 'compression', 'regular', 'athletic'].includes(fitType) ? fitType : 'oversized',
        numericPrice,
        JSON.stringify(validImages),
      ]
    );

    const product = prodRows[0];

    // 2. Insertar variantes e inventario
    const defaultSizes = ['S', 'M', 'L', 'XL'];
    const variantsToInsert = Array.isArray(variants) && variants.length > 0
      ? variants
      : defaultSizes.map(size => ({ size, stock: 10, colorName: 'Negro' }));

    for (const v of variantsToInsert) {
      const cleanSize = typeof v.size === 'string' ? v.size.toUpperCase().trim() : 'M';
      const cleanColor = v.colorName || 'Negro';
      const cleanPrefix = trimmedName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'DROP';
      const sku = `GB-${cleanPrefix}-${cleanColor.substring(0, 3).toUpperCase()}-${cleanSize}-${Date.now().toString().slice(-3)}`;

      const varRows = await query(
        `INSERT INTO product_variants (product_id, sku, size, color_name, color_hex, price_override)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (product_id, size, color_name) DO UPDATE 
         SET price_override = EXCLUDED.price_override
         RETURNING id`,
        [
          product.id,
          sku,
          cleanSize,
          cleanColor,
          v.colorHex || '#111111',
          v.price ? Number(v.price) : numericPrice,
        ]
      );

      const variantId = varRows[0].id;
      const stockQty = Math.max(0, Number(v.stock) || 0);

      await query(
        `INSERT INTO inventory (variant_id, stock_quantity, low_stock_threshold)
         VALUES ($1, $2, 3)
         ON CONFLICT (variant_id) DO UPDATE SET stock_quantity = $2`,
        [variantId, stockQty]
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: error.message || 'Error al registrar el producto' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, description, materialGsm, fitType, basePrice, images, variants, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID del producto es obligatorio' }, { status: 400 });
    }

    const trimmedName = typeof name === 'string' ? name.trim() : null;
    const numericPrice = basePrice !== undefined ? Number(basePrice) : null;

    if (numericPrice !== null && (isNaN(numericPrice) || numericPrice <= 0)) {
      return NextResponse.json({ error: 'El precio debe ser un número mayor a cero' }, { status: 400 });
    }

    // Normalizar imágenes si vienen en la petición
    let imagesJson = null;
    if (images !== undefined) {
      const validImages = Array.isArray(images)
        ? images.filter((img) => typeof img === 'string' && img.trim().length > 0)
        : [];
      imagesJson = JSON.stringify(validImages);
    }

    const categoryParam = categoryId !== undefined
      ? (typeof categoryId === 'string' && categoryId.length === 36 ? categoryId : null)
      : '__UNCHANGED__';

    // Actualizar producto en Postgres
    const updatedRows = await query(
      `UPDATE products 
       SET 
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         material_gsm = COALESCE($3, material_gsm),
         fit_type = COALESCE($4, fit_type),
         base_price = COALESCE($5, base_price),
         images = CASE WHEN $6::jsonb IS NOT NULL THEN $6::jsonb ELSE images END,
         category_id = CASE 
           WHEN $8 = '__UNCHANGED__' THEN category_id 
           WHEN $8 IS NULL OR $8 = '' THEN NULL 
           ELSE $8::uuid 
         END,
         updated_at = NOW()
       WHERE id::text = $7
       RETURNING *`,
      [
        trimmedName,
        description !== undefined ? description : null,
        materialGsm !== undefined ? materialGsm : null,
        fitType !== undefined ? fitType : null,
        numericPrice,
        imagesJson,
        id,
        categoryParam,
      ]
    );

    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Actualizar inventario de variantes si se enviaron
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id && v.stock !== undefined) {
          await query(
            `UPDATE inventory 
             SET stock_quantity = $1, updated_at = NOW() 
             WHERE variant_id = $2`,
            [Math.max(0, Number(v.stock)), v.id]
          );
        }
      }
    }

    return NextResponse.json({ success: true, product: updatedRows[0] });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    // Eliminar producto (ON DELETE CASCADE en variantes e inventario)
    await query(`DELETE FROM products WHERE id::text = $1`, [id]);

    return NextResponse.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar producto' }, { status: 500 });
  }
}
