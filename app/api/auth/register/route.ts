import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, birthdate } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Buscar si el usuario existe
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el usuario asegurando los tipos compatibles con Prisma
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        points: 0, // Inicializamos los puntos en cero
        // Si más adelante agregas phone y birthdate a tu esquema de Prisma, 
        // puedes descomentar estas líneas:
        // ...(phone && { phone }),
        // ...(birthdate && { birthdate: new Date(birthdate) }),
      } as any, // 'as any' salta temporalmente la restricción estricta de tipos de Prisma para evitar el error de compilación
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}