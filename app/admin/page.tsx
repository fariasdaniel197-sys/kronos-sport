"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AdminSubTabType = "dashboard" | "ordenes" | "productos";

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 text-[10px] font-mono tracking-[0.4em] uppercase">Cargando panel gerencial...</p>
        </div>
      </div>
    }>
      <AdminPage />
    </Suspense>
  );
}

function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [adminSubTab, setAdminSubTab] = useState<AdminSubTabType>("dashboard");
  const [allStoreOrders, setAllStoreOrders] = useState<any[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);

  const [adminTabFilter, setAdminTabFilter] = useState<"todas" | "pendientes" | "historial">("todas");

  const [shippingCompanyInput, setShippingCompanyInput] = useState<{ [key: string]: string }>({});
  const [trackingCodeInput, setTrackingCodeInput] = useState<{ [key: string]: string }>({});
  const [rejectReasonSelect, setRejectReasonSelect] = useState<{ [key: string]: string }>({});
  const [rejectReasonCustom, setRejectReasonCustom] = useState<{ [key: string]: string }>({});

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodCategory, setProdCategory] = useState("FRANELAS BÁSICAS");
  const [prodBrand, setProdBrand] = useState("Nike");
  const [prodSizes, setProdSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  
  // Estados limpios y estables para las 3 imágenes
  const [prodImage1, setProdImage1] = useState("");
  const [prodImage2, setProdImage2] = useState("");
  const [prodImage3, setProdImage3] = useState("");

  const [prodDescription, setProdDescription] = useState("");
  const [prodIsPromo, setProdIsPromo] = useState(false);
  const [prodIsDiscount, setProdIsDiscount] = useState(false);
  const [prodSuccessMsg, setProdSuccessMsg] = useState("");

  const userEmail = session?.user?.email || "";
  const isAuthorizedAdminEmail = userEmail === "admin@kronos.com" || userEmail === "fariasdaniel197@gmail.com" || userEmail.includes("admin");

  const fetchProductsFromDB = async () => {
    try {
      const res = await fetch(`/api/product?_t=${Date.now()}`, { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await res.json();
      
      if (data.success && data.products) {
        setStoreProducts(data.products);
      } else {
        setStoreProducts([]);
      }
    } catch (err) {
      console.error("Error al cargar productos de la BD:", err);
      setStoreProducts([]);
    }
  };

  const loadAllStoreOrders = () => {
    if (typeof window === "undefined") return;
    let globalOrders: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("orders_")) {
        const userOrders = JSON.parse(localStorage.getItem(key) || "[]");
        globalOrders = [...globalOrders, ...userOrders];
      }
    }
    setAllStoreOrders(globalOrders);
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (!isAuthorizedAdminEmail) {
        router.push("/profile");
        return;
      }
      loadAllStoreOrders();
      fetchProductsFromDB();
    }
  }, [status, isAuthorizedAdminEmail, router]);

  const sendNotificationToUser = (targetEmail: string, title: string, content: string) => {
    if (!targetEmail || typeof window === "undefined") return;
    try {
      const userMsgKey = `kronos_messages_${targetEmail}`;
      const existingMsgs = JSON.parse(localStorage.getItem(userMsgKey) || "[]");
      const newNotif = {
        id: `msg-status-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title,
        content: content,
        category: "ESTADO DE ORDEN",
        date: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
        sender: "Administración Kronos Store C.A"
      };
      localStorage.setItem(userMsgKey, JSON.stringify([newNotif, ...existingMsgs]));
    } catch (err) {
      console.error("Error al enviar notificación:", err);
    }
  };

  const updateGlobalOrderStatus = (orderId: string, targetUserEmail: string, newStatus: string, extraData?: any) => {
    if (typeof window === "undefined") return;

    if (targetUserEmail) {
      const userOrdersKey = `orders_${targetUserEmail}`;
      const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
      const updatedUserOrders = userOrders.map((o: any) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            shippingCompany: extraData?.shippingCompany !== undefined ? extraData.shippingCompany : o.shippingCompany,
            trackingCode: extraData?.trackingCode !== undefined ? extraData.trackingCode : o.trackingCode,
            rejectReason: extraData?.rejectReason !== undefined ? extraData.rejectReason : o.rejectReason,
          };
        }
        return o;
      });
      localStorage.setItem(userOrdersKey, JSON.stringify(updatedUserOrders));
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("orders_")) {
        const userOrders = JSON.parse(localStorage.getItem(key) || "[]");
        let modified = false;
        const updatedUserOrders = userOrders.map((o: any) => {
          if (o.id === orderId) {
            modified = true;
            return {
              ...o,
              status: newStatus,
              shippingCompany: extraData?.shippingCompany !== undefined ? extraData.shippingCompany : o.shippingCompany,
              trackingCode: extraData?.trackingCode !== undefined ? extraData.trackingCode : o.trackingCode,
              rejectReason: extraData?.rejectReason !== undefined ? extraData.rejectReason : o.rejectReason,
            };
          }
          return o;
        });
        if (modified) {
          localStorage.setItem(key, JSON.stringify(updatedUserOrders));
        }
      }
    }
    loadAllStoreOrders();
  };

  const handleApproveOrderCustom = (orderId: string, orderUserEmail: string, earnedPts: number, statusType: string) => {
    const comp = shippingCompanyInput[orderId] || "TEALCA";
    const track = trackingCodeInput[orderId] || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    updateGlobalOrderStatus(orderId, orderUserEmail, statusType, { shippingCompany: comp, trackingCode: track });

    if (orderUserEmail && typeof window !== "undefined") {
      const ptsKey = `points_${orderUserEmail}`;
      const currentUsrPts = Number(localStorage.getItem(ptsKey) || 0);
      localStorage.setItem(ptsKey, (currentUsrPts + earnedPts).toString());
    }

    sendNotificationToUser(
      orderUserEmail,
      `ACTUALIZACIÓN DE ORDEN • ${orderId}`,
      `Su orden #${orderId} ha sido actualizada a: [ ${statusType.toUpperCase()} ].\n\n- Logística: ${comp}\n- Guía / Tracking: ${track}\n\nPuntos acreditados: +${earnedPts}`
    );

    alert(`✓ Orden ${orderId} actualizada a "${statusType}".`);
  };

  const handleRejectOrderCustom = (orderId: string, orderUserEmail: string) => {
    const selectedReason = rejectReasonSelect[orderId] || "Referencia de pago no verificable en banco.";
    const customText = rejectReasonCustom[orderId] || "";
    const finalReason = customText ? `${selectedReason} - ${customText}` : selectedReason;

    updateGlobalOrderStatus(orderId, orderUserEmail, "Rechazada", { rejectReason: finalReason });
    
    sendNotificationToUser(
      orderUserEmail,
      `NOTIFICACIÓN DE INCIDENCIA • ${orderId}`,
      `Lamentamos informarle que su orden #${orderId} ha sido rechazada por el siguiente motivo:\n\n• ${finalReason}`
    );

    alert(`✕ Orden ${orderId} rechazada correctamente.`);
  };

  const handleDeleteOrderAdmin = (orderId: string) => {
    if (!confirm(`¿Eliminar permanentemente la orden ${orderId}?`) || typeof window === "undefined") return;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("orders_")) {
        const userOrders = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = userOrders.filter((o: any) => o.id !== orderId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    }
    loadAllStoreOrders();
  };

  const handleSizeToggle = (sz: string) => {
    if (prodSizes.includes(sz)) {
      setProdSizes(prodSizes.filter(s => s !== sz));
    } else {
      setProdSizes([...prodSizes, sz]);
    }
  };

  const handleSaveProductAdmin = async () => {
    if (!prodName || !prodPrice || !prodStock) {
      alert("Por favor completa Nombre, Precio y Stock.");
      return;
    }

    // Recolección directa de los estados de React (Imagen 1, 2 y 3)
    const imagesArray = [prodImage1, prodImage2, prodImage3]
      .map((img) => String(img || "").trim().replace(/['"]+/g, ''))
      .filter((img) => img.length > 3);

    const fallbackImg = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800";
    const finalImages = imagesArray.length > 0 ? imagesArray : [fallbackImg];

    const productPayload = {
      ...(editingProductId ? { id: editingProductId } : {}),
      name: prodName.toUpperCase(),
      price: Number(prodPrice),
      oldPrice: prodOldPrice ? Number(prodOldPrice) : null,
      stock: Number(prodStock),
      category: prodCategory.toUpperCase(),
      brand: prodBrand,
      sizes: prodSizes,
      images: finalImages,           // Arreglo completo con las imágenes
      image: finalImages[0],         // Foto principal de portada
      description: prodDescription || "Sin descripción detallada.",
      isPromo: prodIsPromo,
      isDiscount: prodIsDiscount,
      badge: prodIsDiscount ? "Oferta" : prodIsPromo ? "Promo" : undefined
    };

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await response.json();

      if (data.success) {
        setProdSuccessMsg(editingProductId ? "¡Producto actualizado en la base de datos!" : "¡Producto registrado con éxito!");
        await fetchProductsFromDB();
        handleCancelEditProduct();
        router.refresh(); 
      } else {
        setProdSuccessMsg(`Error: ${data.error || "No se pudo guardar."}`);
        alert(`Error al guardar: ${data.error || "Desconocido"}`);
      }
    } catch (error) {
      console.error("Error de conexión con la API:", error);
      setProdSuccessMsg("Error de comunicación con la base de datos.");
    }

    setTimeout(() => setProdSuccessMsg(""), 4000);
  };

  const handleStartEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setProdName(prod.name || "");
    setProdPrice(prod.price !== undefined ? prod.price.toString() : "");
    setProdOldPrice(prod.oldPrice !== null && prod.oldPrice !== undefined ? prod.oldPrice.toString() : "");
    setProdStock(prod.stock !== undefined ? prod.stock.toString() : "");
    setProdCategory(prod.category || "FRANELAS BÁSICAS");
    setProdBrand(prod.brand || "Nike");
    setProdSizes(Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ["S", "M", "L", "XL"]);
    
    // EXTRACCIÓN ROBUSTA Y BLINDADA PARA CARGAR LAS 3 IMÁGENES AL EDITAR
    let imgList: string[] = [];
    
    if (Array.isArray(prod.images)) {
      imgList = prod.images.map((i: any) => String(i).trim()).filter(Boolean);
    } else if (typeof prod.images === "object" && prod.images !== null) {
      imgList = Object.values(prod.images).map((i: any) => String(i).trim()).filter(Boolean);
    } else if (typeof prod.images === "string" && prod.images.trim() !== "") {
      try {
        const parsed = JSON.parse(prod.images);
        if (Array.isArray(parsed)) {
          imgList = parsed.map((i: any) => String(i).trim()).filter(Boolean);
        } else {
          imgList = [prod.images.trim()];
        }
      } catch {
        imgList = prod.images.split(/[\n,]+/).map((i: string) => i.trim()).filter(Boolean);
      }
    }
    
    if (imgList.length === 0 && typeof prod.image === "string" && prod.image.trim() !== "") {
      imgList = prod.image.split(/[\n,]+/).map((i: string) => i.trim()).filter(Boolean);
    }

    // Asignación limpia y directa a los estados del formulario
    setProdImage1(imgList[0] || "");
    setProdImage2(imgList[1] || "");
    setProdImage3(imgList[2] || "");

    setProdDescription(prod.description || "");
    setProdIsPromo(!!prod.isPromo);
    setProdIsDiscount(!!prod.isDiscount);
  };

  const handleCancelEditProduct = () => {
    setEditingProductId(null);
    setProdName("");
    setProdPrice("");
    setProdOldPrice("");
    setProdStock("");
    setProdBrand("Nike");
    setProdSizes(["S", "M", "L", "XL"]);
    setProdImage1("");
    setProdImage2("");
    setProdImage3("");
    setProdDescription("");
    setProdIsPromo(false);
    setProdIsDiscount(false);
  };

  const handleDeleteProductAdmin = async (id: string) => {
    if (!confirm("¿Deseas eliminar este producto de la base de datos?")) return;

    try {
      const response = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchProductsFromDB();
        router.refresh();
      } else {
        alert("No se pudo eliminar el producto.");
      }
    } catch (err) {
      console.error("Error al eliminar en la API:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 text-[10px] font-mono tracking-[0.4em] uppercase">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  const pendingOrders = allStoreOrders.filter(o => !o.status || o.status === "Pendiente de Aprobación");
  const processedOrRejectedOrders = allStoreOrders.filter(o => o.status && o.status !== "Pendiente de Aprobación");

  const adminDisplayList = 
    adminTabFilter === "pendientes" ? pendingOrders :
    adminTabFilter === "historial" ? processedOrRejectedOrders : allStoreOrders;

  const totalRevenue = allStoreOrders
    .filter(o => o.status && !o.status.includes("Rechazada"))
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  const lowStockProducts = storeProducts.filter(p => Number(p.stock) <= 5);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 font-sans selection:bg-orange-500 selection:text-black">
      
      <div className="pt-12 pb-8 px-6 lg:px-12 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-0.5 rounded-full">
                MODO GERENCIAL • KRONOS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Centro de Control Administrativo</h1>
          </div>
          <Link 
            href="/profile" 
            className="text-xs font-black uppercase tracking-widest bg-zinc-900 border border-zinc-700 px-5 py-3 hover:bg-zinc-800 transition rounded-sm shadow-md"
          >
            ← Volver a mi Perfil
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 space-y-8">
        
        <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setAdminSubTab("dashboard")} 
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 cursor-pointer transition whitespace-nowrap ${adminSubTab === 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            📊 Dashboard Tienda
          </button>
          <button 
            onClick={() => setAdminSubTab("ordenes")} 
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 cursor-pointer transition whitespace-nowrap ${adminSubTab === 'ordenes' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            📦 Órdenes de Compra ({allStoreOrders.length})
          </button>
          <button 
            onClick={() => {
              setAdminSubTab("productos");
              fetchProductsFromDB();
            }} 
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 cursor-pointer transition whitespace-nowrap ${adminSubTab === 'productos' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            🏷️ Catálogo de Productos ({storeProducts.length})
          </button>
        </div>

        {adminSubTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-2 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Ventas Totales</span>
                <p className="text-3xl font-black font-mono text-orange-400">${totalRevenue.toFixed(2)}</p>
                <p className="text-[11px] font-mono text-zinc-500">Ingresos brutos acumulados</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-2 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Órdenes Pendientes</span>
                <p className="text-3xl font-black font-mono text-white">{pendingOrders.length}</p>
                <p className="text-[11px] font-mono text-orange-500 font-bold">Requieren verificación</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-2 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Total Órdenes</span>
                <p className="text-3xl font-black font-mono text-white">{allStoreOrders.length}</p>
                <p className="text-[11px] font-mono text-zinc-500">Registros en el sistema</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-2 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Artículos en Catálogo</span>
                <p className="text-3xl font-black font-mono text-white">{storeProducts.length}</p>
                <p className="text-[11px] font-mono text-zinc-500">Sincronizados con Neon</p>
              </div>

            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm space-y-6 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-400">⚠️ Alertas de Inventario Crítico (Stock ≤ 5)</h3>
              
              {lowStockProducts.length === 0 ? (
                <p className="text-xs font-mono text-zinc-500 uppercase">Todos los productos cuentan con suficiente stock disponible.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.map((prod) => {
                    let firstImg = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800";
                    if (Array.isArray(prod.images) && prod.images.length > 0) {
                      firstImg = prod.images[0];
                    } else if (typeof prod.images === "object" && prod.images !== null) {
                      const vals = Object.values(prod.images);
                      if (vals.length > 0) firstImg = String(vals[0]);
                    } else if (prod.image) {
                      firstImg = prod.image;
                    }

                    return (
                      <div key={prod.id} className="bg-zinc-950 p-4 border border-red-900/40 rounded-sm flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                          <img src={firstImg} alt={prod.name} className="w-10 h-10 object-cover rounded bg-zinc-900" />
                          <div className="truncate">
                            <p className="text-xs font-bold uppercase truncate text-white">{prod.name}</p>
                            <p className="text-[10px] font-mono text-red-400 font-bold">Quedan: {prod.stock} unids.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setAdminSubTab("productos");
                            handleStartEditProduct(prod);
                          }} 
                          className="bg-zinc-900 hover:bg-orange-500 hover:text-black text-white text-[10px] font-black uppercase px-3 py-1.5 transition cursor-pointer"
                        >
                          Reponer
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {adminSubTab === "ordenes" && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-10 rounded-sm space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-black uppercase tracking-tight">Gestión Global de Adquisiciones</h2>
              <div className="flex flex-wrap gap-2">
                {(["todas", "pendientes", "historial"] as const).map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setAdminTabFilter(filter)} 
                    className={`px-4 py-2 text-xs font-black uppercase cursor-pointer ${adminTabFilter === filter ? 'bg-orange-500 text-black font-bold' : 'bg-zinc-950 border border-zinc-800 text-zinc-300'}`}
                  >
                    {filter === 'todas' ? `Todas (${allStoreOrders.length})` :
                     filter === 'pendientes' ? `Pendientes (${pendingOrders.length})` : `Historial (${processedOrRejectedOrders.length})`}
                  </button>
                ))}
              </div>
            </div>

            {adminDisplayList.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest py-16 text-center">No hay registros de órdenes en este filtro.</p>
            ) : (
              <div className="space-y-6">
                {adminDisplayList.map((order) => {
                  const isOrderPending = !order.status || order.status === "Pendiente de Aprobación";

                  return (
                    <div key={order.id} className={`border p-6 sm:p-8 rounded-sm space-y-6 shadow-xl bg-zinc-950 ${isOrderPending ? 'border-orange-500/80 ring-1 ring-orange-500/20' : 'border-zinc-800'}`}>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-4 gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-lg text-orange-400">{order.id}</span>
                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${isOrderPending ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                              {order.status || "Pendiente de Aprobación"}
                            </span>
                          </div>
                          <div className="mt-1.5 space-y-0.5 font-mono text-xs">
                            <p className="text-zinc-300 font-bold">👤 Cliente: <span className="text-orange-400 uppercase">{order.userName || "Cliente"}</span></p>
                            <p className="text-zinc-400 text-[11px]">📧 Correo: <span className="text-white">{order.userEmail}</span></p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-base bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-sm shadow">
                          ${Number(order.total).toFixed(2)} USD
                        </span>
                      </div>

                      <div className="bg-zinc-900 p-5 border border-zinc-800 rounded-sm space-y-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 block">💳 Detalles de Pago y Comprobante:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="space-y-1.5">
                            <p className="text-zinc-300">Método de Pago: <strong className="text-white uppercase">{order.paymentMethod || "No especificado"}</strong></p>
                            <p className="text-zinc-300">Referencia / Operación: <strong className="text-orange-400 uppercase">{order.paymentRef || order.reference || "Sin referencia"}</strong></p>
                            <p className="text-zinc-300">Destino de Envío: <span className="text-zinc-400">{order.shippingAddress}</span></p>
                          </div>

                          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded flex flex-col justify-center items-center text-center">
                            {order.paymentReceipt || order.receiptImage ? (
                              <div className="space-y-2 w-full">
                                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-bold">Comprobante de Pago Adjunto:</span>
                                <a 
                                  href={order.paymentReceipt || order.receiptImage} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-block bg-orange-500 text-black font-black text-[10px] uppercase px-4 py-2 hover:bg-orange-400 transition"
                                >
                                  🔍 Ver Comprobante Completo
                                </a>
                              </div>
                            ) : (
                              <p className="text-[11px] text-zinc-500 italic">No se adjuntó imagen de comprobante (Pago por referencia).</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 block">Artículos Solicitados:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 bg-zinc-900 p-3 border border-zinc-800 rounded-sm text-xs font-mono">
                              {item.image && (
                                <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="truncate">
                                <p className="font-bold uppercase text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-zinc-400">Cant: {item.qty} • ${Number(item.price * item.qty).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-zinc-900 p-5 border border-zinc-800 rounded-sm space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 block">⚙️ Control Logístico y Acciones Gerenciales:</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                          <div>
                            <label className="block text-[10px] text-zinc-400 uppercase mb-1">Empresa Logística:</label>
                            <input 
                              type="text" 
                              defaultValue={order.shippingCompany || "TEALCA"}
                              onChange={(e) => setShippingCompanyInput({ ...shippingCompanyInput, [order.id]: e.target.value })}
                              className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 uppercase mb-1">Número de Guía / Tracking:</label>
                            <input 
                              type="text" 
                              defaultValue={order.trackingCode || order.trackingNumber || ""}
                              onChange={(e) => setTrackingCodeInput({ ...trackingCodeInput, [order.id]: e.target.value })}
                              className="w-full p-3 bg-zinc-950 border border-zinc-800 text-orange-400 uppercase font-bold text-xs focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                          <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                            Aprobar y Cambiar Estatus:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => handleApproveOrderCustom(order.id, order.userEmail, order.earnedPoints || Math.floor(order.total * 1), "Aprobada - En Preparación")}
                              className="p-3 bg-emerald-600 text-black font-black text-[10px] uppercase text-center hover:bg-emerald-500 cursor-pointer transition rounded shadow"
                            >
                              ✓ Aprobada / En Preparación
                            </button>
                            <button
                              onClick={() => handleApproveOrderCustom(order.id, order.userEmail, order.earnedPoints || Math.floor(order.total * 1), "Despachado en Vía")}
                              className="p-3 bg-blue-600 text-black font-black text-[10px] uppercase text-center hover:bg-blue-500 cursor-pointer transition rounded shadow"
                            >
                              🚚 Despachado en Vía
                            </button>
                            <button
                              onClick={() => handleApproveOrderCustom(order.id, order.userEmail, order.earnedPoints || Math.floor(order.total * 1), "Procesada / Entregada")}
                              className="p-3 bg-zinc-200 text-black font-black text-[10px] uppercase text-center hover:bg-white cursor-pointer transition rounded shadow"
                            >
                              ⭐ Procesada / Entregada
                            </button>
                          </div>
                        </div>

                        <div className="bg-red-950/20 p-4 border border-red-900/40 rounded-sm space-y-3 pt-4">
                          <label className="block text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
                            Protocolo de Rechazo de Pago:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select 
                              onChange={(e) => setRejectReasonSelect({ ...rejectReasonSelect, [order.id]: e.target.value })}
                              className="w-full p-3 bg-zinc-950 border border-red-900/50 text-xs text-white font-mono uppercase focus:outline-none rounded"
                              defaultValue="Referencia de pago no verificable en banco."
                            >
                              <option value="Referencia de pago no verificable en banco.">Referencia de pago no verificable en banco</option>
                              <option value="Monto transferido no coincide con el total de la orden.">Monto transferido no coincide con el total</option>
                              <option value="Falta de stock disponible en artículos solicitados.">Falta de stock disponible</option>
                              <option value="Datos de dirección de envío incompletos o erróneos.">Dirección incompleta o errónea</option>
                            </select>

                            <input 
                              type="text" 
                              placeholder="Nota adicional opcional..."
                              onChange={(e) => setRejectReasonCustom({ ...rejectReasonCustom, [order.id]: e.target.value })}
                              className="w-full p-3 bg-zinc-950 border border-red-900/50 text-xs text-white uppercase focus:outline-none rounded"
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleRejectOrderCustom(order.id, order.userEmail)}
                              className="bg-red-600 text-white font-black text-[10px] uppercase px-6 py-3 hover:bg-red-500 cursor-pointer transition rounded shadow"
                            >
                              ✕ Ejecutar Rechazo y Notificar Cliente
                            </button>
                          </div>
                        </div>

                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleDeleteOrderAdmin(order.id)}
                          className="text-xs font-mono text-zinc-500 hover:text-red-400 uppercase tracking-widest cursor-pointer transition"
                        >
                          Eliminar registro permanentemente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {adminSubTab === "productos" && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-10 rounded-sm space-y-8 shadow-2xl animate-fadeIn">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Catálogo de Productos y Franelas</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Control de inventario sincronizado con Neon en tiempo real.</p>
            </div>

            {prodSuccessMsg && (
              <div className="bg-orange-500 text-black p-3.5 text-xs font-mono uppercase font-black rounded-sm shadow">
                {prodSuccessMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-4 lg:col-span-1 h-fit shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-orange-400">
                    {editingProductId ? "Editar Producto" : "Nuevo Producto"}
                  </h3>
                  {editingProductId && (
                    <button type="button" onClick={handleCancelEditProduct} className="text-[10px] font-mono text-zinc-400 uppercase underline cursor-pointer">Cancelar</button>
                  )}
                </div>
                
                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Nombre</label>
                    <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="PRODUCTO" className="w-full bg-zinc-900 border border-zinc-800 p-3 uppercase text-xs text-white focus:outline-none focus:border-orange-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Precio ($)</label>
                      <input type="number" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="28.00" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Ant. ($)</label>
                      <input type="number" step="0.01" value={prodOldPrice} onChange={(e) => setProdOldPrice(e.target.value)} placeholder="35.00" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Stock</label>
                      <input type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="20" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Colección</label>
                      <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 uppercase text-xs text-white font-bold focus:outline-none focus:border-orange-500">
                        <option value="FRANELAS BÁSICAS">Franelas Básicas</option>
                        <option value="FRANELAS GRÁFICAS">Franelas Gráficas</option>
                        <option value="FRANELAS OVERSIZED">Franelas Oversized</option>
                        <option value="SUÉTERES // CHAQUETAS">Suéteres // Chaquetas</option>
                        <option value="CHEMISES">Chemises</option>
                        <option value="SHORTS">Shorts</option>
                        <option value="JOGGERS">Joggers</option>
                        <option value="CALZADO">Calzado</option>
                        <option value="ACCESORIOS">Accesorios</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Marca</label>
                      <select value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 uppercase text-xs text-white font-bold focus:outline-none focus:border-orange-500">
                        <option value="Nike">Nike</option>
                        <option value="Adidas">Adidas</option>
                        <option value="Reebok">Reebok</option>
                        <option value="Puma">Puma</option>
                        <option value="Under Armour">Under Armour</option>
                        <option value="Pull&Bear">Pull&Bear</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-3.5 border border-zinc-800 rounded space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Etiquetado Comercial:</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={prodIsPromo} onChange={(e) => setProdIsPromo(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                        <span className="text-[11px] font-bold text-orange-400 uppercase">Promo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={prodIsDiscount} onChange={(e) => setProdIsDiscount(e.target.checked)} className="accent-red-500 w-4 h-4" />
                        <span className="text-[11px] font-bold text-red-400 uppercase">Oferta</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Tallas</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Única", "S", "M", "L", "XL", "XXL", "40", "42", "44"].map((sz) => (
                        <button type="button" key={sz} onClick={() => handleSizeToggle(sz)} className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border transition-colors cursor-pointer ${prodSizes.includes(sz) ? "bg-orange-500 text-black border-orange-500" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"}`}>
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CASILLAS 100% CONTROLADAS POR ESTADOS DE REACT */}
                  <div className="space-y-3 bg-zinc-900 p-4 border border-zinc-800 rounded">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-400">
                      🖼️ Gestión de Imágenes del Producto:
                    </span>

                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Imagen 1 (Principal - Portada)</label>
                      <input 
                        type="text" 
                        value={prodImage1} 
                        onChange={(e) => setProdImage1(e.target.value)} 
                        placeholder="Pega aquí el enlace de la foto 1" 
                        className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Imagen 2 (Opcional - Galería Perfil)</label>
                      <input 
                        type="text" 
                        value={prodImage2} 
                        onChange={(e) => setProdImage2(e.target.value)} 
                        placeholder="Pega aquí el enlace de la foto 2" 
                        className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Imagen 3 (Opcional - Galería Perfil)</label>
                      <input 
                        type="text" 
                        value={prodImage3} 
                        onChange={(e) => setProdImage3(e.target.value)} 
                        placeholder="Pega aquí el enlace de la foto 3" 
                        className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-orange-500" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Descripción</label>
                    <textarea rows={2} value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} placeholder="Detalles..." className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs uppercase text-white focus:outline-none focus:border-orange-500" />
                  </div>

                  {/* BOTÓN DISPARADOR DIRECTO */}
                  <button 
                    type="button" 
                    onClick={handleSaveProductAdmin}
                    className="w-full bg-orange-500 text-black font-black uppercase tracking-widest py-3.5 hover:bg-orange-400 transition cursor-pointer shadow-lg"
                  >
                    {editingProductId ? "Actualizar Producto" : "Publicar Producto"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Inventario Actual ({storeProducts.length})</h3>
                
                {storeProducts.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-500 uppercase py-12 text-center border border-zinc-800 rounded">No hay productos en el catálogo.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {storeProducts.map((prod) => {
                      let imgList: string[] = [];
                      if (Array.isArray(prod.images)) {
                        imgList = prod.images.map((i: any) => String(i).trim()).filter(Boolean);
                      } else if (typeof prod.images === "object" && prod.images !== null) {
                        imgList = Object.values(prod.images).map((i: any) => String(i).trim()).filter(Boolean);
                      } else if (typeof prod.images === "string" && prod.images.trim() !== "") {
                        try {
                          const parsed = JSON.parse(prod.images);
                          if (Array.isArray(parsed)) imgList = parsed;
                          else imgList = [prod.images];
                        } catch {
                          imgList = prod.images.split(",").map((i: string) => i.trim()).filter(Boolean);
                        }
                      }
                      if (imgList.length === 0 && typeof prod.image === "string") {
                        imgList = prod.image.split(",").map((i: string) => i.trim()).filter(Boolean);
                      }

                      const thumbnail = imgList.length > 0 ? imgList[0] : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800";

                      return (
                        <div key={prod.id} className={`border p-5 rounded-sm bg-zinc-950 flex flex-col justify-between space-y-4 shadow-md ${editingProductId === prod.id ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-zinc-800'}`}>
                          <div className="flex gap-4 items-start">
                            <div className="w-14 h-16 bg-zinc-900 border border-zinc-800 rounded overflow-hidden flex-shrink-0 relative">
                              {prod.isDiscount && <span className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-bold px-1">OFERTA</span>}
                              {prod.isPromo && !prod.isDiscount && <span className="absolute top-0 left-0 bg-orange-600 text-white text-[8px] font-bold px-1">PROMO</span>}
                              <img src={thumbnail} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="truncate space-y-1">
                              <div className="flex gap-1.5 items-center flex-wrap">
                                <span className="text-[9px] font-mono uppercase bg-zinc-900 text-zinc-300 px-2 py-0.5">{prod.category}</span>
                                {prod.brand && <span className="text-[9px] font-mono uppercase bg-orange-500/20 text-orange-400 px-1.5 py-0.5 font-bold">{prod.brand}</span>}
                              </div>
                              <h4 className="font-black uppercase text-xs tracking-tight text-white truncate">{prod.name}</h4>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-mono text-orange-400 font-bold">${Number(prod.price).toFixed(2)} USD</p>
                                {prod.oldPrice && <p className="text-[10px] font-mono text-zinc-500 line-through">${Number(prod.oldPrice).toFixed(2)}</p>}
                              </div>
                              <p className="text-[10px] font-mono text-zinc-400">Stock: {prod.stock} unids. {imgList.length > 1 && `• 🖼️ ${imgList.length} fotos`}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3 text-xs">
                            <button onClick={() => handleStartEditProduct(prod)} className="text-orange-400 hover:text-orange-300 font-mono text-[10px] font-bold uppercase cursor-pointer">Editar</button>
                            <span className="text-zinc-700">|</span>
                            <button onClick={() => handleDeleteProductAdmin(prod.id)} className="text-red-500 hover:text-red-400 font-mono text-[10px] font-bold uppercase cursor-pointer">Eliminar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}