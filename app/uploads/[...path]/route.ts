import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];

    // Prevenir Directory Traversal
    for (const segment of pathSegments) {
      if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) {
        return new NextResponse('Invalid path', { status: 400 });
      }
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments);

    // Verificar existencia
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      return new NextResponse('Not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error al servir archivo de subida:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
