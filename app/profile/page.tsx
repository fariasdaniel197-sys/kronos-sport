"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type TabType = "resumen" | "pedidos" | "niveles" | "direcciones" | "mensajes" | "admin";
type AdminSubTabType = "ordenes" | "productos";

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 text-[10px] font-mono tracking-[0.4em] uppercase">Cargando perfil...</p>
        </div>
      </div>
    }>
      <ProfilePage />
    </Suspense>
  );
}

function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successOrderParam = searchParams.get("orderSuccess");

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [activeTab, setActiveTab] = useState<TabType>("resumen");
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTabType>("ordenes");

  const [orders, setOrders] = useState<any[]>([]);
  const [allStoreOrders, setAllStoreOrders] = useState<any[]>([]); 
  const [userPoints, setUserPoints] = useState<number>(0); 
  const [userExpTotal, setUserExpTotal] = useState<number>(0); 
  const [successBanner, setSuccessBanner] = useState<string | null>(successOrderParam);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const [messages, setMessages] = useState<any[]>([]);
  const [readMessages, setReadMessages] = useState<any[]>([]);

  const [clientOrderFilter, setClientOrderFilter] = useState<"pendientes" | "envio" | "completadas" | "rechazadas">("pendientes");
  const [adminTabFilter, setAdminTabFilter] = useState<"todas" | "pendientes" | "historial">("todas");

  const [shippingCompanyInput, setShippingCompanyInput] = useState<{ [key: string]: string }>({});
  const [trackingCodeInput, setTrackingCodeInput] = useState<{ [key: string]: string }>({});
  const [rejectReasonSelect, setRejectReasonSelect] = useState<{ [key: string]: string }>({});
  const [rejectReasonCustom, setRejectReasonCustom] = useState<{ [key: string]: string }>({});

  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodCategory, setProdCategory] = useState("FRANELAS BÁSICAS");
  const [prodBrand, setProdBrand] = useState("Nike");
  const [prodSizes, setProdSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [prodImage, setProdImage] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodIsPromo, setProdIsPromo] = useState(false);
  const [prodIsDiscount, setProdIsDiscount] = useState(false);
  const [prodSuccessMsg, setProdSuccessMsg] = useState("");

  const userEmail = session?.user?.email || "";
  const isAuthorizedAdminEmail = userEmail === "admin@kronos.com" || userEmail === "fariasdaniel197@gmail.com" || userEmail.includes("admin");
  const [isViewAsAdmin, setIsViewAsAdmin] = useState<boolean>(true);

  const fetchProductsFromDB = async () => {
    try {
      const res = await fetch("/api/product");
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

  const loadUserDataAndOrders = () => {
    if (typeof window === "undefined") return;

    if (session?.user?.email) {
      const savedOrders = localStorage.getItem(`orders_${session.user.email}`);
      let currentOrders: any[] = [];
      if (savedOrders) {
        currentOrders = JSON.parse(savedOrders);
        setOrders(currentOrders);

        const approvedExp = currentOrders
          .filter(o => o.status && (o.status.includes("Procesada") || o.status.includes("Entregada") || o.status.includes("Aprobada") || o.status.includes("Vía")))
          .reduce((acc, curr) => acc + Number(curr.total || 0), 0);
        setUserExpTotal(approvedExp);
      }

      const savedPoints = localStorage.getItem(`points_${session.user.email}`);
      if (savedPoints !== null) {
        setUserPoints(Number(savedPoints));
      } else {
        setUserPoints(0);
        localStorage.setItem(`points_${session.user.email}`, "0");
      }
    }

    if (isAuthorizedAdminEmail) {
      loadAllStoreOrders();
    }
  };

  useEffect(() => {
    if (session?.user?.email && typeof window !== "undefined") {
      try {
        loadUserDataAndOrders();
        fetchProductsFromDB();

        const addressesKey = `addresses_${session.user.email}`;
        const storedAddresses = localStorage.getItem(addressesKey);
        if (storedAddresses) {
          setAddresses(JSON.parse(storedAddresses));
        } else {
          const defaultAddr = [{
            id: `addr-${Date.now()}`,
            alias: "CASA PRINCIPAL",
            address: "AV. PRINCIPAL, SECTOR CENTRAL",
            city: "EL TIGRE, ANZOÁTEGUI",
            phone: "+58 412-1234567",
            default: true
          }];
          setAddresses(defaultAddr);
          localStorage.setItem(addressesKey, JSON.stringify(defaultAddr));
        }

        const userMsgKey = `kronos_messages_${session.user.email}`;
        const savedUserMessages = localStorage.getItem(userMsgKey);
        const readMsgKey = `kronos_read_messages_${session.user.email}`;
        const savedReadMessages = localStorage.getItem(readMsgKey);

        if (savedReadMessages) setReadMessages(JSON.parse(savedReadMessages));

        let loadedMessages: any[] = [];
        if (savedUserMessages) {
          loadedMessages = JSON.parse(savedUserMessages);
        } else {
          const uniqueRegCode = `KRONOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const welcomeMessage = {
            id: `msg-welcome-${Date.now()}`,
            title: "MEMBRESÍA EXCLUSIVA • KRONOS STORE",
            content: `Estimado/a ${session.user.name || "Cliente"}, le damos la bienvenida a nuestra plataforma.\n\nCódigo de cortesía del 10% válido en su primera adquisición: [ ${uniqueRegCode} ].`,
            category: "BIENVENIDA",
            date: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
            sender: "Administración Kronos Store C.A"
          };
          loadedMessages.push(welcomeMessage);
        }

        let targetOrder = null;
        const currentOrders = JSON.parse(localStorage.getItem(`orders_${session.user.email}`) || "[]");
        if (successOrderParam) {
          targetOrder = currentOrders.find((o: any) => o.id === successOrderParam);
        }
        if (!targetOrder && currentOrders.length > 0) {
          targetOrder = currentOrders[currentOrders.length - 1];
        }

        if (targetOrder) {
          const orderMsgId = `msg-order-${targetOrder.id}`;
          const existsOrderMsg = loadedMessages.some(m => m.id === orderMsgId) || (savedReadMessages && JSON.parse(savedReadMessages).some((m: any) => m.id === orderMsgId));
          
          if (!existsOrderMsg) {
            const itemsListStr = targetOrder.items.map((i: any) => `• [${i.qty}x] ${i.name} - $${(i.price * i.qty).toFixed(2)}`).join("\n");
            
            const orderSuccessMsg = {
              id: orderMsgId,
              title: `CONFIRMACIÓN DE ORDEN • ${targetOrder.id}`,
              content: `Su orden #${targetOrder.id} por un monto de $${Number(targetOrder.total).toFixed(2)} USD ha sido registrada con éxito.\n\n[DETALLE]\n${itemsListStr}\n\n[RECOMPENSA]\nPuntos acreditados: +${targetOrder.earnedPoints || Math.floor(targetOrder.total * 1)} PTS`,
              category: "PEDIDO",
              date: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
              sender: "Administración Kronos Store C.A"
            };
            loadedMessages.unshift(orderSuccessMsg);
          }
        }

        setMessages(loadedMessages);
        localStorage.setItem(userMsgKey, JSON.stringify(loadedMessages));
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    }
  }, [session, isAuthorizedAdminEmail, successOrderParam]);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliasInput.trim() || !addressInput.trim() || !cityInput.trim()) return;

    let updatedAddresses = [...addresses];

    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map(a => a.id === editingAddressId ? {
        ...a,
        alias: aliasInput.toUpperCase(),
        address: addressInput.toUpperCase(),
        city: cityInput.toUpperCase(),
        phone: phoneInput
      } : a);
    } else {
      const newAddr = {
        id: `addr-${Date.now()}`,
        alias: aliasInput.toUpperCase(),
        address: addressInput.toUpperCase(),
        city: cityInput.toUpperCase(),
        phone: phoneInput,
        default: addresses.length === 0
      };
      updatedAddresses.push(newAddr);
    }

    setAddresses(updatedAddresses);
    if (session?.user?.email && typeof window !== "undefined") {
      localStorage.setItem(`addresses_${session.user.email}`, JSON.stringify(updatedAddresses));
    }

    setAliasInput("");
    setAddressInput("");
    setCityInput("");
    setPhoneInput("");
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAliasInput(addr.alias);
    setAddressInput(addr.address);
    setCityInput(addr.city);
    setPhoneInput(addr.phone || "");
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (!confirm("¿Deseas eliminar esta dirección?")) return;
    const filtered = addresses.filter(a => a.id !== id);
    setAddresses(filtered);
    if (session?.user?.email && typeof window !== "undefined") {
      localStorage.setItem(`addresses_${session.user.email}`, JSON.stringify(filtered));
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
      const updatedMsgs = [newNotif, ...existingMsgs];
      localStorage.setItem(userMsgKey, JSON.stringify(updatedMsgs));
      if (targetEmail === session?.user?.email) {
        setMessages(updatedMsgs);
      }
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

    loadUserDataAndOrders();
  };

  const handleApproveOrderCustom = (orderId: string, orderUserEmail: string, earnedPts: number, statusType: string) => {
    const comp = shippingCompanyInput[orderId] || "TEALCA";
    const track = trackingCodeInput[orderId] || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    updateGlobalOrderStatus(orderId, orderUserEmail, statusType, { shippingCompany: comp, trackingCode: track });

    if (orderUserEmail && typeof window !== "undefined") {
      const ptsKey = `points_${orderUserEmail}`;
      const currentUsrPts = Number(localStorage.getItem(ptsKey) || 0);
      const newPtsTotal = currentUsrPts + earnedPts;
      localStorage.setItem(ptsKey, newPtsTotal.toString());
      if (orderUserEmail === session?.user?.email) {
        setUserPoints(newPtsTotal);
      }
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
    loadUserDataAndOrders();
  };

  const handleSizeToggle = (sz: string) => {
    if (prodSizes.includes(sz)) {
      setProdSizes(prodSizes.filter(s => s !== sz));
    } else {
      setProdSizes([...prodSizes, sz]);
    }
  };

  const handleSaveProductAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) return;

    const productPayload = {
      ...(editingProductId ? { id: editingProductId } : {}),
      name: prodName.toUpperCase(),
      price: Number(prodPrice),
      oldPrice: prodOldPrice ? Number(prodOldPrice) : null,
      stock: Number(prodStock),
      category: prodCategory.toUpperCase(),
      brand: prodBrand,
      sizes: prodSizes,
      image: prodImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
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
        fetchProductsFromDB();
        handleCancelEditProduct();
      } else {
        setProdSuccessMsg("Error al guardar en la base de datos.");
      }
    } catch (error) {
      console.error("Error de conexión con la API:", error);
      setProdSuccessMsg("Error de comunicación con la base de datos.");
    }

    setTimeout(() => setProdSuccessMsg(""), 4000);
  };

  const handleStartEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price.toString());
    setProdOldPrice(prod.oldPrice ? prod.oldPrice.toString() : "");
    setProdStock(prod.stock.toString());
    setProdCategory(prod.category || "FRANELAS BÁSICAS");
    setProdBrand(prod.brand || "Nike");
    setProdSizes(prod.sizes || ["S", "M", "L", "XL"]);
    setProdImage(prod.image);
    setProdDescription(prod.description);
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
    setProdImage("");
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
        fetchProductsFromDB();
      } else {
        alert("No se pudo eliminar el producto.");
      }
    } catch (err) {
      console.error("Error al eliminar en la API:", err);
    }
  };

  const handleMarkAsRead = (msgId: string) => {
    const msgToMove = messages.find(m => m.id === msgId);
    if (!msgToMove) return;

    const updatedMessages = messages.filter(m => m.id !== msgId);
    const updatedRead = [msgToMove, ...readMessages];

    setMessages(updatedMessages);
    setReadMessages(updatedRead);

    if (session?.user?.email && typeof window !== "undefined") {
      localStorage.setItem(`kronos_messages_${session.user.email}`, JSON.stringify(updatedMessages));
      localStorage.setItem(`kronos_read_messages_${session.user.email}`, JSON.stringify(updatedRead));
    }
  };

  const handleDeleteMessage = (msgId: string, isReadTab: boolean) => {
    if (!confirm("¿Eliminar este mensaje permanentemente?") || typeof window === "undefined") return;
    if (isReadTab) {
      const filtered = readMessages.filter(m => m.id !== msgId);
      setReadMessages(filtered);
      localStorage.setItem(`kronos_read_messages_${session?.user?.email}`, JSON.stringify(filtered));
    } else {
      const filtered = messages.filter(m => m.id !== msgId);
      setMessages(filtered);
      localStorage.setItem(`kronos_messages_${session?.user?.email}`, JSON.stringify(filtered));
    }
  };

  const discountValue = (userPoints / 200).toFixed(2);
  
  const currentTierData = userExpTotal > 1200 
    ? { name: "DIAMOND", next: "MÁXIMO", max: 2000 } 
    : userExpTotal > 600 
    ? { name: "GOLD", next: "DIAMOND", max: 1200 } 
    : userExpTotal > 250 
    ? { name: "SILVER", next: "GOLD", max: 600 } 
    : { name: "BRONZE", next: "SILVER", max: 250 };

  const expNeeded = currentTierData.max - userExpTotal > 0 ? currentTierData.max - userExpTotal : 0;
  const progressPercent = Math.min(100, (userExpTotal / currentTierData.max) * 100);

  const TIERS = [
    { name: "BRONZE", expReq: "$0 - $250 USD en compras", benefits: ["Acceso completo a la tienda", "Gana 1 punto por cada $1 gastado", "Soporte estándar de atención"] },
    { name: "SILVER", expReq: "$251 - $600 USD en compras", benefits: ["Envío estándar preferencial", "Regalo exclusivo de bienvenida", "Descuentos en accesorios"] },
    { name: "GOLD", expReq: "$601 - $1,200 USD en compras", benefits: ["Envío Nacional Gratis > $50", "Multiplicador de puntos x1.2", "Acceso a rebajas privadas"] },
    { name: "DIAMOND", expReq: "+$1,200 USD en compras", benefits: ["Acceso anticipado a drops de ropa", "Soporte dedicado 24/7", "Eventos corporativos exclusivos"] }
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 text-[10px] font-mono tracking-[0.4em] uppercase">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const showAdminTab = isAuthorizedAdminEmail && isViewAsAdmin;
  const tabsList: TabType[] = ["resumen", "pedidos", "niveles", "direcciones", "mensajes", ...(showAdminTab ? ["admin"] as TabType[] : [])];

  const pendingOrders = allStoreOrders.filter(o => !o.status || o.status === "Pendiente de Aprobación");
  const processedOrRejectedOrders = allStoreOrders.filter(o => o.status && o.status !== "Pendiente de Aprobación");

  const adminDisplayList = 
    adminTabFilter === "pendientes" ? pendingOrders :
    adminTabFilter === "historial" ? processedOrRejectedOrders : allStoreOrders;

  const clientPendingOrders = orders.filter(o => !o.status || o.status === "Pendiente de Aprobación");
  const clientShippingOrders = orders.filter(o => o.status && (o.status.includes("Preparación") || o.status.includes("Vía")));
  const clientCompletedOrders = orders.filter(o => o.status && (o.status.includes("Procesada") || o.status.includes("Entregada")));
  const clientRejectedOrders = orders.filter(o => o.status && o.status.includes("Rechazada"));

  const activeClientOrdersList = 
    clientOrderFilter === "pendientes" ? clientPendingOrders :
    clientOrderFilter === "envio" ? clientShippingOrders :
    clientOrderFilter === "completadas" ? clientCompletedOrders : clientRejectedOrders;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 font-sans selection:bg-orange-500 selection:text-black relative">
      
      {successBanner && (
        <div className="bg-orange-500 text-black text-center py-3 px-4 text-[11px] font-mono uppercase tracking-[0.2em] font-black flex items-center justify-center gap-4 sticky top-0 z-50 shadow-lg">
          <span>✓ ¡Orden procesada con éxito! Revisa tu buzón de mensajes.</span>
          <button onClick={() => setSuccessBanner(null)} className="bg-black text-white px-3 py-1 text-[9px] uppercase hover:bg-zinc-800 transition cursor-pointer">Cerrar</button>
        </div>
      )}

      {/* CABECERA CON ALTO CONTRASTE Y ESTILO DE LUJO */}
      <div className="pt-16 pb-12 px-6 lg:px-12 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-black font-black flex items-center justify-center text-3xl tracking-tighter shadow-2xl ring-2 ring-orange-500/30">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-0.5 rounded-full">
                  {isAuthorizedAdminEmail && isViewAsAdmin ? "ADMINISTRADOR" : `MIEMBRO • ${currentTierData.name}`}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">{userPoints} Puntos</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">{session?.user?.name || "Cliente Kronos"}</h1>
              
              <p className="text-xs text-zinc-400 font-mono">
                Miembro desde el <span className="text-orange-400 font-bold">1 de septiembre de 2026</span> • {session?.user?.email || "correo@ejemplo.com"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthorizedAdminEmail && (
              <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-sm shadow-inner">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Modo Admin</span>
                <button
                  onClick={() => setIsViewAsAdmin(!isViewAsAdmin)}
                  className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isViewAsAdmin ? 'bg-orange-500' : 'bg-zinc-800'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${isViewAsAdmin ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: "/" })} 
              className="text-[11px] font-black uppercase tracking-[0.2em] border border-zinc-700 bg-zinc-900 text-zinc-200 px-6 py-3 hover:bg-orange-500 hover:text-black hover:border-orange-500 transition-all rounded-sm cursor-pointer shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10">
        
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex border-b border-zinc-800 mb-12 gap-8 overflow-x-auto no-scrollbar">
          {tabsList.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs uppercase font-black tracking-[0.25em] transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "admin" ? `⚡ Panel Gerencial (${pendingOrders.length})` : tab === "mensajes" ? `✉️ Buzón Privado (${messages.length})` : tab}
            </button>
          ))}
        </div>

        {/* RESUMEN */}
        {activeTab === "resumen" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-zinc-900/80 border border-zinc-800 p-8 sm:p-12 rounded-sm shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black border border-zinc-700 text-orange-500 rounded-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-xl font-black font-mono">KS</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400 block mb-1">Balance de Puntos</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white">{userPoints.toLocaleString()}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-orange-500 font-mono">PTS</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-400 tracking-wide uppercase mt-1">
                      Equivalente a <strong className="text-white font-mono">${discountValue} USD</strong> de descuento directo
                    </p>
                  </div>
                </div>
                <div className="border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0 lg:pl-8">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Inversión Acumulada</span>
                  <span className="text-xl font-black text-orange-400 font-mono mt-0.5 block">${userExpTotal.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-800 relative z-10">
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="font-bold uppercase tracking-wider text-white font-mono text-[11px]">
                    Estatus actual: <span className="text-orange-400 underline decoration-2">{currentTierData.name}</span>
                  </span>
                  <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-widest">
                    {expNeeded > 0 ? `Faltan $${expNeeded.toFixed(2)} USD para ${currentTierData.next}` : "¡Rango Máximo Alcanzado! 👑"}
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === "pedidos" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-black uppercase tracking-wider">Historial de Adquisiciones</h2>
              <div className="flex flex-wrap gap-2">
                {(["pendientes", "envio", "completadas", "rechazadas"] as const).map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setClientOrderFilter(filter)} 
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider cursor-pointer transition ${clientOrderFilter === filter ? 'bg-orange-500 text-black font-bold' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    {filter === 'pendientes' ? `Pendientes (${clientPendingOrders.length})` :
                     filter === 'envio' ? `En Ruta (${clientShippingOrders.length})` :
                     filter === 'completadas' ? `Aprobadas (${clientCompletedOrders.length})` : `Rechazadas (${clientRejectedOrders.length})`}
                  </button>
                ))}
              </div>
            </div>

            {activeClientOrdersList.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 p-16 text-center rounded-sm space-y-4">
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">No hay registros en esta categoría.</p>
                <Link href="/" className="inline-block bg-orange-500 text-black font-black px-8 py-3.5 text-[10px] uppercase tracking-widest hover:bg-orange-400 transition">Explorar Tienda</Link>
              </div>
            ) : (
              activeClientOrdersList.map((order) => {
                const statusLower = (order.status || "").toLowerCase();
                const isProcessed = statusLower.includes("procesada") || statusLower.includes("entregada") || statusLower.includes("aprobada") || statusLower.includes("vía");
                const isRejected = statusLower.includes("rechazada");

                return (
                  <div key={order.id} className={`bg-zinc-900 border p-6 sm:p-8 rounded-sm space-y-6 shadow-md transition ${isProcessed ? 'border-emerald-500/50' : isRejected ? 'border-red-500/50' : 'border-zinc-800'}`}>
                    {isProcessed && (
                      <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 text-emerald-400 text-xs font-mono uppercase tracking-wider font-bold">
                        ✓ Estado de orden: {order.status}
                      </div>
                    )}
                    {isRejected && (
                      <div className="bg-red-950/40 border border-red-800/60 p-3 text-red-400 text-xs font-mono uppercase tracking-wider font-bold space-y-1">
                        <p>✕ Orden rechazada.</p>
                        {order.rejectReason && <p className="text-[11px] text-zinc-300 font-sans normal-case">• Motivo: {order.rejectReason}</p>}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm tracking-wider text-orange-400">{order.id}</span>
                          <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {order.status || "Pendiente de Aprobación"}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1.5 block">
                          Fecha: {order.date} • Pago: <strong className="text-white">{order.paymentMethod}</strong> (Ref: {order.paymentRef})
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-widest">Total</span>
                        <span className="text-2xl font-black font-mono text-white">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>

                    {(order.shippingCompany || order.trackingCode) && (
                      <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-sm space-y-1 text-xs font-mono">
                        <p className="text-orange-400 font-bold uppercase tracking-wider">📦 Despacho y Logística:</p>
                        <p className="text-zinc-300">• Empresa: <strong className="text-white">{order.shippingCompany}</strong></p>
                        <p className="text-zinc-300">• Guía de Rastreo: <strong className="text-emerald-400 font-bold">{order.trackingCode}</strong></p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Dirección de Destino:</span>
                      <p className="text-xs text-zinc-300 uppercase font-mono bg-zinc-950 p-3 rounded border border-zinc-800">{order.shippingAddress}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Artículos Adquiridos:</span>
                      <div className="grid grid-cols-1 gap-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-medium text-zinc-200 bg-zinc-950 p-3 rounded border border-zinc-800">
                            <span className="flex items-center gap-3">
                              {item.image && (
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span>
                                <span className="font-mono text-orange-500 font-bold">[{item.qty}x]</span> {item.name}
                              </span>
                            </span>
                            <span className="font-mono font-bold text-white">${Number(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* NIVELES */}
        {activeTab === "niveles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`border p-8 rounded-sm flex flex-col justify-between bg-zinc-900 transition-all ${currentTierData.name === tier.name ? "border-orange-500 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500" : "border-zinc-800"}`}>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-wider mb-2 text-white">{tier.name}</h4>
                  <span className="text-[10px] font-mono text-orange-400 font-bold block mb-6 pb-4 border-b border-zinc-800">{tier.expReq}</span>
                  <ul className="space-y-3">
                    {tier.benefits.map((ben, i) => (
                      <li key={i} className="text-[11px] font-medium text-zinc-300 flex gap-2.5 items-start">
                        <span className="text-orange-500 font-black">✓</span> {ben}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIRECCIONES */}
        {activeTab === "direcciones" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider">Libreta de Destinos</h2>
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">Direcciones para entregas rápidas.</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAliasInput("");
                  setAddressInput("");
                  setCityInput("");
                  setPhoneInput("");
                  setShowAddressForm(true);
                }}
                className="bg-orange-500 text-black font-black px-6 py-3.5 text-xs uppercase tracking-widest hover:bg-orange-400 transition cursor-pointer shadow-lg"
              >
                + Agregar Destino
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="bg-zinc-900 border border-orange-500/50 p-8 rounded-sm space-y-5 shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  {editingAddressId ? "Editar Dirección" : "Nueva Dirección de Envío"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Alias (Ej: Casa, Oficina)</label>
                    <input 
                      type="text" 
                      value={aliasInput} 
                      onChange={(e) => setAliasInput(e.target.value)}
                      placeholder="CASA PRINCIPAL" 
                      required 
                      className="w-full bg-zinc-950 border border-zinc-800 p-3.5 text-xs uppercase font-medium focus:outline-none focus:border-orange-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Ciudad / Estado</label>
                    <input 
                      type="text" 
                      value={cityInput} 
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="EL TIGRE, ANZOÁTEGUI" 
                      required 
                      className="w-full bg-zinc-950 border border-zinc-800 p-3.5 text-xs uppercase font-medium focus:outline-none focus:border-orange-500 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Dirección Exacta</label>
                  <textarea 
                    rows={2}
                    value={addressInput} 
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="AV. PRINCIPAL..." 
                    required 
                    className="w-full bg-zinc-950 border border-zinc-800 p-3.5 text-xs uppercase font-medium focus:outline-none focus:border-orange-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="0412-1234567" 
                    required 
                    className="w-full bg-zinc-950 border border-zinc-800 p-3.5 text-xs uppercase font-medium focus:outline-none focus:border-orange-500 text-white"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="bg-orange-500 text-black font-black px-6 py-3.5 text-xs uppercase tracking-widest hover:bg-orange-400 cursor-pointer">
                    {editingAddressId ? "Actualizar" : "Guardar Destino"}
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="border border-zinc-800 bg-zinc-950 text-zinc-300 px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 cursor-pointer">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-zinc-800 p-8 rounded-sm bg-zinc-900 space-y-4 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black uppercase tracking-wider text-sm text-orange-400">📍 {addr.alias}</h4>
                      {addr.default && <span className="text-[9px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-0.5 uppercase">Predeterminada</span>}
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">{addr.address}</p>
                    <p className="text-xs text-zinc-500 font-mono">{addr.city}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">Tel: {addr.phone}</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-end gap-4 text-xs">
                    <button onClick={() => handleEditAddress(addr)} className="text-orange-400 hover:text-orange-300 uppercase font-bold tracking-wider cursor-pointer">Editar</button>
                    <span className="text-zinc-700">|</span>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-400 uppercase font-bold tracking-wider cursor-pointer">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENSAJES */}
        {activeTab === "mensajes" && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-black uppercase tracking-wider">Buzón de Comunicaciones</h2>
            
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">Mensajes Nuevos ({messages.length})</h3>
              {messages.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono uppercase">Buzón sin notificaciones nuevas.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-zinc-900 border border-orange-500/30 p-8 rounded-sm space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                      <span>{msg.sender}</span>
                      <span>{msg.date}</span>
                    </div>
                    <h4 className="text-lg font-black uppercase text-white tracking-wide">{msg.title}</h4>
                    <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">{msg.content}</p>
                    <div className="flex gap-4 pt-2">
                      <button onClick={() => handleMarkAsRead(msg.id)} className="bg-emerald-600 text-black px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 cursor-pointer">✓ Marcar como Leído</button>
                      <button onClick={() => handleDeleteMessage(msg.id, false)} className="text-red-500 text-[10px] font-bold uppercase tracking-wider cursor-pointer">Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 pt-8 border-t border-zinc-800">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">Historial Leído ({readMessages.length})</h3>
              {readMessages.map((msg) => (
                <div key={msg.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm space-y-2 opacity-75">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>[ARCHIVADO] {msg.title}</span>
                    <span>{msg.date}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{msg.content}</p>
                  <button onClick={() => handleDeleteMessage(msg.id, true)} className="text-red-500 text-[10px] font-bold uppercase cursor-pointer pt-1">Eliminar permanentemente</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL ADMIN */}
        {activeTab === "admin" && isAuthorizedAdminEmail && isViewAsAdmin && (
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-8 sm:p-12 rounded-sm shadow-2xl space-y-8 animate-fadeIn">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 block">Centro de Control Gerencial</span>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Panel Administrativo Kronos Store</h2>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-sm border border-zinc-800">
                <button 
                  onClick={() => setAdminSubTab("ordenes")} 
                  className={`px-5 py-2.5 text-xs font-black uppercase cursor-pointer tracking-wider transition ${adminSubTab === 'ordenes' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  📦 Órdenes ({allStoreOrders.length})
                </button>
                <button 
                  onClick={() => setAdminSubTab("productos")} 
                  className={`px-5 py-2.5 text-xs font-black uppercase cursor-pointer tracking-wider transition ${adminSubTab === 'productos' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  🏷️ Catálogo ({storeProducts.length})
                </button>
              </div>
            </div>

            {adminSubTab === "ordenes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-black uppercase tracking-tight">Gestión de Adquisiciones</h3>
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                            <div className="bg-zinc-900 p-3.5 border border-zinc-800 rounded-sm">
                              <p className="text-zinc-400"><strong>Método de Pago:</strong> {order.paymentMethod}</p>
                              <p className="text-zinc-400 mt-1"><strong>Referencia:</strong> <span className="text-white font-bold">{order.paymentRef}</span></p>
                            </div>
                            <div className="bg-zinc-900 p-3.5 border border-zinc-800 rounded-sm">
                              <p className="text-zinc-400"><strong>Destino:</strong> {order.shippingAddress}</p>
                              <p className="text-zinc-400 mt-1"><strong>Puntos a otorgar:</strong> <span className="text-orange-400 font-bold">+{order.earnedPoints || Math.floor(order.total * 1)} PTS</span></p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Artículos Solicitados:</span>
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

                          <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
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

                          <div className="space-y-2 pt-2">
                            <label className="block text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">
                              Modificar Estatus y Control Logístico:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                onClick={() => handleApproveOrderCustom(order.id, order.userEmail, order.earnedPoints || Math.floor(order.total * 1), "Aprobada - En Preparación")}
                                className="p-3 bg-emerald-600 text-black font-black text-[10px] uppercase text-center hover:bg-emerald-500 cursor-pointer transition"
                              >
                                ✓ Aprobada / En Preparación
                              </button>
                              <button
                                onClick={() => handleApproveOrderCustom(order.id, order.userEmail, order.earnedPoints || Math.floor(order.total * 1), "Despachado en Vía")}
                                className="p-3 bg-blue-600 text-black font-black text-[10px] uppercase text-center hover:bg-blue-500 cursor-pointer transition"
                              >
                                🚚 Despachado en Vía
                              </button>
                              <button
                                onClick={() => handleApproveOrderCustom(order.id, order.userEmail, order.earnedPoints || Math.floor(order.total * 1), "Procesada / Entregada")}
                                className="p-3 bg-zinc-200 text-black font-black text-[10px] uppercase text-center hover:bg-white cursor-pointer transition"
                              >
                                ⭐ Procesada / Entregada
                              </button>
                            </div>
                          </div>

                          <div className="bg-red-950/20 p-5 border border-red-900/40 rounded-sm space-y-3">
                            <label className="block text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
                              Protocolo de Rechazo:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <select 
                                onChange={(e) => setRejectReasonSelect({ ...rejectReasonSelect, [order.id]: e.target.value })}
                                className="w-full p-3 bg-zinc-950 border border-red-900/50 text-xs text-white font-mono uppercase focus:outline-none"
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
                                className="w-full p-3 bg-zinc-950 border border-red-900/50 text-xs text-white uppercase focus:outline-none"
                              />
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => handleRejectOrderCustom(order.id, order.userEmail)}
                                className="bg-red-600 text-white font-black text-[10px] uppercase px-6 py-3 hover:bg-red-500 cursor-pointer transition"
                              >
                                ✕ Ejecutar Rechazo y Notificar
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
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
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Catálogo de Productos</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">Control de inventario, precios y colecciones en base de datos.</p>
                </div>

                {prodSuccessMsg && (
                  <div className="bg-orange-500 text-black p-3.5 text-xs font-mono uppercase font-black rounded-sm shadow">
                    {prodSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-4 lg:col-span-1 h-fit shadow-xl">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-orange-400">
                        {editingProductId ? "Editar Producto" : "Nuevo Producto"}
                      </h4>
                      {editingProductId && (
                        <button type="button" onClick={handleCancelEditProduct} className="text-[10px] font-mono text-zinc-400 uppercase underline cursor-pointer">Cancelar</button>
                      )}
                    </div>
                    
                    <form onSubmit={handleSaveProductAdmin} className="space-y-4 text-xs font-mono">
                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Nombre</label>
                        <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="FRANELA" required className="w-full bg-zinc-900 border border-zinc-800 p-3 uppercase text-xs text-white focus:outline-none focus:border-orange-500" />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Precio ($)</label>
                          <input type="number" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="28.00" required className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Ant. ($)</label>
                          <input type="number" step="0.01" value={prodOldPrice} onChange={(e) => setProdOldPrice(e.target.value)} placeholder="35.00" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Stock</label>
                          <input type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="20" required className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
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

                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">URL de Imagen</label>
                        <input type="url" value={prodImage} onChange={(e) => setProdImage(e.target.value)} placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500" />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Descripción</label>
                        <textarea rows={2} value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} placeholder="Detalles..." className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs uppercase text-white focus:outline-none focus:border-orange-500" />
                      </div>

                      <button type="submit" className="w-full bg-orange-500 text-black font-black uppercase tracking-widest py-3.5 hover:bg-orange-400 transition cursor-pointer shadow-lg">
                        {editingProductId ? "Actualizar Producto" : "Publicar Producto"}
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Inventario Actual ({storeProducts.length})</h4>
                    
                    {storeProducts.length === 0 ? (
                      <p className="text-xs font-mono text-zinc-500 uppercase py-12 text-center border border-zinc-800 rounded">No hay productos en el catálogo.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {storeProducts.map((prod) => (
                          <div key={prod.id} className={`border p-5 rounded-sm bg-zinc-950 flex flex-col justify-between space-y-4 shadow-md ${editingProductId === prod.id ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-zinc-800'}`}>
                            <div className="flex gap-4 items-start">
                              <div className="w-14 h-16 bg-zinc-900 border border-zinc-800 rounded overflow-hidden flex-shrink-0 relative">
                                {prod.isDiscount && <span className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-bold px-1">OFERTA</span>}
                                {prod.isPromo && !prod.isDiscount && <span className="absolute top-0 left-0 bg-orange-600 text-white text-[8px] font-bold px-1">PROMO</span>}
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="truncate space-y-1">
                                <div className="flex gap-1.5 items-center flex-wrap">
                                  <span className="text-[9px] font-mono uppercase bg-zinc-900 text-zinc-300 px-2 py-0.5">{prod.category}</span>
                                  {prod.brand && <span className="text-[9px] font-mono uppercase bg-orange-500/20 text-orange-400 px-1.5 py-0.5 font-bold">{prod.brand}</span>}
                                </div>
                                <h5 className="font-black uppercase text-xs tracking-tight text-white truncate">{prod.name}</h5>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-mono text-orange-400 font-bold">${Number(prod.price).toFixed(2)} USD</p>
                                  {prod.oldPrice && <p className="text-[10px] font-mono text-zinc-500 line-through">${Number(prod.oldPrice).toFixed(2)}</p>}
                                </div>
                                <p className="text-[10px] font-mono text-zinc-400">Stock: {prod.stock} unids.</p>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3 text-xs">
                              <button onClick={() => handleStartEditProduct(prod)} className="text-orange-400 hover:text-orange-300 font-mono text-[10px] font-bold uppercase cursor-pointer">Editar</button>
                              <span className="text-zinc-700">|</span>
                              <button onClick={() => handleDeleteProductAdmin(prod.id)} className="text-red-500 hover:text-red-400 font-mono text-[10px] font-bold uppercase cursor-pointer">Eliminar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}