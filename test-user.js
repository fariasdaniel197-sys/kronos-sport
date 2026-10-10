const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function createTestUser() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  try {
    await pool.query(
      `INSERT INTO "User" (id, email, name, password, points) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      ['test-id-123', 'admin@hollister.com', 'Admin Test', hashedPassword, 100]
    );
    console.log('¡Usuario de prueba creado con éxito en Neon!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

createTestUser();