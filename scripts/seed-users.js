const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/gymbees_db?sslmode=disable'
});

async function seed() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('usuario123', 10);
  const atletaHash = await bcrypt.hash('atleta123', 10);

  console.log('Generated clean hashes.');

  // Limpiar usuarios anteriores para evitar hashes corruptos
  await pool.query('DELETE FROM users');

  const users = [
    {
      email: 'admin@gymbees.com',
      hash: adminHash,
      name: 'Administrador Gymbees',
      role: 'admin'
    },
    {
      email: 'admin@gymbees.mx',
      hash: adminHash,
      name: 'Administrador Gymbees MX',
      role: 'admin'
    },
    {
      email: 'usuario@gymbees.com',
      hash: userHash,
      name: 'Usuario Común',
      role: 'customer'
    },
    {
      email: 'atleta@gymbees.mx',
      hash: atletaHash,
      name: 'Atleta Heavyweight',
      role: 'customer'
    }
  ];

  for (const u of users) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id, email, role`,
      [u.email, u.hash, u.name, u.role]
    );
    console.log(`User created: ${res.rows[0].email} (${res.rows[0].role})`);

    // Sincronizar profiles
    await pool.query(
      `INSERT INTO profiles (id, email, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [res.rows[0].id, u.email, u.name, u.role]
    );
  }

  await pool.end();
  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
