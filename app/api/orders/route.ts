import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerWhatsapp,
      productId,
      gameData,
    } = body;

    console.log("ORDER BODY:", body);

    // =========================
    // VALIDASI INPUT DASAR
    // =========================

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId tidak valid" },
        { status: 400 }
      );
    }

    if (!customerWhatsapp || typeof customerWhatsapp !== "string") {
      return NextResponse.json(
        { error: "Nomor WhatsApp wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi format nomor WhatsApp Indonesia (sederhana)
    const cleanedWhatsapp = customerWhatsapp.trim();
    const waRegex = /^(08|628)[0-9]{8,13}$/;
    if (!waRegex.test(cleanedWhatsapp)) {
      return NextResponse.json(
        { error: "Format nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }

    if (
      !gameData ||
      typeof gameData !== "object" ||
      Array.isArray(gameData) ||
      Object.keys(gameData).length === 0
    ) {
      return NextResponse.json(
        { error: "Data game wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // =========================
    // AMBIL & VALIDASI PRODUK
    // =========================

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price, game_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("PRODUCT FETCH ERROR:", productError);

      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const total = product.price; // harga asli dari database

    // =========================
    // VALIDASI FIELD GAME DATA SESUAI GAME
    // =========================

    const { data: requiredFields, error: fieldsError } = await supabase
      .from("game_fields")
      .select("field_key, field_name")
      .eq("game_id", product.game_id);

    if (fieldsError) {
      console.error("GAME FIELDS FETCH ERROR:", fieldsError);
      return NextResponse.json(
        { error: "Gagal memvalidasi data game" },
        { status: 500 }
      );
    }

    const missingFields = (requiredFields || [])
      .filter((f) => !gameData[f.field_key])
      .map((f) => f.field_name);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field wajib belum diisi: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Buat ID order dari server
    const orderId = crypto.randomUUID();

    // =========================
    // INSERT ORDER
    // =========================

    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        order_number: `ORD-${Date.now()}`,
        subtotal: total,
        total: total,
        customer_whatsapp: cleanedWhatsapp,
      });

    if (orderError) {
      console.error("ORDER INSERT ERROR:", orderError);

      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      );
    }

    // =========================
    // INSERT ORDER ITEM
    // =========================

    const { error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: orderId,
        product_id: productId,
        quantity: 1,
        unit_price: total,
        total_price: total,
        target_data: gameData,
      });

    if (itemError) {
      console.error("ORDER ITEM INSERT ERROR:", itemError);

      return NextResponse.json(
        { error: itemError.message },
        { status: 500 }
      );
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,
      orderId,
    });

  } catch (err) {
    console.error("ORDER SERVER ERROR:", err);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}