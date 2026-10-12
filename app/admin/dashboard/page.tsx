"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingCart, Eye, PackageCheck } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para buscar estadísticas y permitir refresco en tiempo real
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error cargando stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Se actualiza cada 10 segundos en vivo
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Cargando métricas en tiempo real...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera del Panel */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control en Vivo</h1>
            <p className="text-zinc-400 text-sm mt-1">Monitoreo previo al gran lanzamiento de la tienda.</p>
          </div>
          <span className="flex items-center gap-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En tiempo real
          </span>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Visitas */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400">Visitas Totales</span>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-4 text-3xl font-extrabold">{stats?.totalVisits || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Tráfico acumulado a la web</p>
          </div>

          {/* Carritos Activos */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400">Carritos Activos</span>
              <ShoppingCart className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-4 text-3xl font-extrabold">{stats?.activeCartsCount || 0}</div>
            <p className="text-xs text-amber-500/80 mt-1">Usuarios listos para comprar</p>
          </div>

          {/* Usuarios Registrados */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400">Usuarios Registrados</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-4 text-3xl font-extrabold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-purple-400/80 mt-1">+{stats?.newRegistrationsToday || 0} en las últimas 24h</p>
          </div>

          {/* Órdenes / Ventas */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400">Órdenes Generadas</span>
              <PackageCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-4 text-3xl font-extrabold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-emerald-500/80 mt-1">Conversiones exitosas</p>
          </div>
        </div>
      </div>
    </div>
  );
}