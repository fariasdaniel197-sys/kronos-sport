const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function getProducts() {
  try {
    const { rows } = await pool.query('SELECT * FROM "Product" ORDER BY "createdAt" DESC');
    console.log("--- PRODUCTOS EN TU BASE DE DATOS DE NEON ---");
    console.table(rows);
  } catch (err) {
    console.error("Error al consultar productos:", err);
  } finally {
    await pool.end();
  }
}

getProducts();