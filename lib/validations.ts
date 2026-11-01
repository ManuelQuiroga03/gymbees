import { z } from 'zod';

/**
 * Esquema Zod estándar para validación estricta de identificadores UUID v4.
 * Admite formatos canónicos en minúsculas/mayúsculas compatibles con PostgreSQL.
 */
export const uuidSchema = z.string().uuid({
  message: 'El identificador proporcionado no tiene un formato UUID válido',
});

/**
 * Validador síncrono rápido para comprobar si un valor es un UUID válido.
 * Evita inyecciones o tipos erróneos en parámetros antes de consultar PostgreSQL.
 */
export function isUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return uuidSchema.safeParse(value).success;
}

/**
 * Convierte un valor a un UUID sanitizado en minúsculas si es válido, o retorna null.
 */
export function toSafeUUID(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  return isUUID(trimmed) ? trimmed : null;
}
