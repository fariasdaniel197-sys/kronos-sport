import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingMethod, paymentMethod, total } = body;

    // Buscamos un usuario por defecto para asociar la compra
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: "No hay usuarios registrados en la base de datos." }, { status: 404 });
    }

    const orderTotal = Number(total) || 0;
    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    // Crear la orden en la base de datos
    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        userId: user.id,
        total: orderTotal,
        status: `En preparación (${shippingMethod || "Estándar"})`,
        paymentMethod: paymentMethod || "Efectivo",
        shippingMethod: shippingMethod || "Local",
        items: {
          create: (items || []).map((item: any) => ({
            name: item.name || "Producto",
            price: Number(item.price) || 0,
            quantity: Number(item.qty || item.quantity) || 1,
          })),
        },
      },
    });

    // Sumar puntos al usuario (10 pts por dólar gastado)
    const pointsEarned = Math.floor(orderTotal * 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsEarned } },
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("DETALLE DEL ERROR EN ORDER API:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}