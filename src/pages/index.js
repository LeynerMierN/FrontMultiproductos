import { useMemo, useState } from "react";
import { Loader2, TriangleAlert, PackageSearch } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { PromoBar } from "@/components/shop/PromoBar";
import { Header } from "@/components/shop/Header";
import { Hero } from "@/components/shop/Hero";
import { FeaturedRow } from "@/components/shop/FeaturedRow";
import { Perks } from "@/components/shop/Perks";
import { HowItWorks } from "@/components/shop/HowItWorks";
import { Testimonials } from "@/components/shop/Testimonials";
import { Faq } from "@/components/shop/Faq";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "in", label: "Disponibles" },
  { id: "low", label: "Pocas unidades" },
  { id: "out", label: "Agotados" },
];

const SORTS = [
  { id: "new", label: "Novedades" },
  { id: "asc", label: "Precio: menor a mayor" },
  { id: "desc", label: "Precio: mayor a menor" },
  { id: "name", label: "Nombre A–Z" },
];

export default function Home() {
  const { products, loading, error } = useProducts();
  const cart = useCart(products);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");

  function goCatalog(next) {
    if (next === "new") {
      setFilter("all");
      setSort("new");
    } else {
      setFilter(next);
    }
    document
      .getElementById("catalogo")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = term
      ? products.filter((p) =>
          String(p.nombre || "").toLowerCase().includes(term)
        )
      : [...products];
    if (filter === "in") list = list.filter((p) => (p.cantidad ?? 0) > 5);
    if (filter === "low")
      list = list.filter((p) => (p.cantidad ?? 0) > 0 && (p.cantidad ?? 0) <= 5);
    if (filter === "out") list = list.filter((p) => (p.cantidad ?? 0) <= 0);
    if (sort === "asc") list.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    if (sort === "desc") list.sort((a, b) => (b.precio || 0) - (a.precio || 0));
    if (sort === "name")
      list.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    return list;
  }, [products, q, filter, sort]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <PromoBar />
      <Header
        q={q}
        setQ={setQ}
        cartCount={cart.count}
        onCartOpen={() => cart.setOpen(true)}
      />
      <Hero count={products.length} onSelectTile={goCatalog} />
      <FeaturedRow products={products} loading={loading} onAdd={cart.add} />

      <main id="catalogo" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Catálogo completo
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">
          Explora todos los artículos
        </h2>

        {error && (
          <div className="mb-6 mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <TriangleAlert className="h-5 w-5 shrink-0" />
            <p>
              <b>Firestore no conectado:</b> {error}. Revisa{" "}
              <code className="rounded bg-amber-900/10 px-1 font-mono">.env.local</code> con
              variables <code className="rounded bg-amber-900/10 px-1 font-mono">NEXT_PUBLIC_FIREBASE_*</code> y
              reinicia el servidor.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "default" : "secondary"}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="ml-auto h-8 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="flex items-center gap-2 py-16 text-sm text-neutral-500">
              <Loader2 className="animate-spin" /> Cargando catálogo…
            </p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
              <PackageSearch className="h-8 w-8 text-neutral-300" />
              <p className="font-semibold">Sin resultados</p>
              <p className="text-sm text-neutral-500">
                Prueba con otra búsqueda o filtro.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} onAdd={cart.add} />
              ))}
            </div>
          )}
        </div>
      </main>

      <div className="mt-12">
        <Perks />
      </div>
      <HowItWorks />
      <Testimonials />
      <Faq />

      <Footer />

      <CartDrawer
        open={cart.open}
        onClose={() => cart.setOpen(false)}
        items={cart.items}
        total={cart.total}
        setQty={cart.setQty}
        remove={cart.remove}
        clear={cart.clear}
      />
    </div>
  );
}
