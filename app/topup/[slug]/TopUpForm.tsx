"use client";

import { useState } from "react";

type Field = {
  id: string;
  field_name: string;
  field_key: string;
};

type Product = {
  id: string;
  name: string;
  nominal: number;
  currency: string;
  price: number;
};

type TopUpFormProps = {
  fields: Field[];
  products: Product[];
};

export default function TopUpForm({
  fields,
  products,
}: TopUpFormProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [formData, setFormData] = useState<Record<string, string>>({});

  const [whatsapp, setWhatsapp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(fieldKey: string, value: string) {
    setFormData((prev: Record<string, string>) => ({
      ...prev,
      [fieldKey]: value,
    }));
  }

  async function handleSubmit() {
    setError("");

    // =============================
    // VALIDASI PRODUK
    // =============================

    if (!selectedProduct) {
      setError("Silakan pilih nominal terlebih dahulu.");
      return;
    }

    // =============================
    // VALIDASI DATA AKUN
    // =============================

    const emptyField = fields.find(
      (field) => !formData[field.field_key]?.trim()
    );

    if (emptyField) {
      setError(`Silakan isi ${emptyField.field_name} terlebih dahulu.`);
      return;
    }

    // =============================
    // VALIDASI WHATSAPP
    // =============================

    const cleanedWhatsapp = whatsapp.trim();
    const waRegex = /^(08|628)[0-9]{8,13}$/;

    if (!cleanedWhatsapp) {
      setError("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!waRegex.test(cleanedWhatsapp)) {
      setError("Format nomor WhatsApp tidak valid. Contoh: 081234567890");
      return;
    }

    try {
      setLoading(true);

      // =============================
      // CREATE ORDER
      // =============================

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          gameData: formData,
          total: selectedProduct.price,
          customerWhatsapp: cleanedWhatsapp,
        }),
      });

      const result = await response.json();

      // =============================
      // HANDLE ERROR
      // =============================

      if (!response.ok) {
        throw new Error(
          result?.error?.message || result?.error || "Gagal membuat pesanan."
        );
      }

      // =============================
      // ORDER BERHASIL
      // =============================

      console.log("ORDER BERHASIL:", result);

      if (!result?.success || !result?.orderId) {
        throw new Error(
          "Order berhasil dibuat tetapi Order ID tidak ditemukan."
        );
      }

      // =============================
      // SIMPAN DATA CHECKOUT
      // =============================

      localStorage.setItem(
        "checkout_order",
        JSON.stringify({
          orderId: result.orderId,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          gameData: formData,
          total: selectedProduct.price,
        })
      );

      // =============================
      // REDIRECT KE CHECKOUT
      // =============================

      window.location.href = `/checkout/${result.orderId}`;
    } catch (err) {
      console.error("ORDER ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan."
      );

      setLoading(false);
    }
  }

  return (
    <div className="mt-10">
      {/* ============================= */}
      {/* ACCOUNT FIELDS */}
      {/* ============================= */}

      <section>
        <h2 className="text-2xl font-semibold">Masukkan Data Akun</h2>

        <div className="mt-5 max-w-md space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="mb-2 block font-medium">
                {field.field_name}
              </label>

              <input
                type="text"
                value={formData[field.field_key] ?? ""}
                onChange={(e) => handleChange(field.field_key, e.target.value)}
                placeholder={`Masukkan ${field.field_name}`}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============================= */}
      {/* CONTACT */}
      {/* ============================= */}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Kontak</h2>

        <div className="mt-5 max-w-md">
          <label className="mb-2 block font-medium">Nomor WhatsApp</label>

          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="081234567890"
            className="w-full rounded-lg border px-4 py-3"
          />

          <p className="mt-2 text-sm text-gray-500">
            Digunakan untuk mengirim status &amp; bukti pesanan kamu.
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* PRODUCTS */}
      {/* ============================= */}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Pilih Nominal</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const isSelected = selectedProduct?.id === product.id;

            return (
              <button
                key={product.id}
                type="button"
                disabled={loading}
                onClick={() => {
                  setSelectedProduct(product);
                  setError("");
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  isSelected
                    ? "border-white ring-2 ring-white"
                    : "hover:border-gray-400"
                } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <h3 className="text-lg font-semibold">{product.name}</h3>

                <p className="mt-2 text-sm text-gray-500">
                  {product.nominal} {product.currency}
                </p>

                <p className="mt-4 text-xl font-bold">
                  Rp{product.price.toLocaleString("id-ID")}
                </p>

                {isSelected && (
                  <p className="mt-3 text-sm font-semibold">✓ Dipilih</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================= */}
      {/* SUMMARY */}
      {/* ============================= */}

      {selectedProduct && (
        <section className="mt-10 max-w-md rounded-xl border p-5">
          <h2 className="text-xl font-semibold">Pesanan</h2>

          <div className="mt-4">
            <p className="text-gray-500">Produk</p>

            <p className="font-semibold">{selectedProduct.name}</p>
          </div>

          <div className="mt-4">
            <p className="text-gray-500">Total</p>

            <p className="text-2xl font-bold">
              Rp{selectedProduct.price.toLocaleString("id-ID")}
            </p>
          </div>

          {/* ============================= */}
          {/* ERROR */}
          {/* ============================= */}

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ============================= */}
          {/* BUTTON */}
          {/* ============================= */}

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="mt-5 w-full rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Membuat Pesanan..." : "Lanjutkan"}
          </button>
        </section>
      )}
    </div>
  );
}