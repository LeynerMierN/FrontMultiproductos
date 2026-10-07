import { useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";

export function FeaturedRow({ products, loading, onAdd }) {
  const trackRef = useRef(null);
  const featured = products.filter((p) => (p.cantidad ?? 0) > 0).slice(0, 8);
  if (!loading && featured.length === 0) return null;

  function scrollBy(dir) {
    trackRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });
  }

  return (
    <section id="destacados" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Novedades
        </h2>
        <div className="flex items-center gap-2">
          <a
            href="#catalogo"
            className="font-display mr-2 text-sm font-semibold tracking-wider hover:underline"
          >
            Ver todo →
          </a>
          <button
            onClick={() => scrollBy(-1)}
            className="flex h-10 w-10 items-center justify-center border border-charcoal hover:bg-charcoal hover:text-cream"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="flex h-10 w-10 items-center justify-center border border-charcoal hover:bg-charcoal hover:text-cream"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 py-8 text-sm text-neutral-500">
          <Loader2 className="animate-spin" /> Cargando novedades…
        </p>
      ) : (
        <div
          ref={trackRef}
          className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
        >
          {featured.map((p) => (
            <div
              key={p.id}
              className="w-60 shrink-0 snap-start sm:w-72"
            >
              <ProductCard p={p} onAdd={onAdd} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
