import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, shippingMethod, paymentMethod, total, paymentRef, earnedPoints } = body;

    // 1. Identificar al usuario real o recurrir al primero si no se envió ID
    let targetUserId = userId;
    let userEmail = "";
    let userName = "Cliente";

    if (!targetUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return NextResponse.json({ success: false, error: "No hay usuarios registrados en la base de datos." }, { status: 404 });
      }
      targetUserId = defaultUser.id;
      userEmail = (defaultUser as any).email;
      userName = (defaultUser as any).name || "Cliente";
    } else {
      const currentUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
      if (currentUser) {
        userEmail = (currentUser as any).email;
        userName = (currentUser as any).name || "Cliente";
      }
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

    // 4. Enviar correo de confirmación de pedido con Resend
    if (userEmail) {
      try {
        // Generar filas de productos para la tabla del correo
        const itemsHtml = (newOrder.items || []).map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; color: #333;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; color: #333; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; color: #333; text-align: right;">$${Number(item.price).toFixed(2)}</td>
          </tr>
        `).join("");

        await resend.emails.send({
          from: 'Tienda Kronos <hola@tiendakronos.com>',
          to: [userEmail],
          subject: `¡Pedido confirmado! #${orderId} • KRONOS STORE 📦`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="color: #111; text-transform: uppercase; letter-spacing: 1px; font-size: 18px; text-align: center;">¡Gracias por tu compra, ${userName}!</h2>
              <p style="text-align: center; color: #666; font-size: 13px;">Hemos recibido tu pedido con éxito y ya se encuentra en proceso.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 4px 0; font-size: 13px;"><strong>Nro de Pedido:</strong> ${orderId}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Estado:</strong> Pendiente de Aprobación</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Método de Pago:</strong> ${paymentMethod || "Efectivo"}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Método de Envío:</strong> ${shippingMethod || "Estándar"}</p>
              </div>

              <h3 style="font-size: 15px; text-transform: uppercase; border-bottom: 2px solid #111; padding-bottom: 5px;">Detalle de los productos</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f1f1f1;">
                    <th style="padding: 8px; text-align: left; font-size: 12px; color: #555;">Producto</th>
                    <th style="padding: 8px; text-align: center; font-size: 12px; color: #555;">Cant.</th>
                    <th style="padding: 8px; text-align: right; font-size: 12px; color: #555;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="text-align: right; margin-top: 20px;">
                <h3 style="font-size: 16px; color: #111;">Total a pagar: $${orderTotal.toFixed(2)}</h3>
              </div>

              <br>
              <p style="font-size: 13px; color: #555; text-align: center;">Te notificaremos por este medio cuando tu pedido cambie de estado o sea despachado.</p>
              <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">¡Un saludo cordial de todo el equipo de Tienda Kronos!</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Error al enviar el correo de confirmación de pedido:", emailError);
      }
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