const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function updatePassword() {
  const email = "fariasdaniel197@gmail.com";
  const plainPassword = "besame123"; // Escribe aquí tu contraseña deseada
  
  // Generamos el hash con un costo estándar de 10
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const result = await pool.query(
      'UPDATE "User" SET "password" = $1 WHERE "email" = $2 RETURNING email',
      [hashedPassword, email]
    );

    if (result.rowCount > 0) {
      console.log(`¡Contraseña actualizada con éxito para el usuario: ${email}!`);
      console.log(`Usa la contraseña: "${plainPassword}" para iniciar sesión.`);
    } else {
      console.log(`El correo ${email} no se encontró en la base de datos.`);
    }
  } catch (err) {
    console.error('Error al actualizar:', err);
  } finally {
    await pool.end();
  }
}

updatePassword();