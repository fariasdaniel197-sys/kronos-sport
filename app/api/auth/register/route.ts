import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, birthdate } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

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

    // 1. Generar código único asegurando formato KRONOS-XXXX
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const uniqueCoupon = `KRONOS-${randomDigits}`;

    // 2. Crear usuario pasando explícitamente el cupón generado
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        points: 0,
        phone: phone || null,
        birthdate: birthdate ? new Date(birthdate) : null,
        personalCoupon: uniqueCoupon, // <--- Obligatorio para que se guarde en Neon
        subscribedToPromos: true,
      },
    });

    // 3. Enviar correo de Membresía Exclusiva
    try {
      await resend.emails.send({
        from: 'Tienda Kronos <hola@tiendakronos.com>',
        to: [email],
        subject: '¡Bienvenido a Kronos store • KRONOS STORE! 🎟️',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #111; text-transform: uppercase; letter-spacing: 1px; font-size: 18px;">MEMBRESÍA EXCLUSIVA • KRONOS STORE</h2>
            <p>Estimado/a <strong>${name}</strong>,</p>
            <p>Le damos la bienvenida a nuestra plataforma. Nos alegra mucho tenerle con nosotros.</p>
            <p>Como parte de nuestra comunidad exclusiva, le hemos asignado un código de cortesía personal del <strong>10% de descuento</strong> válido en toda la mercancía de la tienda:</p>
            
            <div style="background-color: #f4f4f5; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 22px; font-weight: bold; color: #000; letter-spacing: 2px;">${uniqueCoupon}</span>
              <p style="font-size: 13px; color: #666; margin: 8px 0 0 0;">Válido en su primera adquisición y en toda la mercancía</p>
            </div>

            <p>Puede utilizar este código personalizado al momento de realizar su pago en nuestra web.</p>
            <br>
            <p style="font-size: 14px; color: #555;">¡Un saludo cordial de todo el equipo de Tienda Kronos!</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error al enviar correo de membresía:", emailError);
    }

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