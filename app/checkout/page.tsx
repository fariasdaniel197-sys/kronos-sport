"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [shippingMethod, setShippingMethod] = useState("tealca");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");
  const [shippingAddress, setShippingAddress] = useState("");
  
  const [paymentRef, setPaymentRef] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [usePointsDiscount, setUsePointsDiscount] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupons, setAppliedCoupons]	= useState<{ code: string; discountPercent: number }[]>([]);
  const	[couponError, setCouponError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userPoints, setUserPoints] = useState<number>(1250);
  
  // Tasa BCV en vivo
  const [bcvRate, setBcvRate] = useState<number>(875.65); // Tasa base referencial actualizada

  const earnedPointsRef = useRef(0);
  const generatedOrderIdRef = useRef("");

  const [surveyStarted, setSurveyStarted] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    answer5: ""
  });
  
  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [earnedDiscountCode, setEarnedDiscountCode] = useState<string>("");

  useEffect(() => {
    // Obtener la tasa BCV oficial en tiempo real mediante API pública o respaldo
    fetch("https://pydolarvenezuela-api.vercel.app/api/v1/dollar/pit")
      .then((res) => res.json())
      .then((data) => {
        if (data?.monitors?.bcv?.price) {
          setBcvRate(Number(data.monitors.bcv.price));
        }
      })
      .catch(() => {
        // Respaldo en caso de fallo de red
        setBcvRate(875.65);
      });

    if (session?.user?.email) {
      try {
        const pointsKey = `points_${session.user.email}`;
        const storedPoints = localStorage.getItem(pointsKey);
        if (storedPoints !== null) {
          setUserPoints(Number(storedPoints));
        } else {
          localStorage.setItem(pointsKey, "1250");
          setUserPoints(1250);
        }

        const addressesKey = `addresses_${session.user.email}`;
        const storedAddresses = localStorage.getItem(addressesKey);
        if (storedAddresses) {
          const parsed = JSON.parse(storedAddresses);
          setSavedAddresses(parsed);
          const defaultAddr = parsed.find((a: any) => a.default) || parsed[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setShippingAddress(`${defaultAddr.alias}: ${defaultAddr.address}, ${defaultAddr.city} (Tel: ${defaultAddr.phone})`);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }
  }, [session]);

  const userTier = userPoints > 5000 ? "DIAMOND" : userPoints > 2500 ? "GOLD" : userPoints > 1000 ? "SILVER" : "BRONZE";
  const nextTierMax = userPoints > 5000 ? 10000 : userPoints > 2500 ? 5000 : userPoints > 1000 ? 2500 : 1000;
  const nextTierName = userPoints > 5000 ? "DIAMOND" : userPoints > 2500 ? "GOLD" : userPoints > 1000 ? "SILVER" : "BRONZE";

  const pointsEarnedByPurchase = Math.floor(cartTotal * 1);
  const maxDiscountFromPoints = userPoints / 200;
  const pointsDiscountApplied = usePointsDiscount ? Math.min(maxDiscountFromPoints, cartTotal) : 0;

  const subtotalAfterPoints = Math.max(0, cartTotal - pointsDiscountApplied);
  const totalCouponDiscountPercent = appliedCoupons.reduce((acc, c) => acc + c.discountPercent, 0);
  const couponDiscountAmount = subtotalAfterPoints * (totalCouponDiscountPercent / 100);

  const isFreeShippingByAmount = cartTotal >= 50;
  
  const getShippingCost = () => {
    if (shippingMethod === "door") {
      return 0.0; // Puerta a puerta en El Tigre es GRATIS
    }
    if (isFreeShippingByAmount && ["tealca", "mrw", "zoom", "domesa"].includes(shippingMethod)) {
      return 0.0;
    }
    return 2.50; // Tarifa fija reducida a $2.50 para todas las empresas
  };

  const shippingCost = getShippingCost();
  const finalTotal = Math.max(0, subtotalAfterPoints - couponDiscountAmount + shippingCost);

  // Función auxiliar para formatear en Bolívares usando la tasa BCV
  const formatBs = (usdAmount: number) => {
    const totalBs = usdAmount * bcvRate;
    return totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Bs";
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");

    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (appliedCoupons.length >= 1) {
      setCouponError("Solo se permite un (1) cupón de descuento por orden.");
      return;
    }

    if (appliedCoupons.some(c => c.code === cleanCode)) {
      setCouponError("Este cupón ya ha sido aplicado a la orden.");
      return;
    }

    if (
      cleanCode.startsWith("KRONOS-WELCOME") || 
      cleanCode.startsWith("SURVEY") || 
      cleanCode.startsWith("WELCOME") || 
      cleanCode === "KRONOS10" || 
      cleanCode === "VIP10"
    ) {
      setAppliedCoupons([...appliedCoupons, { code: cleanCode, discountPercent: 10 }]);
      setCouponCode("");
    } else if (cleanCode === "KRONOS20" || cleanCode === "VIP20") {
      setAppliedCoupons([...appliedCoupons, { code: cleanCode, discountPercent: 20 }]);
      setCouponCode("");
    } else {
      setCouponError("Cupón inválido, no reconocido o expirado.");
    }
  };

  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id);
    if (id === "custom") {
      setShippingAddress("");
    } else {
      const found = savedAddresses.find(a => a.id === id);
      if (found) {
        setShippingAddress(`${found.alias}: ${found.address}, ${found.city} (Tel: ${found.phone})`);
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!session || !session.user?.email) {
      router.push("/login");
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMsg("Debe ingresar o seleccionar una dirección exacta de envío.");
      return;
    }

    if (!paymentMethod) {
      setErrorMsg("Debe seleccionar un instrumento de pago obligatoriamente.");
      return;
    }

    if (!isAdult) {
      setErrorMsg("Requisito obligatorio: Debe certificar bajo juramento que es mayor de 18 años.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg("Debe aceptar íntegramente los términos legales y de servicio.");
      return;
    }

    if (cart.length === 0) {
      setErrorMsg("El carrito se encuentra vacío.");
      return;
    }

    setIsSubmitting(true);

    generatedOrderIdRef.current = `KRO-${Math.floor(100000 + Math.random() * 900000)}`;
    earnedPointsRef.current = Math.floor(cartTotal * 1);
    const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const shippingLabels: Record<string, string> = {
      tealca: (isFreeShippingByAmount ? "TEALCA (GRATIS por compra > $50)" : "TEALCA ($2.50)"),
      mrw: (isFreeShippingByAmount ? "MRW (GRATIS por compra > $50)" : "MRW ($2.50)"),
      zoom: (isFreeShippingByAmount ? "ZOOM (GRATIS por compra > $50)" : "ZOOM ($2.50)"),
      domesa: (isFreeShippingByAmount ? "DOMESA (GRATIS por compra > $50)" : "DOMESA ($2.50)"),
      door: "Envío Puerta a Puerta en El Tigre (GRATIS)"
    };

    const shippingLabel = shippingLabels[shippingMethod] || "Envío Estándar";

    const newOrder = {
      id: generatedOrderIdRef.current,
      trackingNumber,
      userEmail: session?.user?.email || "",
      userName: session?.user?.name || "Cliente Kronos",
      date: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
      items: cart,
      total: finalTotal,
      earnedPoints: earnedPointsRef.current,
      shippingMethod: shippingLabel,
      shippingAddress,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentRef: paymentRef || "N/A",
      status: "Pendiente de Aprobación",
    };

    try {
      const emailKey = session?.user?.email || "guest";
      const existingOrdersRaw = localStorage.getItem(`orders_${emailKey}`);
      const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      const updatedOrders = [newOrder, ...existingOrders];
      
      localStorage.setItem(`orders_${emailKey}`, JSON.stringify(updatedOrders));

      const pointsUsed = usePointsDiscount ? Math.round(pointsDiscountApplied * 200) : 0;
      if (pointsUsed > 0) {
        const finalUpdatedPoints = Math.max(0, userPoints - pointsUsed);
        localStorage.setItem(`points_${emailKey}`, finalUpdatedPoints.toString());
      }

      setTimeout(() => {
        clearCart();
        setIsSubmitting(false);
        setOrderSuccessMessage(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);

    } catch (err) {
      console.error(err);
      setErrorMsg("Error interno al registrar la orden.");
      setIsSubmitting(false);
    }
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const discountCode = `SURVEY-10OFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setEarnedDiscountCode(discountCode);

    if (session?.user?.email) {
      const pointsKey = `points_${session.user.email}`;
      const updatedPts = userPoints + 150;
      localStorage.setItem(pointsKey, updatedPts.toString());
      setUserPoints(updatedPts);
    }
    setSurveyCompleted(true);
  };

  if (orderSuccessMessage) {
    const starLabels: { [key: number]: string } = {
      0: "Selecciona una calificación ⭐",
      1: "Mal ❌",
      2: "Regular ⚠️",
      3: "Bien 👍",
      4: "Muy bien 🔥",
      5: "Excelente ⭐"
    };

    const currentDisplayRating = hoverRating || overallRating;

    return (
      <div className="min-h-screen w-full bg-neutral-950 text-white flex items-center justify-center px-4 py-12 font-sans">
        <div className="max-w-2xl w-full bg-neutral-900 p-8 sm:p-10 border border-neutral-800 rounded-sm shadow-2xl space-y-8 animate-fadeIn my-auto">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">¡Orden procesada con éxito!</h1>
            
            <div className="inline-block bg-neutral-950 border border-neutral-800 px-4 py-2 font-mono text-xs text-orange-400 font-bold uppercase tracking-widest my-2">
              ORDEN: #{generatedOrderIdRef.current}
            </div>

            <p className="text-xs text-neutral-400 uppercase tracking-widest font-mono">
              Tu orden ha sido registrada. Se acreditarán <strong className="text-orange-400">+{earnedPointsRef.current} Puntos Kronos</strong> a tu cuenta en cuanto se apruebe.
            </p>
          </div>

          {!surveyCompleted && !surveyStarted && (
            <div className="bg-black border border-orange-500/40 p-6 rounded-sm space-y-4 text-center shadow-lg">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-orange-400 block">
                Oportunidad Exclusiva
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                ¿Te gustaría ayudarnos a mejorar? Realiza una encuesta rápida y recibe un código de 10% de descuento para tu próxima compra.
              </h3>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setSurveyStarted(true)}
                  className="bg-orange-500 text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition cursor-pointer"
                >
                  Participar en la Encuesta 📋
                </button>
              </div>
            </div>
          )}

          {surveyStarted && !surveyCompleted && (
            <div className="bg-black border border-neutral-800 p-6 sm:p-8 rounded-sm space-y-6">
              <div className="border-b border-neutral-800 pb-4 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-orange-500 block">
                  Encuesta de Satisfacción Kronos Sport
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Responde las siguientes preguntas corporativas
                </h3>
              </div>

              <form onSubmit={handleSurveySubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider">
                      1. ¿Cómo conoció nuestra tienda o qué le motivó a realizar su compra hoy?
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Redes sociales, recomendación..."
                      value={surveyAnswers.answer1}
                      onChange={(e) => setSurveyAnswers({...surveyAnswers, answer1: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider">
                      2. ¿Qué productos, marcas o categorías le gustaría ver en nuestros próximos drops?
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Ropa deportiva, calzado..."
                      value={surveyAnswers.answer2}
                      onChange={(e) => setSurveyAnswers({...surveyAnswers, answer2: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider">
                      3. ¿Cómo evalúa la claridad y comodidad en nuestros métodos de pago?
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Muy rápidos y eficientes..."
                      value={surveyAnswers.answer3}
                      onChange={(e) => setSurveyAnswers({...surveyAnswers, answer3: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider">
                      4. ¿Tiene alguna sugerencia sobre los tiempos de envío o empaque de los pedidos?
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Todo en orden..."
                      value={surveyAnswers.answer4}
                      onChange={(e) => setSurveyAnswers({...surveyAnswers, answer4: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider">
                      5. ¿Recomendaría Kronos Sport a un amigo o colega? ¿Por qué?
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Sí, por la calidad..."
                      value={surveyAnswers.answer5}
                      onChange={(e) => setSurveyAnswers({...surveyAnswers, answer5: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-orange-400 text-center">
                    ¿Cómo calificaría su experiencia de compra en general?
                  </label>
                  
                  <div className="flex flex-col items-center justify-center gap-3 bg-neutral-900 p-5 border border-neutral-800 rounded-sm">
                    <div className="flex gap-2 sm:gap-3">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = currentDisplayRating >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setOverallRating(star)}
                            className={`w-11 h-11 sm:w-12 sm:h-12 text-base sm:text-lg font-black rounded-sm border transition-all duration-200 transform cursor-pointer flex items-center justify-center ${
                              isFilled 
                                ? 'bg-orange-500 text-white border-orange-400 shadow-lg scale-110' 
                                : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-white hover:scale-105'
                            }`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-mono font-bold uppercase text-orange-400 bg-orange-500/10 px-4 py-1.5 border border-orange-500/20 rounded-full transition-all">
                      {starLabels[currentDisplayRating]}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition cursor-pointer shadow-lg"
                >
                  Enviar Encuesta y Reclamar Código 10% OFF 🎁
                </button>
              </form>
            </div>
          )}

          {surveyCompleted && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-6 rounded-sm text-center space-y-3 font-mono">
              <p className="font-bold text-sm uppercase">🎉 ¡Encuesta completada con éxito!</p>
              <p className="text-xs text-neutral-300">Tu código de descuento exclusivo del 10% es: <strong className="text-white bg-black px-3 py-1 border border-neutral-700">{earnedDiscountCode}</strong></p>
              <p className="text-[11px] text-neutral-400">También se han sumado +150 Puntos Kronos a tu cuenta.</p>
            </div>
          )}

          <div className="pt-4 text-center border-t border-neutral-800">
            <Link href="/profile" className="inline-block bg-white text-black px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition">
              Ver Estado en mi Perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white text-black flex flex-col items-center justify-center px-4 font-sans">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-3">Su bolsa de compras está vacía</h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-6">Agregue artículos para continuar.</p>
        <Link href="/" className="bg-black text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition">
          Regresar a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10 border-b border-neutral-300 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-neutral-600 block mb-1">
              Terminal Encriptado • Kronos Sport C.A
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-900">Checkout</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="bg-neutral-200 px-4 py-2 border border-neutral-300 text-neutral-800 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span>Tasa BCV Oficial: <strong>{bcvRate.toFixed(2)} Bs/$</strong></span>
            </div>
            <div className="bg-neutral-200 px-4 py-2 border border-neutral-300 text-neutral-800 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span>SSL SEGURO ACTIVO</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-black text-white border-l-4 border-red-600 p-4 text-xs font-mono uppercase tracking-wider">
            [AVISO DE SISTEMA]: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            
            <div className="bg-white p-6 border border-neutral-300 rounded-sm shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Membresía & Recompensas Kronos</h2>
                <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2.5 py-1 uppercase rounded-full">
                  Nivel: {userTier}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-neutral-50 p-3 border border-neutral-200">
                  <span className="text-neutral-500 uppercase block text-[10px]">Puntos Actuales:</span>
                  <span className="text-base font-black text-black">{userPoints.toLocaleString()} PTS</span>
                </div>
                <div className="bg-orange-50 p-3 border border-orange-200">
                  <span className="text-orange-700 uppercase block text-[10px] font-bold">Puntos a Ganar:</span>
                  <span className="text-base font-black text-orange-600">+{pointsEarnedByPurchase} PTS</span>
                </div>
                <div className="bg-neutral-50 p-3 border border-neutral-200">
                  <span className="text-neutral-500 uppercase block text-[10px]">Próximo Nivel ({nextTierName}):</span>
                  <span className="text-base font-black text-neutral-800">{nextTierMax} PTS</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-600 font-medium uppercase tracking-wide">
                ℹ️ Esta compra te otorga <strong>1 punto por cada $1 USD</strong> gastado.
              </p>

              <div className="pt-1">
                <label className="flex items-center gap-3 cursor-pointer bg-neutral-50 p-3 border border-neutral-300">
                  <input 
                    type="checkbox" 
                    checked={usePointsDiscount} 
                    onChange={(e) => usePointsDiscount ? setUsePointsDiscount(false) : setUsePointsDiscount(true)} 
                    className="accent-black h-4 w-4" 
                  />
                  <span className="text-[11px] font-bold text-neutral-900 uppercase">
                    Aplicar descuento de puntos (-${maxDiscountFromPoints.toFixed(2)} USD / {formatBs(maxDiscountFromPoints)})
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 border border-neutral-300 rounded-sm shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-200 pb-3">Empresa y Modalidad de Envíos</h2>
              
              {isFreeShippingByAmount && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-[11px] font-mono font-bold uppercase tracking-wider">
                  🎉 ¡Felicidades! Tu compra supera los $50 USD y tienes **Envío Nacional Gratuito** en TEALCA, MRW, ZOOM o DOMESA.
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                
                <label className={`border p-4 rounded-sm cursor-pointer flex items-center justify-between transition ${shippingMethod === 'tealca' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'tealca'} onChange={() => setShippingMethod('tealca')} className="accent-black" />
                    <div>
                      <span className="text-xs font-bold uppercase block">TEALCA (Nacional)</span>
                      <span className="text-[11px] text-neutral-600">Entrega estimada: 2-4 días hábiles</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${isFreeShippingByAmount ? 'text-emerald-700' : ''}`}>
                      {isFreeShippingByAmount ? 'GRATIS' : '$2.50 USD'}
                    </span>
                    {!isFreeShippingByAmount && <span className="text-[10px] font-mono text-neutral-500 block">{formatBs(2.50)}</span>}
                  </div>
                </label>

                <label className={`border p-4 rounded-sm cursor-pointer flex items-center justify-between transition ${shippingMethod === 'mrw' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'mrw'} onChange={() => setShippingMethod('mrw')} className="accent-black" />
                    <div>
                      <span className="text-xs font-bold uppercase block">MRW (Nacional)</span>
                      <span className="text-[11px] text-neutral-600">Entrega estimada: 3-5 días hábiles</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${isFreeShippingByAmount ? 'text-emerald-700' : ''}`}>
                      {isFreeShippingByAmount ? 'GRATIS' : '$2.50 USD'}
                    </span>
                    {!isFreeShippingByAmount && <span className="text-[10px] font-mono text-neutral-500 block">{formatBs(2.50)}</span>}
                  </div>
                </label>

                <label className={`border p-4 rounded-sm cursor-pointer flex items-center justify-between transition ${shippingMethod === 'zoom' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'zoom'} onChange={() => setShippingMethod('zoom')} className="accent-black" />
                    <div>
                      <span className="text-xs font-bold uppercase block">Grupo ZOOM (Nacional)</span>
                      <span className="text-[11px] text-neutral-600">Entrega estimada: 2-4 días hábiles</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${isFreeShippingByAmount ? 'text-emerald-700' : ''}`}>
                      {isFreeShippingByAmount ? 'GRATIS' : '$2.50 USD'}
                    </span>
                    {!isFreeShippingByAmount && <span className="text-[10px] font-mono text-neutral-500 block">{formatBs(2.50)}</span>}
                  </div>
                </label>

                <label className={`border p-4 rounded-sm cursor-pointer flex items-center justify-between transition ${shippingMethod === 'domesa' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'domesa'} onChange={() => setShippingMethod('domesa')} className="accent-black" />
                    <div>
                      <span className="text-xs font-bold uppercase block">DOMESA (Nacional)</span>
                      <span className="text-[11px] text-neutral-600">Entrega estimada: 3-5 días hábiles</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${isFreeShippingByAmount ? 'text-emerald-700' : ''}`}>
                      {isFreeShippingByAmount ? 'GRATIS' : '$2.50 USD'}
                    </span>
                    {!isFreeShippingByAmount && <span className="text-[10px] font-mono text-neutral-500 block">{formatBs(2.50)}</span>}
                  </div>
                </label>

                <label className={`border p-4 rounded-sm cursor-pointer flex items-center justify-between transition ${shippingMethod === 'door' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'door'} onChange={() => setShippingMethod('door')} className="accent-black" />
                    <div>
                      <span className="text-xs font-bold uppercase block">Envío Puerta a Puerta (Exclusivo El Tigre)</span>
                      <span className="text-[11px] text-neutral-600">Directo a la puerta de tu casa</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700 block">GRATIS</span>
                    <span className="text-[10px] font-mono text-neutral-500 block">$0.00 USD</span>
                  </div>
                </label>

              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Seleccionar Dirección de Destino / Agencia <span className="text-red-600">*</span>
                </label>

                {savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                    {savedAddresses.map((addr) => (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => handleAddressChange(addr.id)}
                        className={`p-3 text-left border rounded-sm text-xs cursor-pointer transition ${selectedAddressId === addr.id ? 'border-black bg-neutral-100 font-bold' : 'border-neutral-300 bg-white'}`}
                      >
                        <span className="block uppercase font-bold text-neutral-900">📍 {addr.alias} {addr.default && '(Predeterminada)'}</span>
                        <span className="block text-[11px] text-neutral-600 truncate">{addr.address}, {addr.city}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddressChange("custom")}
                      className={`p-3 text-left border rounded-sm text-xs cursor-pointer transition ${selectedAddressId === "custom" ? 'border-black bg-neutral-100 font-bold' : 'border-neutral-300 bg-white'}`}
                    >
                      <span className="block uppercase font-bold text-neutral-900">✏️ Ingresar Otra Dirección / Agencia</span>
                      <span className="block text-[11px] text-neutral-600">Escribir manual para este pedido</span>
                    </button>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    setSelectedAddressId("custom");
                  }}
                  placeholder="Ingrese estado, ciudad, oficina de agencia elegida, avenida, número de casa..."
                  required
                  className="w-full p-3 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-black uppercase font-medium bg-neutral-50"
                />
              </div>
            </div>

            <div className="bg-white p-6 border border-neutral-300 rounded-sm shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-200 pb-3">Instrumento de Pago</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['zelle', 'paypal', 'pagomovil', 'efectivo'].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 px-3 text-[11px] font-bold uppercase tracking-wider border rounded-sm transition cursor-pointer text-center ${paymentMethod === method ? 'bg-black text-white border-black' : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-500'}`}
                  >
                    {method === 'zelle' ? 'Zelle' : method === 'paypal' ? 'PayPal' : method === 'pagomovil' ? 'Pago Móvil' : 'Efectivo'}
                  </button>
                ))}
              </div>

              {paymentMethod && (
                <div className="mt-4 p-4 bg-neutral-50 border border-neutral-300 rounded-sm space-y-3 animate-fadeIn">
                  {paymentMethod === 'zelle' && (
                    <div className="text-xs space-y-2 font-mono">
                      <p className="font-bold uppercase text-neutral-900">Datos para Zelle:</p>
                      <p>• Correo: <strong className="text-orange-600">kronossport@gmail.com</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-xs space-y-2 font-mono">
                      <p className="font-bold uppercase text-neutral-900">Datos para PayPal:</p>
                      <p>• Cuenta: <strong className="text-orange-600">kronossport@gmail.com</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'pagomovil' && (
                    <div className="text-xs space-y-2 font-mono bg-white p-3 border border-neutral-300">
                      <p className="font-bold uppercase text-neutral-900 mb-1">Datos de Pago Móvil Nacional:</p>
                      <p>• Teléfono: <strong>0412-0298624</strong></p>
                      <p>• Banco: <strong>Banco Nacional de Crédito</strong></p>
                      <p>• Cédula: <strong>30.254.522</strong></p>
                      <p>• Titular: <strong>Luis Daniel Farías Ledezma</strong></p>
                      <div className="mt-2 pt-2 border-t border-neutral-200 text-orange-700 font-bold">
                        Equivalente aproximado en Bs a pagar: {formatBs(finalTotal)}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'efectivo' && (
                    <div className="text-xs space-y-1 font-mono text-neutral-700">
                      <p className="font-bold uppercase text-neutral-900">Pago en Efectivo / Pickup:</p>
                      <p>• Pago presencial al retirar en nuestras instalaciones físicas en El Tigre, Anzoátegui.</p>
                    </div>
                  )}

                  {paymentMethod !== 'efectivo' && (
                    <div className="pt-2 border-t border-neutral-200 space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                        Número de Comprobante / ID de Transacción <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="Ej: ZELLE-998271"
                        required
                        className="w-full p-2.5 text-xs border border-neutral-300 rounded-sm bg-white font-mono uppercase"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white p-6 border-2 border-neutral-900 rounded-sm space-y-5 text-xs text-neutral-800 shadow-sm">
              <div className="border-b border-neutral-300 pb-3">
                <h3 className="font-black uppercase tracking-widest text-neutral-900 text-sm">
                  Avisos Legales, Seguridad y Términos de Responsabilidad
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  Documento Contractual Obligatorio • Versión 2026.1
                </span>
              </div>

              <div className="space-y-3.5 leading-relaxed text-neutral-700 font-medium">
                <p>
                  <strong className="text-neutral-900 uppercase">1. Restricción de Edad (Mayores de 18 Años):</strong> Las operaciones comerciales, transacciones financieras y adquisición de productos en Kronos Sport C.A están dirigidas exclusivamente a <strong>personas mayores de 18 años</strong> con capacidad jurídica para contratar.
                </p>
                <p>
                  <strong className="text-neutral-900 uppercase">2. Limitación de Responsabilidad Logística y Aduanera:</strong> La empresa no asume responsabilidad económica ni penal por demoras derivadas de contingencias operativas de los operadores logísticos externos.
                </p>
                <p>
                  <strong className="text-neutral-900 uppercase">3. Política de Devoluciones y Garantía:</strong> El comprador dispone de un plazo de <strong>15 días continuos</strong> a partir de la recepción para formalizar reclamos por defectos de fabricación, conservando empaques y etiquetas originales.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-300 space-y-3.5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} className="mt-0.5 accent-black h-4 w-4 rounded-none cursor-pointer" />
                  <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-tight group-hover:underline">
                    CERTIFICO BAJO JURAMENTO QUE SOY MAYOR DE 18 AÑOS DE EDAD Y POSEGO CAPACIDAD JURÍDICA.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 accent-black h-4 w-4 rounded-none cursor-pointer" />
                  <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-tight group-hover:underline">
                    HE LEÍDO Y ACEPTO ÍNTEGRAMENTE LOS TÉRMINOS DE SERVICIO Y POLÍTICA DE PRIVACIDAD.
                  </span>
                </label>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 border border-neutral-300 rounded-sm shadow-sm space-y-6 sticky top-24">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-neutral-200 pb-4 text-neutral-900">
                Resumen Financiero
              </h2>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 border border-neutral-300 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-tight line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">Cant: {item.qty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold block">${(item.price * item.qty).toFixed(2)}</span>
                      <span className="font-mono text-[10px] text-neutral-500 block">{formatBs(item.price * item.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                  Cupón de Bienvenida / Descuento (Máx. 1 por orden)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="EJ: KRONOS-WELCOME-XXXX"
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-sm font-mono uppercase bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-black text-white px-4 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                {couponError && <p className="text-[10px] font-mono text-red-600 font-bold">{couponError}</p>}
                
                {appliedCoupons.map((coupon, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 text-xs font-mono">
                    <span>Cupón <strong>{coupon.code}</strong> (-{coupon.discountPercent}%)</span>
                    <button type="button" onClick={() => setAppliedCoupons(appliedCoupons.filter((_, i) => i !== idx))} className="text-red-600 font-bold hover:underline text-[10px]">Quitar</button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal Mercancía</span>
                  <div className="text-right">
                    <span>${cartTotal.toFixed(2)}</span>
                    <span className="block text-[10px] text-neutral-500">{formatBs(cartTotal)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Costo de Envío</span>
                  <div className="text-right">
                    <span className={shippingCost === 0 ? "text-emerald-600 font-bold" : ""}>
                      {shippingCost === 0 ? "GRATIS" : `$${shippingCost.toFixed(2)}`}
                    </span>
                    <span className="block text-[10px] text-neutral-500">{shippingCost === 0 ? "0.00 Bs" : formatBs(shippingCost)}</span>
                  </div>
                </div>
                {pointsDiscountApplied > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Descuento por Puntos</span>
                    <div className="text-right">
                      <span>-${pointsDiscountApplied.toFixed(2)}</span>
                      <span className="block text-[10px] text-emerald-700">-{formatBs(pointsDiscountApplied)}</span>
                    </div>
                  </div>
                )}
                {appliedCoupons.map((coupon, idx) => (
                  <div key={idx} className="flex justify-between text-emerald-600 font-bold">
                    <span>Cupón ({coupon.code})</span>
                    <div className="text-right">
                      <span>-${(subtotalAfterPoints * (coupon.discountPercent / 100)).toFixed(2)}</span>
                      <span className="block text-[10px] text-emerald-700">-{formatBs(subtotalAfterPoints * (coupon.discountPercent / 100))}</span>
                    </div>
                  </div>
                ))}
                
                {/* TOTAL NETO A PAGAR CON CONVERSIÓN EN VIVO */}
                <div className="flex justify-between items-center text-base font-black text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Total Neto a Pagar</span>
                  <div className="text-right">
                    <span className="font-mono text-black text-lg block">${finalTotal.toFixed(2)}</span>
                    <span className="font-mono text-orange-600 text-xs font-bold block">{formatBs(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50 shadow-lg"
              >
                {isSubmitting ? "Procesando Orden..." : "Procesar y Autorizar Orden"}
              </button>

              <p className="text-[10px] text-center text-neutral-500 font-mono uppercase tracking-widest pt-2 border-t border-neutral-200">
                Kronos Sport C.A • Transacción Encriptada SSL
              </p>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}