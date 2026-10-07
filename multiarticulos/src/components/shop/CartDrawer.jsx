import { X, Minus, Plus, Trash2, ShoppingBag, Loader2, LogIn, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/config/site";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/auth";

export function CartDrawer({ open, onClose, items, total, setQty, remove }) {
  const { user, profile, signIn } = useAuth();
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  useEffect(() => {
    if (open) {
      setFormError("");
      setBuyerEmail(profile?.email || user?.email || "");
    }
  }, [open, user, profile]);

  if (!open) return null;

  async function payWithMercadoPago() {
    setFormError("");
    if (!user) {
      setFormError("Ingresa con Google para pagar.");
      return;
    }
    if (items.length === 0) return;
    setSending(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Sesión inválida. Vuelve a ingresar.");
      const res = await fetch("/api/mp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          idToken: token,
          buyerEmail,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.initPoint) throw new Error(data.error || "No se pudo iniciar el pago.");
      window.location.href = data.initPoint; // checkout de Mercado Pago
    } catch (e) {
      setFormError(e.message || "No se pudo iniciar el pago.");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-lift">
        <div className="flex items-center gap-2 border-b-2 border-charcoal px-5 py-4">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold tracking-wide">Tu carrito · {items.length} artículos</h2>
          <button
            onClick={onClose}
            className="ml-auto p-2 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              Tu carrito está vacío. Agrega artículos del catálogo.
            </p>
          ) : (
            <ul className="grid gap-3">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex gap-3 border border-neutral-200 p-3"
                >
                  {i.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.imageUrl}
                      alt={i.nombre}
                      className="h-14 w-14 object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 bg-neutral-100" />
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
                        className="flex h-7 w-7 items-center justify-center border border-charcoal hover:bg-parchment"
                        aria-label="Quitar uno"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold">{i.qty}</span>
                      <button
                        onClick={() =>
                          setQty(i.id, Math.min(i.cantidad || 99, i.qty + 1))
                        }
                        className="flex h-7 w-7 items-center justify-center border border-charcoal hover:bg-parchment"
                        aria-label="Agregar uno"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => remove(i.id)}
                        className="ml-auto p-1.5 text-red-600 hover:bg-red-50"
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

        {items.length > 0 && (
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
                  <div className="mt-1.5 h-1.5 overflow-hidden bg-parchment">
                    <div
                      className="h-full bg-sand transition-all"
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

            {!user ? (
              <Button
                className="mt-3 w-full"
                size="lg"
                onClick={() => signIn().catch((e) => setFormError(e.message))}
              >
                <LogIn /> Ingresar con Google para pagar
              </Button>
            ) : (
              <>
                <div className="mt-3 grid gap-1.5">
                  <Label htmlFor="buyerEmail">Email para el comprobante</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </div>
                {formError && (
                  <p className="mt-2 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {formError}
                  </p>
                )}
                <Button
                  className="mt-3 w-full"
                  size="lg"
                  onClick={payWithMercadoPago}
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Lock />
                  )}
                  {sending ? "Conectando…" : "Pagar con Mercado Pago"}
                </Button>
              </>
            )}
            <p className="mt-2 text-center text-[11px] text-neutral-500">
              Pago seguro · Serás redirigido a Mercado Pago
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
