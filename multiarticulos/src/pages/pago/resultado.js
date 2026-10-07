import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { doc, onSnapshot } from "firebase/firestore";
import { Loader2, CheckCircle2, XCircle, Clock, Ban, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { PromoBar } from "@/components/shop/PromoBar";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const STATES = {
  paid: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    title: "¡Pago aprobado!",
    text: "Tu pedido quedó confirmado. Te contactaremos para coordinar la entrega.",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    title: "Pago rechazado",
    text: "El banco o Mercado Pago rechazó la transacción. Puedes intentarlo de nuevo con otro medio.",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    title: "Pago pendiente",
    text: "Estamos esperando la confirmación de Mercado Pago. Esta página se actualiza sola.",
  },
  cancelled: {
    icon: Ban,
    color: "text-neutral-500",
    title: "Compra cancelada",
    text: "Cancelaste esta orden antes de pagar. Tu carrito sigue intacto.",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-600",
    title: "Ocurrió un error",
    text: "Algo falló procesando el pago. Intenta de nuevo o contáctanos.",
  },
};

export default function Resultado() {
  const router = useRouter();
  const { ref } = router.query;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Solo se usa `ref` de la URL para buscar la orden.
  // El ESTADO siempre viene de Firestore (lo escribe el webhook, no el navegador).
  useEffect(() => {
    if (!ref || !db) return;
    const unsub = onSnapshot(
      doc(db, "orders", String(ref)),
      (snap) => {
        setOrder(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      () => {
        setDenied(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [ref]);

  async function cancelOrder() {
    if (!user || !ref) return;
    setCancelling(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/mp/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref, idToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) alert(data.error || "No se pudo cancelar.");
    } catch {
      alert("No se pudo cancelar.");
    } finally {
      setCancelling(false);
    }
  }

  const meta = STATES[order?.status] || null;
  const Icon = meta?.icon || Clock;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <PromoBar />
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="font-display text-xs font-semibold tracking-[0.25em] text-neutral-500">
          Resultado del pago
        </p>
        {!ref ? (
          <h1 className="font-display mt-2 text-3xl font-bold">
            Sin referencia
          </h1>
        ) : loading ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="animate-spin" /> Consultando tu orden…
          </p>
        ) : denied ? (
          <div className="mt-6 border border-neutral-900 p-6 text-center">
            <p className="font-display text-xl font-bold">Orden privada</p>
            <p className="mt-1 text-sm text-neutral-600">
              Inicia sesión con la cuenta que hizo la compra para verla.
            </p>
            <Link href="/" className="mt-4 inline-block">
              <Button size="sm">Volver a la tienda</Button>
            </Link>
          </div>
        ) : !order ? (
          <div className="mt-6 border border-neutral-900 p-6 text-center">
            <p className="font-display text-xl font-bold">Orden no encontrada</p>
            <p className="mt-1 text-sm text-neutral-600">
              Referencia <b>{ref}</b> no existe en Vestiq.
            </p>
            <Link href="/" className="mt-4 inline-block">
              <Button size="sm">Volver a la tienda</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 border-2 border-charcoal bg-paper">
            <div className="border-b border-neutral-200 p-6 text-center">
              <Icon className={`mx-auto h-10 w-10 ${meta.color}`} />
              <h1 className="font-display mt-2 text-3xl font-bold">{meta.title}</h1>
              <p className="mt-1 text-sm text-neutral-600">{meta.text}</p>
            </div>
            <dl className="grid gap-px bg-charcoal/10 text-sm">
              <div className="flex justify-between bg-paper px-5 py-3">
                <dt className="text-neutral-500">Referencia</dt>
                <dd className="font-mono font-bold">{order.reference}</dd>
              </div>
              <div className="flex justify-between bg-paper px-5 py-3">
                <dt className="text-neutral-500">Estado</dt>
                <dd className="font-display font-semibold uppercase">{order.status}</dd>
              </div>
              <div className="flex justify-between bg-paper px-5 py-3">
                <dt className="text-neutral-500">Total</dt>
                <dd className="font-bold">
                  {formatPrice(order.total)} {order.currency}
                </dd>
              </div>
              <div className="flex justify-between bg-paper px-5 py-3">
                <dt className="text-neutral-500">Artículos</dt>
                <dd className="text-right">
                  {(order.items || []).map((i) => (
                    <span key={i.id} className="block">
                      {i.qty} × {i.nombre}
                    </span>
                  ))}
                </dd>
              </div>
              {order.mp?.paymentId && (
                <div className="flex justify-between bg-paper px-5 py-3">
                  <dt className="text-neutral-500">Pago Mercado Pago</dt>
                  <dd className="font-mono text-xs">{order.mp.paymentId}</dd>
                </div>
              )}
            </dl>
            <div className="flex flex-wrap gap-2 p-5">
              <Link href="/">
                <Button size="sm" variant="secondary">
                  Seguir comprando
                </Button>
              </Link>
              {order.status === "pending" && user && (
                <Button size="sm" variant="ghost" disabled={cancelling} onClick={cancelOrder}>
                  {cancelling ? "Cancelando…" : "Cancelar compra"}
                </Button>
              )}
              {(order.status === "rejected" || order.status === "error") && (
                <Link href="/">
                  <Button size="sm">Intentar de nuevo</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
