import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getAllCategories } from '@/lib/products';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories in admin:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { id, slug, imageUrl, tag, description, name } = body;

    const identifier = id || slug;
    if (!identifier) {
      return NextResponse.json({ error: 'Se requiere ID o slug de la categoría' }, { status: 400 });
    }

    // Asegurar que las columnas existen en PostgreSQL
    try {
      await query(`ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;`);
      await query(`ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tag TEXT;`);
    } catch (colErr) {
      console.warn('Nota sobre columnas en categories:', colErr);
    }

    // Ejecutar actualización
    const updated = await query(
      `
      UPDATE public.categories
      SET 
        image_url = COALESCE($1, image_url),
        tag = COALESCE($2, tag),
        description = COALESCE($3, description),
        name = COALESCE($4, name)
      WHERE id = $5 OR slug = $5
      RETURNING id, name, slug, description, sort_order, image_url, tag;
      `,
      [imageUrl || null, tag || null, description || null, name || null, identifier]
    );

    if (updated && updated.length > 0) {
      const r = updated[0];
      return NextResponse.json({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        sortOrder: r.sort_order,
        imageUrl: r.image_url,
        tag: r.tag,
      });
    }

    // Fallback: si no se actualizó en DB (ej. ID seed estático), responder con datos fusionados
    return NextResponse.json({
      id: identifier,
      slug: slug || identifier,
      name,
      imageUrl,
      tag,
      description,
      status: 'updated_fallback',
    });
  } catch (error: any) {
    console.error('Error actualizando categoría:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar categoría' }, { status: 500 });
  }
}
