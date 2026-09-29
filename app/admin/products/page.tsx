"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const userEmail = session?.user?.email || "";
  const isAuthorized = userEmail === "admin@atlanta.com" || userEmail === "fariasdaniel197@gmail.com" || userEmail.includes("admin");

  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Streetwear");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      const storedProducts = localStorage.getItem("vault_store_products");
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // Productos iniciales de prueba
        const defaultProducts = [
          {
            id: `prod-${Date.now()}-1`,
            name: "Oversized Vintage Hoodie",
            price: 45.00,
            stock: 15,
            category: "Hoodies",
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
            description: "Hoodie de algodón pesado con lavado vintage y calce oversized."
          },
          {
            id: `prod-${Date.now()}-2`,
            name: "Vault Heavyweight Tee",
            price: 28.00,
            stock: 30,
            category: "Streetwear",
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            description: "Camiseta de alta densidad 240GSM con estampado frontal minimalista."
          }
        ];
        setProducts(defaultProducts);
        localStorage.setItem("vault_store_products", JSON.stringify(defaultProducts));
      }
    }
  }, [session]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) return;

    const newProduct = {
      id: `prod-${Date.now()}`,
      name: name.toUpperCase(),
      price: Number(price),
      stock: Number(stock),
      category: category.toUpperCase(),
      image: image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      description: description || "Sin descripción detallada."
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem("vault_store_products", JSON.stringify(updated));

    // Limpiar campos
    setName("");
    setPrice("");
    setStock("");
    setImage("");
    setDescription("");
    setSuccessMsg("¡Producto agregado con éxito a Vault Store!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("¿Deseas eliminar este producto de la tienda?")) return;
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    localStorage.setItem("vault_store_products", JSON.stringify(filtered));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
        <p className="text-white text-xs font-mono uppercase tracking-[0.3em] animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black uppercase text-red-500 mb-2">Acceso Restringido</h1>
        <p className="text-xs text-neutral-400 font-mono mb-6">No tienes privilegios de administración para ver esta sección.</p>
        <Link href="/profile" className="bg-orange-500 text-white px-6 py-3 text-xs font-black uppercase tracking-widest">Volver al Perfil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24 font-sans">
      <div className="border-b border-neutral-800 bg-neutral-900/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-widest">Vault Store • Inventario</span>
            <h1 className="text-2xl font-black uppercase tracking-tight">Gestión de Productos</h1>
          </div>
          <Link href="/profile" className="text-xs font-mono bg-neutral-900 border border-neutral-800 px-4 py-2 hover:bg-neutral-800 transition">
            ← Volver al Panel
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Creación */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-sm space-y-6 lg:col-span-1 h-fit shadow-xl">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-orange-400">Agregar Nuevo Producto</h2>
            <p className="text-[11px] text-neutral-400 font-mono mt-1">Completa los datos para publicar en el catálogo.</p>
          </div>

          {successMsg && (
            <div className="bg-emerald-600/20 border border-emerald-500 text-emerald-400 p-3 text-xs font-mono uppercase font-bold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Nombre del Producto</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej: Vintage Boxy Tee" 
                required 
                className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xs uppercase text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Precio (USD)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="35.00" 
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Stock</label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)} 
                  placeholder="20" 
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Categoría</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xs uppercase text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="Streetwear">Streetwear</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Accessories">Accessories</option>
                <option value="Outerwear">Outerwear</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">URL de la Imagen</label>
              <input 
                type="url" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                placeholder="https://images.unsplash.com/..." 
                className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Descripción</label>
              <textarea 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Detalles de confección, materiales..." 
                className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xs text-white focus:border-orange-500 focus:outline-none uppercase"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-3.5 hover:bg-orange-600 transition cursor-pointer"
            >
              Publicar Producto
            </button>
          </form>
        </div>

        {/* Listado de Productos Actuales */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-widest">Catálogo Actual ({products.length})</h2>
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Sincronizado</span>
          </div>

          {products.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 p-12 text-center text-neutral-400 font-mono text-xs">
              No hay productos registrados en el inventario.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-20 bg-neutral-950 border border-neutral-800 rounded overflow-hidden flex-shrink-0">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 truncate">
                      <span className="text-[9px] font-mono uppercase bg-neutral-800 px-2 py-0.5 text-orange-400 font-bold">{prod.category}</span>
                      <h3 className="font-black uppercase text-xs tracking-wide truncate">{prod.name}</h3>
                      <p className="text-xs font-mono text-emerald-400 font-bold">${Number(prod.price).toFixed(2)} USD</p>
                      <p className="text-[10px] font-mono text-neutral-400">Stock: {prod.stock} unids.</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[180px]">{prod.description}</span>
                    <button 
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="text-red-500 hover:text-red-400 font-mono text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}