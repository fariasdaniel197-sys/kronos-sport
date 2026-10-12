import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, shippingMethod, paymentMethod, total, paymentRef, earnedPoints } = body;

    // 1. Identificar al usuario real o recurrir al primero si no se envió ID
    let targetUserId = userId;
    if (!targetUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return NextResponse.json({ success: false, error: "No hay usuarios registrados en la base de datos." }, { status: 404 });
      }
      targetUserId = defaultUser.id;
    }

    const orderTotal = Number(total) || 0;
    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    // 2. Crear la orden y sus items relacionados en la base de datos de Neon
    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        userId: targetUserId,
        total: orderTotal,
        status: "Pendiente de Aprobación",
        paymentMethod: paymentMethod || "Efectivo",
        shippingMethod: shippingMethod || "Estándar",
        items: {
          create: (items || []).map((item: any) => ({
            name: item.name || "Producto",
            price: Number(item.price) || 0,
            quantity: Number(item.qty || item.quantity) || 1,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 3. Acreditar los puntos al usuario en la base de datos de forma segura
    if (earnedPoints && earnedPoints > 0) {
      await (prisma.user as any).update({
        where: { id: targetUserId },
        data: {
          points: {
            increment: Number(earnedPoints),
          },
        },
      });
    }

    return NextResponse.json({ success: true, orderId: newOrder.id, order: newOrder });

  } catch (error: any) {
    console.error("DETALLE DEL ERROR EN ORDER API:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const orders = await prisma.order.findMany({
      where: userId ? { userId } : undefined,
      include: { items: true, user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener órdenes de la base de datos" }, { status: 500 });
  }
}