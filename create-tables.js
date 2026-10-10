const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    console.log("Creando tablas en la base de datos de Neon...");

    // Crear tabla Product si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Product" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        "oldPrice" DOUBLE PRECISION,
        stock INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL,
        brand TEXT,
        sizes TEXT[],
        image TEXT,
        description TEXT,
        "isPromo" BOOLEAN DEFAULT FALSE,
        "isDiscount" BOOLEAN DEFAULT FALSE,
        badge TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("¡Tabla 'Product' creada o verificada con éxito en Neon!");
  } catch (err) {
    console.error("Error al crear las tablas:", err);
  } finally {
    await pool.end();
  }
}

createTables();