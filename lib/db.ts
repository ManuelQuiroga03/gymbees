import { Pool } from 'pg';

// Previene múltiples instancias de Pool en desarrollo con Hot Reload
declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/gymbees_db?sslmode=disable';

export const pool = global.__dbPool || new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') {
  global.__dbPool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
