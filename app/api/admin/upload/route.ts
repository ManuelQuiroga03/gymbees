import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 1. Proteger endpoint: solo administradores
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Sube archivos JPG, PNG o WebP.' },
        { status: 400 }
      );
    }

    // 2. Limitar tamaño a 8 MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede el límite de 8 MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Crear directorio public/uploads/drops si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'drops');
    await mkdir(uploadDir, { recursive: true });

    // 4. Nombre seguro y único
    const ext = path.extname(file.name) || '.webp';
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadDir, cleanName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/drops/${cleanName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanName,
    });
  } catch (error) {
    console.error('Error al procesar subida de imagen:', error);
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
  }
}
