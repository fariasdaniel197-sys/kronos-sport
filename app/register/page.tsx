"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    phone: "", 
    birthdate: "" 
  });
  
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!ageVerified) {
      setError("Debes ser mayor de 18 años para registrarte y procesar pagos.");
      return;
    }
    if (!termsAccepted) {
      setError("Debes aceptar los Términos y Condiciones.");
      return;
    }
    if (!captchaVerified) {
      setError("Por favor, verifica que no eres un robot.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrarse");
      }

      setSuccess("¡Cuenta creada exitosamente! Redirigiendo a la tienda...");

      const loginRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("Cuenta creada, pero hubo un error al iniciar sesión.");
        setLoading(false);
        return;
      }

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white text-zinc-900 px-4 py-12 selection:bg-black selection:text-white font-sans">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 space-y-6">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-2 border-b border-zinc-100 pb-6">
          <h1 className="text-2xl font-black tracking-tighter uppercase">Crear cuenta</h1>
          <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-[0.2em]">
            Bienvenido a Kronos Rock Store
          </p>
        </div>

        {/* NOTIFICACIÓN DE ERROR */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[10px] sm:text-xs tracking-wider uppercase font-bold rounded-sm text-center">
            ⚠ {error}
          </div>
        )}

        {/* NOTIFICACIÓN DE ÉXITO */}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-xs tracking-wider uppercase font-bold rounded-sm text-center animate-pulse">
            ✓ {success}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="0412-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                required
              />
            </div>
          </div>

          {/* VALIDACIONES LEGALES */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={ageVerified}
                  onChange={(e) => setAgeVerified(e.target.checked)}
                  className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-sm checked:bg-black checked:border-black transition-colors cursor-pointer"
                />
                <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] text-zinc-600 leading-tight group-hover:text-black transition-colors">
                Confirmo que soy <strong>mayor de 18 años</strong> y tengo la capacidad legal para procesar pagos y realizar compras.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-sm checked:bg-black checked:border-black transition-colors cursor-pointer"
                />
                <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] text-zinc-600 leading-tight group-hover:text-black transition-colors">
                He leído y acepto los <Link href="/terminos" className="underline underline-offset-2 font-semibold">Términos de Servicio</Link> y la <Link href="/privacidad" className="underline underline-offset-2 font-semibold">Política de Privacidad</Link>.
              </span>
            </label>
          </div>

          {/* RECAPTCHA */}
          <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-sm flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={captchaVerified}
                  onChange={(e) => setCaptchaVerified(e.target.checked)}
                  className="peer appearance-none w-6 h-6 border-2 border-zinc-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                />
                <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-700">No soy un robot</span>
            </label>
            <div className="flex flex-col items-center">
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 opacity-80" />
              <span className="text-[8px] text-zinc-500 mt-1">reCAPTCHA</span>
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black hover:bg-zinc-800 text-white text-xs uppercase font-black tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20 cursor-pointer"
          >
            {loading ? "Registrando cuenta..." : "Registrarse"}
          </button>
        </form>

        {/* AVISO DE PAGO SEGURO */}
        <div className="pt-6 border-t border-zinc-100 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Pago Seguro y Encriptado (SSL)
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2.5 opacity-50 grayscale text-[10px] font-mono font-bold">
            <span className="border border-zinc-300 px-2 py-0.5">VISA</span>
            <span className="border border-zinc-300 px-2 py-0.5">MASTERCARD</span>
            <span className="border border-zinc-300 px-2 py-0.5">PAYPAL</span>
            <span className="border border-zinc-300 px-2 py-0.5">PAGO MÓVIL</span>
          </div>
        </div>

        {/* LINK A LOGIN */}
        <div className="text-center pt-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-black text-black hover:text-zinc-600 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}