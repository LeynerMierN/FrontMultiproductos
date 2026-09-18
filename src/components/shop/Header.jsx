import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { whatsappLink } from "@/config/site";

export function Header({ q, setQ, cartCount, onCartOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
            <Store className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight">
              Vestiq
            </span>
            <span className="block text-[11px] text-neutral-500">
              Tu tienda en un solo lugar
            </span>
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-sm md:block">
          <Input
            placeholder="Buscar artículos…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onCartOpen} size="sm" className="relative">
            <ShoppingBag /> Carrito
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-neutral-900">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      <nav className="border-t border-neutral-100">
        <div className="no-scrollbar mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 py-2 text-[13px] font-medium text-neutral-600">
          <a href="#catalogo" className="whitespace-nowrap hover:text-neutral-900">
            Catálogo
          </a>
          <a href="#destacados" className="whitespace-nowrap hover:text-neutral-900">
            Destacados
          </a>
          <a href="#faq" className="whitespace-nowrap hover:text-neutral-900">
            Preguntas
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap hover:text-neutral-900"
          >
            Contáctanos
          </a>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <Input
          placeholder="Buscar artículos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
    </header>
  );
}
