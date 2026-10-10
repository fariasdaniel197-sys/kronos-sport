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
        return null;
      } finally {
        client.release();
      }
    },
    async findFirst(args: any = {}) {
      const client = await pool.connect();
      try {
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
        const { rows } = await client.query(
          `INSERT INTO "User" (id, email, name, password, phone, birthdate, points) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [id, data.email, data.name || null, data.password, data.phone || null, data.birthdate || null, data.points || 0]
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
      const client = await pool.connect();
      try {
        const { rows } = await client.query(
          `INSERT INTO "Product" (id, name, price, "oldPrice", stock, category, brand, sizes, image, description, "isPromo", "isDiscount", badge) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
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
            data.badge || null
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
        const { rows } = await client.query(
          `UPDATE "Product" SET name = $1, price = $2, "oldPrice" = $3, stock = $4, category = $5, brand = $6, sizes = $7, image = $8, description = $9, "isPromo" = $10, "isDiscount" = $11, badge = $12 
           WHERE id = $13 RETURNING *`,
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