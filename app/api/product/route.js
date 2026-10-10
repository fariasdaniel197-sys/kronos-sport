import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. OBTENER TODOS LOS PRODUCTOS (GET)
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return NextResponse.json({ success: false, error: "Error al obtener los productos" }, { status: 500 });
  }
}

// 2. CREAR O ACTUALIZAR PRODUCTO (POST)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, price, oldPrice, stock, category, brand, sizes, image, description, isPromo, isDiscount, badge } = body;

    let product;

    if (id) {
      // Actualizar producto existente
      product = await prisma.product.update({
        where: { id },
        data: { name, price, oldPrice, stock, category, brand, sizes, image, description, isPromo, isDiscount, badge }
      });
      return NextResponse.json({ success: true, product, message: "¡Producto actualizado con éxito!" });
    } else {
      // Crear un producto nuevo
      product = await prisma.product.create({
        data: { name, price, oldPrice, stock, category, brand, sizes, image, description, isPromo, isDiscount, badge }
      });
      return NextResponse.json({ success: true, product, message: "¡Producto registrado en la base de datos!" });
    }
  } catch (error) {
    console.error("Error en la API de product (POST):", error);
    return NextResponse.json({ success: false, error: "Error al procesar el producto en la base de datos" }, { status: 500 });
  }
}

// 3. ELIMINAR PRODUCTO (DELETE)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID no proporcionado" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return NextResponse.json({ success: false, error: "Error al eliminar el producto" }, { status: 500 });
  }
}