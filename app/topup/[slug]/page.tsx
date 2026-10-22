import { createClient } from "@/lib/supabase/server";
import TopUpForm from "./TopUpForm";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TopUpPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // ==========================================
  // GET GAME
  // ==========================================

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (gameError || !game) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">
          Game tidak ditemukan
        </h1>
      </main>
    );
  }

  // ==========================================
  // GET GAME FIELDS
  // ==========================================

  const { data: fields, error: fieldsError } = await supabase
    .from("game_fields")
    .select("id, field_name, field_key")
    .eq("game_id", game.id);

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, nominal, currency, price"
    )
    .eq("game_id", game.id)
    .eq("status", "active")
    .order("price", { ascending: true });

  // ==========================================
  // ERROR
  // ==========================================

  if (fieldsError || productsError) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold">
            Gagal mengambil data
          </h1>

          {fieldsError && (
            <p className="mt-2 text-red-500">
              Fields: {fieldsError.message}
            </p>
          )}

          {productsError && (
            <p className="mt-2 text-red-500">
              Products: {productsError.message}
            </p>
          )}
        </div>
      </main>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">
        {game.name}
      </h1>

      <p className="mt-3 text-gray-500">
        {game.description}
      </p>

      <TopUpForm
        fields={fields ?? []}
        products={products ?? []}
      />
    </main>
  );
}