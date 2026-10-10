const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function fixUserDate() {
  const email = "fariasdaniel197@gmail.com";
  // Pon aquí la fecha real en la que creaste tu cuenta originalmente (ejemplo: '2026-09-01T00:00:00Z')
  const originalDate = "2026-09-01T12:00:00Z"; 

  try {
    const result = await pool.query(
      'UPDATE "User" SET "createdAt" = $1 WHERE "email" = $2 RETURNING email, "createdAt"',
      [originalDate, email]
    );

    if (result.rowCount > 0) {
      console.log(`¡Fecha de registro corregida con éxito para ${email}! Nueva fecha:`, result.rows[0].createdAt);
    } else {
      console.log("No se encontró el usuario.");
    }
  } catch (err) {
    console.error("Error al actualizar la fecha:", err);
  } finally {
    await pool.end();
  }
}

fixUserDate();