// POST /api/mp/reconcile { reference, idToken } — solo admin.
// Devuelve el estado canónico + consulta EN VIVO el pago en Mercado Pago
// (fuente autoritativa). Nunca cambia estados por sí misma.
import { MercadoPagoConfig, Payment } from "mercadopago";
import { adminDb, adminAuth } from "@/lib/server/firebaseAdmin";
import { getMpConfig, mapMpStatus } from "@/lib/server/mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }
  let cfg;
  try {
    cfg = getMpConfig();
  } catch (e) {
    return res.status(500).json({ error: "Pagos no disponibles por configuración." });
  }
  try {
    const { reference, idToken } = req.body || {};
    if (!reference || !idToken) {
      return res.status(400).json({ error: "Datos incompletos." });
    }
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ error: "Sesión inválida." });
    }

    const db = adminDb();
    const me = await db.collection("users").doc(decoded.uid).get();
    if (!me.exists || me.data().role !== "admin") {
      return res.status(403).json({ error: "Solo administradores." });
    }

    const snap = await db.collection("orders").doc(String(reference)).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }
    const o = snap.data();

    // Consulta autoritativa a Mercado Pago si hay pago asociado.
    let live = null;
    if (o.mp?.paymentId) {
      try {
        const p = await new Payment(
          new MercadoPagoConfig({ accessToken: cfg.accessToken })
        ).get({ id: o.mp.paymentId });
        live = {
          id: String(p.id),
          status: p.status,
          statusDetail: p.status_detail || null,
          amount: p.transaction_amount,
          currency: p.currency_id,
          liveMode: p.live_mode !== false,
          mapped: mapMpStatus(p.status, p.status_detail),
        };
      } catch (e) {
        live = { error: "No se pudo consultar el pago en Mercado Pago." };
      }
    }

    return res.status(200).json({
      reference: o.reference,
      status: o.status,
      total: o.total,
      currency: o.currency,
      environment: o.environment || "unknown",
      buyerEmail: o.buyerEmail,
      paidAt: o.paidAt || null,
      lastWebhookAt: o.lastWebhookAt || null,
      webhookAttempts: o.webhookAttempts || 0,
      transactionsSeen: (o.processedTx || []).length,
      mp: {
        preferenceId: o.mp?.preferenceId || null,
        paymentId: o.mp?.paymentId || null,
        status: o.mp?.status || null,
        statusDetail: o.mp?.statusDetail || null,
      },
      live,
      diverges: Boolean(live && !live.error && live.mapped !== o.status),
      statusHistory: o.statusHistory || [],
      checklist: [
        "Si live.mapped difiere de status y el webhook no llegó: revisa notification_url pública y firma en logs.",
        "live_mode debe coincidir con el entorno (test vs production).",
        "Esta herramienta no cambia estados.",
      ],
    });
  } catch (e) {
    console.error("mp reconcile:", e.message);
    return res.status(500).json({ error: "No se pudo conciliar." });
  }
}
