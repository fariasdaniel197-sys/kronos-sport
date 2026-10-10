"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciales inválidas. Revisa tu correo y contraseña.");
        return;
      }

      // Redirección exitosa con el parámetro de aviso e invalidación de caché
      router.push("/?loginSuccess=true");
      router.refresh();

    } catch (err) {
      setError("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center bg-white text-zinc-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-wide uppercase">Iniciar Sesión</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Ingresa a tu cuenta para ver tu carrito y pedidos
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs tracking-wide uppercase font-medium rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-none text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-none text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-black hover:bg-zinc-800 text-white text-xs uppercase font-semibold tracking-widest transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="font-semibold text-black underline underline-offset-4 hover:text-zinc-600">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}