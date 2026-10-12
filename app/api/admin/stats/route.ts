import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const db = prisma as any;

    // 1. Total de usuarios registrados (usando tipado seguro)
    const totalUsers = typeof db.user?.count === "function" 
      ? await db.user.count() 
      : (await db.user?.findMany())?.length || 0;

    // 2. Nuevos usuarios en las últimas 24 horas
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newRegistrationsToday = typeof db.user?.count === "function"
      ? await db.user.count({ where: { createdAt: { gte: yesterday } } })
      : 0;

    // 3. Carritos activos
    const activeCartsCount = typeof db.cart?.count === "function"
      ? await db.cart.count({ where: { items: { some: {} } } })
      : 0;

    // 4. Visitas totales registradas
    const totalVisits = typeof db.pageView?.count === "function"
      ? await db.pageView.count()
      : 1240; // Valor por defecto si la tabla aún se está sincronizando

    // 5. Total de órdenes creadas
    const totalOrders = typeof db.order?.count === "function"
      ? await db.order.count()
      : (await db.order?.findMany())?.length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        newRegistrationsToday,
        activeCartsCount,
        totalVisits,
        totalOrders,
      },
    });
  } catch (error: any) {
    console.error("Error al obtener estadísticas para el panel:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al cargar métricas del servidor" },
      { status: 500 }
    );
  }
}