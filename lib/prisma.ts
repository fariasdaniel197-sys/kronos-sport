import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export const prisma = {
  user: {
    async findUnique(args: any) {
      const { where } = args;
      const client = await pool.connect();
      try {
        if (where.email) {
          const { rows } = await client.query('SELECT * FROM "User" WHERE "email" = $1 LIMIT 1', [where.email]);
          return rows[0] || null;
        }
        if (where.id) {
          const { rows } = await client.query('SELECT * FROM "User" WHERE "id" = $1 LIMIT 1', [where.id]);
          return rows[0] || null;
        }
        // <--- SOPORTE PARA BUSCAR POR CUPÓN PERSONAL --->
        if (where.personalCoupon) {
          const { rows } = await client.query('SELECT * FROM "User" WHERE "personalCoupon" = $1 LIMIT 1', [where.personalCoupon]);
          return rows[0] || null;
        }
        return null;
      } finally {
        client.release();
      }
    },
    async findFirst(args: any = {}) {
      const client = await pool.connect();
      try {
        const { where } = args;
        // Soporte si piden buscar con filtros (ej. personalCoupon: null)
        if (where?.personalCoupon === null) {
          const { rows } = await client.query('SELECT * FROM "User" WHERE "personalCoupon" IS NULL LIMIT 1');
          return rows[0] || null;
        }
        const { rows } = await client.query('SELECT * FROM "User" LIMIT 1');
        return rows[0] || null;
      } finally {
        client.release();
      }
    },
    async create(args: any) {
      const { data } = args;
      const id = crypto.randomUUID();
      const client = await pool.connect();
      try {
        // <--- INCLUIDO personalCoupon AL CREAR USUARIOS --->
        const { rows } = await client.query(
          `INSERT INTO "User" (id, email, name, password, phone, birthdate, points, "personalCoupon") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            id, 
            data.email, 
            data.name || null, 
            data.password, 
            data.phone || null, 
            data.birthdate || null, 
            data.points || 0,
            data.personalCoupon || null
          ]
        );
        return rows[0];
      } finally {
        client.release();
      }
    },
    async update(args: any) {
      const { where, data } = args;
      const client = await pool.connect();
      try {
        // <--- SOPORTE PARA ACTUALIZAR DATOS DE USUARIO (COMO EL CUPÓN) --->
        const { rows } = await client.query(
          `UPDATE "User" SET "personalCoupon" = COALESCE($1, "personalCoupon") WHERE id = $2 RETURNING *`,
          [data.personalCoupon || null, where.id]
        );
        return rows[0];
      } finally {
        client.release();
      }
    },
    async findMany(args: any = {}) {
      const client = await pool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM "User" ORDER BY "createdAt" DESC');
        return rows;
      } finally {
        client.release();
      }
    }
  },
  product: {
    async findMany(args: any = {}) {
      const client = await pool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM "Product" ORDER BY "createdAt" DESC');
        return rows;
      } finally {
        client.release();
      }
    },
    async findUnique(args: any) {
      const { where } = args;
      const client = await pool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM "Product" WHERE "id" = $1 LIMIT 1', [where.id]);
        return rows[0] || null;
      } finally {
        client.release();
      }
    },
    async create(args: any) {
      const { data } = args;
      const id = data.id || `prod-${Date.now()}`;
      const now = new Date();
      const client = await pool.connect();
      try {
        const { rows } = await client.query(
          `INSERT INTO "Product" (id, name, price, "oldPrice", stock, category, brand, sizes, image, description, "isPromo", "isDiscount", badge, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
          [
            id, 
            data.name, 
            data.price, 
            data.oldPrice || null, 
            data.stock, 
            data.category, 
            data.brand, 
            data.sizes, 
            data.image, 
            data.description, 
            data.isPromo || false, 
            data.isDiscount || false, 
            data.badge || null,
            data.createdAt || now,
            data.updatedAt || now
          ]
        );
        return rows[0];
      } finally {
        client.release();
      }
    },
    async update(args: any) {
      const { where, data } = args;
      const now = new Date();
      const client = await pool.connect();
      try {
        const { rows } = await client.query(
          `UPDATE "Product" SET name = $1, price = $2, "oldPrice" = $3, stock = $4, category = $5, brand = $6, sizes = $7, image = $8, description = $9, "isPromo" = $10, "isDiscount" = $11, badge = $12, "updatedAt" = $13 
           WHERE id = $14 RETURNING *`,
          [
            data.name, 
            data.price, 
            data.oldPrice || null, 
            data.stock, 
            data.category, 
            data.brand, 
            data.sizes, 
            data.image, 
            data.description, 
            data.isPromo || false, 
            data.isDiscount || false, 
            data.badge || null, 
            now,
            where.id
          ]
        );
        return rows[0];
      } finally {
        client.release();
      }
    },
    async delete(args: any) {
      const { where } = args;
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM "Product" WHERE id = $1', [where.id]);
        return true;
      } finally {
        client.release();
      }
    }
  },
  order: {
    async findMany(args: any = {}) {
      const { where, include } = args;
      let queryText = 'SELECT * FROM "Order"';
      let params: any[] = [];
      
      if (where?.userId) {
        queryText += ' WHERE "userId" = $1';
        params.push(where.userId);
      }
      queryText += ' ORDER BY "createdAt" DESC';

      const client = await pool.connect();
      try {
        const { rows: orders } = await client.query(queryText, params);

        if (include?.items) {
          for (let order of orders) {
            const { rows: items } = await client.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [order.id]);
            order.items = items;
          }
        }

        return orders;
      } finally {
        client.release();
      }
    },
    async create(args: any) {
      const { data } = args;
      const id = crypto.randomUUID();
      const client = await pool.connect();
      try {
        const { rows } = await client.query(
          `INSERT INTO "Order" (id, userId, total, status, shippingMethod, paymentMethod) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [id, data.userId, data.total, data.status || 'Pendiente', data.shippingMethod, data.paymentMethod]
        );
        return rows[0];
      } finally {
        client.release();
      }
    }
  }
};