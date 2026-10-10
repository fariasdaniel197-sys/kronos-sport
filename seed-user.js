const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function registerMyUser() {
  const email = "fariasdaniel197@gmail.com";
  const plainPassword = "besame123"; // Pon aquí la contraseña con la que deseas entrar
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const id = crypto.randomUUID();

  try {
    // Comprobamos si ya existe para actualizarlo o crearlo
    const check = await pool.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    
    if (check.rows.length > 0) {
      await pool.query('UPDATE "User" SET "password" = $1 WHERE "email" = $2', [hashedPassword, email]);
      console.log(`¡Contraseña actualizada con éxito para ${email}!`);
    } else {
      await pool.query(
        `INSERT INTO "User" (id, email, name, password, points) VALUES ($1, $2, $3, $4, $5)`,
        [id, email, "Luis Daniel", hashedPassword, 100]
      );
      console.log(`¡Usuario ${email} registrado con éxito en Neon!`);
    }
  } catch (err) {
    console.error('Error al registrar usuario:', err);
  } finally {
    await pool.end();
  }
}

registerMyUser();