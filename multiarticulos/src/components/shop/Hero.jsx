import { ArrowRight, Sparkles, PackageCheck, Flame, LayoutGrid } from "lucide-react";
import { HERO } from "@/config/site";
import { Button } from "@/components/ui/button";

const TILES = [
  { id: "all", label: "Ver todo", sub: "Catálogo completo", icon: LayoutGrid },
  { id: "new", label: "Novedades", sub: "Recién llegados", icon: Sparkles },
  { id: "in", label: "Disponibles", sub: "Con buen stock", icon: PackageCheck },
  { id: "low", label: "Últimas unidades", sub: "¡Se agotan!", icon: Flame },
];

export function Hero({ count, onSelectTile }) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 md:pb-12 md:pt-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          {HERO.eyebrow} · {count} artículos
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          {HERO.title}
        </h1>
        <p className="mt-3 max-w-lg text-[15px] text-neutral-600">
          {HERO.subtitle}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={HERO.primaryCta.href}>
            <Button>
              {HERO.primaryCta.label} <ArrowRight />
            </Button>
          </a>
          <a href={HERO.secondaryCta.href}>
            <Button variant="secondary">{HERO.secondaryCta.label}</Button>
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {TILES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTile(t.id)}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                <t.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-bold">{t.label}</span>
                <span className="block text-xs text-neutral-500">{t.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
