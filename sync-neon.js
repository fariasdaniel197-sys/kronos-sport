const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Conectando a Neon para crear las tablas de tu tienda...');

    // Crear tabla User
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "password" TEXT NOT NULL,
        "phone" TEXT,
        "birthdate" TIMESTAMP(3),
        "points" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla Product
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "oldPrice" DOUBLE PRECISION,
        "stock" INTEGER NOT NULL,
        "category" TEXT NOT NULL,
        "brand" TEXT,
        "sizes" TEXT[],
        "image" TEXT,
        "description" TEXT,
        "isPromo" BOOLEAN NOT NULL DEFAULT false,
        "isDiscount" BOOLEAN NOT NULL DEFAULT false,
        "badge" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    // Crear tabla Order
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "total" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Pendiente',
        "shippingMethod" TEXT NOT NULL,
        "paymentMethod" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla OrderItem
    await client.query(`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "quantity" INTEGER NOT NULL,
        CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log('¡Base de datos en Neon sincronizada con éxito!');
  } catch (err) {
    console.error('Error al sincronizar:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();