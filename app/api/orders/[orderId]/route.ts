import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID tidak ditemukan",
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // =========================
    // AMBIL ORDER
    // =========================

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("GET ORDER ERROR:", {
        message: orderError.message,
        code: orderError.code,
        details: orderError.details,
        hint: orderError.hint,
        orderId,
      });

      return NextResponse.json(
        {
          error: "Pesanan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =========================
    // AMBIL ORDER ITEM
    // =========================

    const { data: item, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (itemError) {
      console.error("GET ORDER ITEM ERROR:", {
        message: itemError.message,
        code: itemError.code,
        details: itemError.details,
        hint: itemError.hint,
        orderId,
      });

      return NextResponse.json(
        {
          error: "Detail pesanan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =========================
    // AMBIL PRODUCT
    // =========================

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", item.product_id)
      .single();

    if (productError) {
      console.error("GET PRODUCT ERROR:", {
        message: productError.message,
        code: productError.code,
        details: productError.details,
        hint: productError.hint,
        productId: item.product_id,
      });

      return NextResponse.json(
        {
          error: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      order: {
        orderId: order.id,
        orderNumber: order.order_number,
        productName: product.name,
        gameData: item.target_data,
        total: order.total,
        status: order.status,
        customerWhatsapp: order.customer_whatsapp,
      },
    });
  } catch (err) {
    console.error("GET ORDER SERVER ERROR:", err);

    return NextResponse.json(
      {
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}