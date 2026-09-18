import { useState } from "react";
import { Minus, Plus, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { deleteProductImage } from "@/lib/storage";
import { formatPrice } from "@/lib/utils";

function Row({ p, onQty, onDelete, onPrice, onStock }) {
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState(String(p.precio ?? 0));
  const [editing, setEditing] = useState(false);

  async function wrap(fn) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
      {p.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.imageUrl}
          alt={p.nombre}
          className="h-12 w-12 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
          <Package className="h-5 w-5 text-neutral-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{p.nombre}</p>
        {editing ? (
          <div className="mt-1 flex items-center gap-1.5">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-8 max-w-28"
            />
            <Button
              size="iconSm"
              onClick={() =>
                wrap(async () => {
                  await onPrice(p.id, price);
                  setEditing(false);
                })
              }
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : "OK"}
            </Button>
            <Button
              size="iconSm"
              variant="secondary"
              onClick={() => {
                setEditing(false);
                setPrice(String(p.precio ?? 0));
              }}
            >
              ✕
            </Button>
          </div>
        ) : (
          <button
            onClick={() => {
              setPrice(String(p.precio ?? 0));
              setEditing(true);
            }}
            className="mt-0.5 text-sm font-bold hover:underline"
            title="Clic para editar precio"
          >
            {formatPrice(p.precio)}
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="iconSm"
          variant="secondary"
          onClick={() => wrap(() => onQty(p.id, -1))}
          disabled={busy}
          aria-label="Disminuir stock"
        >
          <Minus />
        </Button>
        <span className="w-8 text-center text-sm font-bold">{p.cantidad ?? 0}</span>
        <Button
          size="iconSm"
          variant="secondary"
          onClick={() => wrap(() => onQty(p.id, 1))}
          disabled={busy}
          aria-label="Aumentar stock"
        >
          <Plus />
        </Button>
      </div>
      <Button
        size="iconSm"
        variant="destructive"
        onClick={() =>
          wrap(async () => {
            if (confirm(`¿Borrar "${p.nombre}"?`)) {
              if (p.imageUrl) await deleteProductImage(p.imageUrl);
              await onDelete(p.id);
            }
          })
        }
        disabled={busy}
        aria-label="Borrar"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export function AdminList({ products, loading, onQty, onDelete, onPrice, onStock }) {
  if (loading)
    return (
      <Card>
        <CardContent className="flex items-center gap-2 p-6 text-sm text-neutral-500">
          <Loader2 className="animate-spin" /> Cargando…
        </CardContent>
      </Card>
    );
  if (!products.length)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-neutral-500">
          Sin artículos aún. Agrega el primero con el formulario.
        </CardContent>
      </Card>
    );
  return (
    <div className="grid gap-2">
      {products.map((p) => (
        <Row
          key={p.id}
          p={p}
          onQty={onQty}
          onDelete={onDelete}
          onPrice={onPrice}
          onStock={onStock}
        />
      ))}
    </div>
  );
}
