import { createFileRoute } from "@tanstack/react-router";
import { DungeonGame } from "@/components/DungeonGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Super Jack — em busca de Jean" },
      {
        name: "description",
        content: "Jogo de plataforma com 5 fases: ajude Jack a encontrar o amor da sua vida, Jean.",
      },
      { property: "og:title", content: "Super Jack" },
      { property: "og:description", content: "5 fases de plataforma até o amor da vida de Jack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <h1 className="font-pixel text-center text-2xl text-primary md:text-3xl">SUPER JACK</h1>
      <DungeonGame />
    </main>
  );
}
