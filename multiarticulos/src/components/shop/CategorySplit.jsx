import { ArrowRight } from "lucide-react";
import { CATEGORY_IMAGES } from "@/config/site";

// Split-screen 50/50 Mujer/Hombre con imagen de fondo y zoom suave al hover.
// Pega las URLs en CATEGORY_IMAGES (site.js); vacío = degradado editorial.
const HALVES = [
  {
    id: "mujer",
    label: "Mujer",
    sub: "Fragancias · Moda · Calzado",
    fallback:
      "bg-[radial-gradient(100%_100%_at_30%_20%,#6b5636_0%,#1c1c1e_65%)]",
  },
  {
    id: "hombre",
    label: "Hombre",
    sub: "Fragancias · Moda · Calzado",
    fallback:
      "bg-[radial-gradient(100%_100%_at_70%_20%,#43434b_0%,#1c1c1e_65%)]",
  },
];

export function CategorySplit({ counts = {}, onSelect }) {
  return (
    <section id="categorias" className="scroll-mt-24">
      <div className="grid md:grid-cols-2">
        {HALVES.map((h) => {
          const img = CATEGORY_IMAGES[h.id];
          return (
            <button
              key={h.id}
              onClick={() => onSelect(h.id, "all")}
              className="group relative block h-[62svh] min-h-[420px] overflow-hidden text-left md:h-[78vh]"
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={`Categoría ${h.label}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div
                  className={`absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 ${h.fallback}`}
                />
              )}
              <div className="absolute inset-0 bg-charcoal/45 transition-colors duration-500 group-hover:bg-charcoal/30" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-cream md:p-12">
                <p className="font-display text-xs font-semibold tracking-[0.3em] text-sand">
                  {counts[h.id] ?? 0} artículos
                </p>
                <p className="font-display mt-2 text-5xl font-bold leading-none md:text-7xl">
                  {h.label}
                </p>
                <p className="mt-2 text-sm text-cream/75">{h.sub}</p>
                <span className="font-display mt-4 inline-flex items-center gap-2 border border-cream/60 px-5 py-2.5 text-sm font-semibold tracking-wider transition-colors group-hover:border-sand group-hover:bg-sand group-hover:text-charcoal">
                  Explorar <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
