import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ orders: [], points: 0 });
    }

    // Buscar las órdenes del usuario con sus respectivos items usando Prisma
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      date: new Date(order.createdAt).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.quantity,
      })),
      trackingNumber: "ZM-" + Math.floor(100000 + Math.random() * 900000)
    }));

    return NextResponse.json({ orders: formattedOrders, points: user.points || 0 });

  } catch (error: any) {
    console.error("Error al obtener las órdenes:", error);
    return NextResponse.json({ error: "Error al cargar los pedidos" }, { status: 500 });
  }
}