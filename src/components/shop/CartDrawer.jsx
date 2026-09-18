import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/config/site";

export function CartDrawer({ open, onClose, items, total, setQty, remove, clear }) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function checkout() {
    setSending(true);
    try {
      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, "pedidos"), {
          items: items.map((i) => ({
            id: i.id,
            nombre: i.nombre,
            precio: Number(i.precio),
            qty: i.qty,
            subtotal: i.subtotal,
          })),
          total,
          createdAt: serverTimestamp(),
        });
      }
      setDone(true);
      clear();
    } catch (e) {
      alert(e.message || "No se pudo registrar el pedido");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-base font-bold">Tu carrito</h2>
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-2 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {done ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center">
              <p className="text-lg font-bold text-emerald-800">
                ¡Pedido registrado!
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Lo verás en la colección “pedidos” de Firestore. Te
                contactaremos para coordinar la entrega.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setDone(false);
                  onClose();
                }}
              >
                Seguir comprando
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              Tu carrito está vacío. Agrega artículos del catálogo.
            </p>
          ) : (
            <ul className="grid gap-3">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex gap-3 rounded-2xl border border-neutral-200 p-3"
                >
                  {i.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.imageUrl}
                      alt={i.nombre}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-neutral-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.nombre}</p>
                    <p className="text-sm text-neutral-600">
                      {formatPrice(i.precio)} · Subtotal{" "}
                      <b>{formatPrice(i.subtotal)}</b>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(i.id, i.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border hover:bg-neutral-50"
                        aria-label="Quitar uno"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold">{i.qty}</span>
                      <button
                        onClick={() =>
                          setQty(i.id, Math.min(i.cantidad || 99, i.qty + 1))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border hover:bg-neutral-50"
                        aria-label="Agregar uno"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => remove(i.id)}
                        className="ml-auto rounded-full p-1.5 text-red-600 hover:bg-red-50"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!done && items.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-4">
            {(() => {
              const missing = FREE_SHIPPING_THRESHOLD - total;
              const pct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
              return (
                <div className="mb-3">
                  <p className="text-xs text-neutral-600">
                    {missing > 0 ? (
                      <>Te faltan <b>{formatPrice(missing)}</b> para el envío gratis</>
                    ) : (
                      <><b>¡Tienes envío gratis!</b> 🎉</>
                    )}
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-900 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })()}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Total</span>
              <span className="text-xl font-bold">{formatPrice(total)}</span>
            </div>
            <Button className="mt-3 w-full" size="lg" onClick={checkout} disabled={sending}>
              {sending && <Loader2 className="animate-spin" />}
              {sending ? "Registrando…" : "Finalizar pedido"}
            </Button>
            <p className="mt-2 text-center text-[11px] text-neutral-500">
              Se guarda en Firestore · colección “pedidos”
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
