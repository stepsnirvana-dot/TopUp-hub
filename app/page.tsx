"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Game = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getGames() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("games")
        .select("id, name, slug, description")
        .eq("status", "active")
        .order("name");

      if (error) {
        setError(error.message);
        return;
      }

      setGames(data ?? []);
    }

    getGames();
  }, []);

  return (
    <main className="min-h-screen p-10">
      <h1 className="mb-6 text-3xl font-bold">
        TopUpHub
      </h1>

      {error && (
        <p className="text-red-500">
          Error: {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="rounded-xl border p-5"
          >
            <h2 className="text-xl font-semibold">
              {game.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {game.description}
            </p>

            <p className="mt-3 text-xs">
              /{game.slug}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}