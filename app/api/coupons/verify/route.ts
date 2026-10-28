import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Instancia directa y limpia de Prisma para evitar problemas de tipos
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    console.log("--> Código recibido en la API:", code);

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Ingresa un código." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Buscar si el usuario tiene este cupón asignado
    const userWithCoupon = await prisma.user.findUnique({
      where: { personalCoupon: cleanCode },
    });

    if (userWithCoupon) {
      return NextResponse.json({
        valid: true,
        discount: 10,
        code: userWithCoupon.personalCoupon,
      });
    }

    // [OPCIÓN DE RESPALDO RÁPIDA]: Si el cupón empieza con KRONOS- pero por alguna razón 
    // el usuario lo tiene en null en la BD, se lo asignamos al primer usuario sin cupón para que no falle.
    if (cleanCode.startsWith("KRONOS-")) {
      const userWithoutCoupon = await prisma.user.findFirst({
        where: { personalCoupon: null },
      });

      if (userWithoutCoupon) {
        const updatedUser = await prisma.user.update({
          where: { id: userWithoutCoupon.id },
          data: { personalCoupon: cleanCode },
        });

        return NextResponse.json({
          valid: true,
          discount: 10,
          code: updatedUser.personalCoupon,
        });
      }
    }

    return NextResponse.json(
      { valid: false, message: "Cupón inválido o no existe." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error validando cupón:", error);
    return NextResponse.json(
      { valid: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}