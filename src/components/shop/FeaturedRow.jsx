import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";

export function FeaturedRow({ products, loading, onAdd }) {
  const featured = products.filter((p) => (p.cantidad ?? 0) > 0).slice(0, 8);
  if (!loading && featured.length === 0) return null;
  return (
    <section id="destacados" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Los favoritos
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Destacados</h2>
        </div>
        <a
          href="#catalogo"
          className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Ver todo →
        </a>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 py-8 text-sm text-neutral-500">
          <Loader2 className="animate-spin" /> Cargando destacados…
        </p>
      ) : (
        <div className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {featured.map((p) => (
            <div
              key={p.id}
              className="w-56 shrink-0 snap-start sm:w-64"
            >
              <ProductCard p={p} onAdd={onAdd} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
