import ProductCard from "./ProductCard";

// Datos de prueba con estética playera / streetwear tipo Hollister
const PRODUCTS = [
  {
    id: "1",
    name: "Camiseta Graphic Logo Surf",
    category: "Hombre",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    badge: "Nuevo",
  },
  {
    id: "2",
    name: "Hoodie Oversized Heavyweight",
    category: "Hombre",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60",
    badge: "Bestseller",
  },
  {
    id: "3",
    name: "Jeans Slim Fit Coastal Wash",
    category: "Hombre",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "4",
    name: "Chaqueta Denim Vintage",
    category: "Mujer",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60",
    badge: "Oferta",
  },
];

export default function ProductGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black">
            Novedades de la Semana
          </h2>
          <p className="text-xs uppercase text-neutral-500 font-semibold tracking-widest mt-1">
            Explora las prendas más populares
          </p>
        </div>
      </div>

      {/* Grid responsivo: 1 col en móvil, 2 en tablet, 4 en pantalla grande */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}