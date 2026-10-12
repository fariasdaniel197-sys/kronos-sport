import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. OBTENER TODOS LOS PRODUCTOS (GET)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. CREAR O ACTUALIZAR PRODUCTO (POST)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, price, oldPrice, stock, category, brand, sizes, image, description, isPromo, isDiscount, badge } = body;

    const nowIso = new Date();

    const productData = {
      name: String(name || "PRODUCTO").toUpperCase(),
      price: Number(price) || 0,
      oldPrice: oldPrice !== "" && oldPrice !== null && oldPrice !== undefined ? Number(oldPrice) : null,
      stock: Number(stock) || 0,
      category: category ? String(category).toUpperCase() : "GENERAL",
      brand: brand || null,
      sizes: Array.isArray(sizes) ? sizes : ["S", "M", "L", "XL"],
      image: image || null,
      description: description || null,
      isPromo: Boolean(isPromo),
      isDiscount: Boolean(isDiscount),
      badge: badge || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    let product;

    if (id) {
      product = await prisma.product.update({
        where: { id },
        data: productData,
      });
      return NextResponse.json({ success: true, product, message: "¡Producto actualizado con éxito!" });
    } else {
      product = await prisma.product.create({
        data: productData,
      });
      return NextResponse.json({ success: true, product, message: "¡Producto registrado en la base de datos!" });
    }
  } catch (error) {
    console.error("ERROR REAL DE PRISMA:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Error de Prisma: ${error.message}` 
    }, { status: 500 });
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
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}