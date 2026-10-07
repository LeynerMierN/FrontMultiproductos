import { useState } from "react";
import { Minus, Plus, ShoppingBag, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { genderLabel, subcategoryLabel } from "@/config/site";

function stockMeta(cantidad) {
  if (cantidad <= 0) return { tone: "red", label: "Agotado" };
  if (cantidad <= 5) return { tone: "amber", label: "Pocas unidades" };
  return { tone: "green", label: "Disponible" };
}

export function ProductCard({ p, onAdd }) {
  const [qty, setQty] = useState(1);
  const meta = stockMeta(p.cantidad ?? 0);
  const out = (p.cantidad ?? 0) <= 0;

  return (
    <article className="group flex flex-col overflow-hidden border border-charcoal/10 bg-paper shadow-soft transition-shadow duration-300 hover:shadow-lift">
      <div className="relative aspect-square bg-parchment">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.nombre}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-8 w-8 text-neutral-300" />
          </div>
        )}
        <span className="absolute left-2 top-2">
          <Badge tone={meta.tone} className="rounded-none text-[11px] uppercase tracking-wide">
            {meta.label} · {p.cantidad ?? 0}
          </Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="font-display text-base font-semibold leading-tight">
          {formatPrice(p.precio)}
        </p>
        <h3 className="truncate text-sm text-neutral-600">{p.nombre}</h3>
        {(p.gender || p.subcategory) && (
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">
            {[genderLabel(p.gender), subcategoryLabel(p.subcategory)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <div className="flex items-center border border-charcoal">
            <button
              className="flex h-8 w-8 items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              disabled={out}
              aria-label="Disminuir"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
            <button
              className="flex h-8 w-8 items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
              onClick={() =>
                setQty((v) => Math.min(p.cantidad || 99, v + 1))
              }
              disabled={out}
              aria-label="Aumentar"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button
            size="sm"
            className="flex-1"
            disabled={out}
            onClick={() => onAdd(p.id, qty)}
          >
            {out ? "Agotado" : "Añadir"} <ShoppingBag />
          </Button>
        </div>
      </div>
    </article>
  );
}
