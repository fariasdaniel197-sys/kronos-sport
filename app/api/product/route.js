import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convertimos el texto separado por comas de la BD en un arreglo limpio para el frontend
    const products = rawProducts.map((p) => {
      let imgList = [];
      if (typeof p.images === "string" && p.images.trim() !== "") {
        imgList = p.images.split(",").map((i) => i.trim()).filter(Boolean);
      }
      if (imgList.length === 0 && p.image) {
        imgList = [p.image];
      }
      return { ...p, images: imgList };
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("🔴 CUERPO RECIBIDO EN API:", JSON.stringify(body, null, 2));

    const { id, name, price, oldPrice, stock, category, brand, sizes, images, image, description, isPromo, isDiscount, badge } = body;

    // Recolectamos absolutamente todas las fuentes posibles de imágenes (sea arreglo, string con comas, o imagen principal)
    let rawCollection = [];

    if (Array.isArray(images)) {
      rawCollection = images;
    } else if (typeof images === "string" && images.trim() !== "") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) rawCollection = parsed;
        else rawCollection = images.split(",");
      } catch {
        rawCollection = images.split(",");
      }
    }

    if (rawCollection.length === 0 && image) {
      rawCollection = [image];
    }

    // Limpiamos cada link individualmente eliminando espacios, comillas o basura
    const validImages = rawCollection
      .map((img) => String(img || "").trim().replace(/['"]+/g, ''))
      .filter((img) => img.length > 3);

    // Respaldo por si viene totalmente vacío
    const finalImages = validImages.length > 0 
      ? validImages 
      : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"];

    // Unimos las imágenes en un texto plano separado por comas para guardarlas en el campo String de la BD
    const imagesString = finalImages.join(",");
    console.log("✅ TEXTO FINAL DE IMÁGENES A GUARDAR:", imagesString);

    const productData = {
      name: String(name || "PRODUCTO").toUpperCase(),
      price: Number(price) || 0,
      oldPrice: oldPrice !== "" && oldPrice !== null && oldPrice !== undefined ? Number(oldPrice) : null,
      stock: Number(stock) || 0,
      category: category ? String(category).toUpperCase() : "GENERAL",
      brand: brand || null,
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
      images: imagesString,     // <--- Guarda todos los links en un String plano separado por comas
      image: finalImages[0],    // <--- Foto principal para la portada
      description: description || null,
      isPromo: Boolean(isPromo),
      isDiscount: Boolean(isDiscount),
      badge: badge || null,
    };

    let product;

    if (id && typeof id === "string" && id.trim() !== "") {
      product = await prisma.product.update({
        where: { id: id.trim() },
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
    console.error("ERROR DE PRISMA AL GUARDAR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error al procesar la solicitud" 
    }, { status: 500 });
  }
}

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
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}