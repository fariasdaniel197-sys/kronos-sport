"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type TabType = "resumen" | "pedidos" | "niveles" | "direcciones" | "mensajes";

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

  const [orders, setOrders] = useState<any[]>([]);
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

  const userEmail = session?.user?.email || "";
  const isAuthorizedAdminEmail = userEmail === "admin@kronos.com" || userEmail === "fariasdaniel197@gmail.com" || userEmail.includes("admin");

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
  };

  useEffect(() => {
    if (session?.user?.email && typeof window !== "undefined") {
      try {
        loadUserDataAndOrders();

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
  }, [session, successOrderParam]);

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

      {/* CABECERA */}
      <div className="pt-16 pb-12 px-6 lg:px-12 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-black font-black flex items-center justify-center text-3xl tracking-tighter shadow-2xl ring-2 ring-orange-500/30">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-0.5 rounded-full">
                  MIEMBRO • {currentTierData.name}
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
              <Link 
                href="/admin" 
                className="text-[11px] font-black uppercase tracking-[0.2em] bg-orange-500 text-black px-6 py-3 hover:bg-orange-400 transition-all rounded-sm shadow-md"
              >
                ⚡ Ir al Panel Admin
              </Link>
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
          {(["resumen", "pedidos", "niveles", "direcciones", "mensajes"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs uppercase font-black tracking-[0.25em] transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "mensajes" ? `✉️ Buzón Privado (${messages.length})` : tab}
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

      </div>
    </div>
  );
}