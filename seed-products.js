const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_SEnKHPG9z7rC@ep-summer-dew-b4xyuc72-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

const initialProducts = [
  {
    id: "prod-1",
    name: "FRANELA OVERSIZED ESSENTIAL",
    price: 28.00,
    oldPrice: 35.00,
    stock: 25,
    category: "FRANELAS OVERSIZED",
    brand: "Nike",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    description: "Franela de corte oversized confeccionada en algodón premium de alto gramaje. Máxima comodidad y durabilidad para uso urbano.",
    isPromo: true,
    isDiscount: true,
    badge: "Oferta"
  },
  {
    id: "prod-2",
    name: "JOGGER URBAN TECH",
    price: 45.00,
    oldPrice: 55.00,
    stock: 15,
    category: "JOGGERS",
    brand: "Adidas",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800",
    description: "Pantalón jogger con diseño técnico y bolsillos laterales con cierre. Ajuste ergonómico y tejido flexible de alta resistencia.",
    isPromo: false,
    isDiscount: true,
    badge: "Oferta"
  },
  {
    id: "prod-3",
    name: "HOODIE HEAVYWEIGHT KRONOS",
    price: 65.00,
    oldPrice: 80.00,
    stock: 10,
    category: "SUÉTERES // CHAQUETAS",
    brand: "Puma",
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
    description: "Suéter con capucha forrada y felpa interna térmica. Ideal para climas templados y un look imponente.",
    isPromo: true,
    isDiscount: false,
    badge: "Promo"
  },
  {
    id: "prod-4",
    name: "CHEMISE CLASSIC FIT",
    price: 32.00,
    oldPrice: null,
    stock: 20,
    category: "CHEMISES",
    brand: "Reebok",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1625910513418-7c47fb9ab8ad?auto=format&fit=crop&q=80&w=800",
    description: "Chemise de piqué transpirable con cuello tejido y botones grabados. Estilo clásico formal y casual.",
    isPromo: false,
    isDiscount: false,
    badge: null
  }
];

async function seedProducts() {
  try {
    console.log("Iniciando inserción de productos en Neon...");

    for (const p of initialProducts) {
      await pool.query(
        `INSERT INTO "Product" (id, name, price, "oldPrice", stock, category, brand, sizes, image, description, "isPromo", "isDiscount", badge)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name,
           price = EXCLUDED.price,
           "oldPrice" = EXCLUDED."oldPrice",
           stock = EXCLUDED.stock,
           category = EXCLUDED.category,
           brand = EXCLUDED.brand,
           sizes = EXCLUDED.sizes,
           image = EXCLUDED.image,
           description = EXCLUDED.description,
           "isPromo" = EXCLUDED."isPromo",
           "isDiscount" = EXCLUDED."isDiscount",
           badge = EXCLUDED.badge`,
        [p.id, p.name, p.price, p.oldPrice, p.stock, p.category, p.brand, p.sizes, p.image, p.description, p.isPromo, p.isDiscount, p.badge]
      );
      console.log(`✓ Producto sincronizado: ${p.name}`);
    }

    console.log("¡Todos los productos fueron registrados con éxito en tu base de datos de Neon!");
  } catch (err) {
    console.error("Error al poblar productos:", err);
  } finally {
    await pool.end();
  }
}

seedProducts();