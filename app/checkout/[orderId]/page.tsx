"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type OrderData = {
  orderId: string;
  orderNumber: string;
  productName: string;
  gameData: Record<string, string>;
  total: number;
  status: string;
  customerWhatsapp: string | null;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/orders/${orderId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengambil pesanan");
        }

        setOrder(data.order);
      } catch (err) {
        console.error("FETCH ORDER ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil pesanan"
        );
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-gray-400">
            Memuat pesanan...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !order) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl">

          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <h1 className="text-xl font-semibold text-red-400">
              Pesanan Tidak Ditemukan
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {error || "Pesanan tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/topup/free-fire")}
              className="mt-5 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Kembali ke Top Up
            </button>
          </div>

        </div>
      </main>
    );
  }

  // =========================
  // CHECKOUT
  // =========================

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold">
          Checkout
        </h1>

        <p className="mt-2 text-gray-400">
          Periksa kembali pesanan kamu sebelum melanjutkan pembayaran.
        </p>

        {/* ORDER */}
        <section className="mt-8 rounded-2xl border border-gray-800 bg-zinc-950 p-6">

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Detail Pesanan
            </h2>

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {order.status || "Menunggu Pembayaran"}
            </span>
          </div>

          <div className="mt-6 space-y-5">

            {/* ORDER ID */}

            <div>
              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="mt-1 break-all font-mono text-sm">
                {order.orderId}
              </p>
            </div>

            {/* ORDER NUMBER */}

            <div>
              <p className="text-sm text-gray-500">
                Nomor Pesanan
              </p>

              <p className="mt-1 font-semibold">
                {order.orderNumber}
              </p>
            </div>

            {/* PRODUCT */}

            <div>
              <p className="text-sm text-gray-500">
                Produk
              </p>

              <p className="mt-1 font-semibold">
                {order.productName}
              </p>
            </div>

            {/* GAME DATA */}

            {Object.entries(order.gameData || {}).map(
              ([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-500">
                    {key === "user_id"
                      ? "User ID"
                      : key}
                  </p>

                  <p className="mt-1 font-semibold">
                    {value}
                  </p>
                </div>
              )
            )}

            {/* WHATSAPP */}

            {order.customerWhatsapp && (
              <div>
                <p className="text-sm text-gray-500">
                  WhatsApp
                </p>

                <p className="mt-1 font-semibold">
                  {order.customerWhatsapp}
                </p>
              </div>
            )}

            {/* TOTAL */}

            <div className="border-t border-gray-800 pt-5">

              <p className="text-sm text-gray-500">
                Total Pembayaran
              </p>

              <p className="mt-1 text-3xl font-bold">
                Rp{Number(order.total).toLocaleString("id-ID")}
              </p>

            </div>

          </div>
        </section>

        {/* PAYMENT */}

        <section className="mt-6 rounded-2xl border border-gray-800 bg-zinc-950 p-6">

          <h2 className="text-xl font-semibold">
            Metode Pembayaran
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Pilih metode pembayaran yang ingin digunakan.
          </p>

          <div className="mt-5 space-y-3">

            <button
              type="button"
              className="w-full rounded-xl border border-gray-700 p-4 text-left transition hover:border-white"
            >
              <p className="font-semibold">
                QRIS
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Bayar menggunakan semua aplikasi pembayaran yang mendukung QRIS.
              </p>
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-gray-700 p-4 text-left transition hover:border-white"
            >
              <p className="font-semibold">
                E-Wallet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                DANA, GoPay, OVO, dan lainnya.
              </p>
            </button>

          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-gray-200"
            onClick={() => {
              alert("Payment gateway belum dihubungkan.");
            }}
          >
            Bayar Sekarang
          </button>

        </section>

      </div>
    </main>
  );
}