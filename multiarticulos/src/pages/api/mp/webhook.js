// POST /api/mp/webhook — notificaciones server-to-server de Mercado Pago.
// Fuente de verdad: tras validar la firma se consulta el pago vía SDK
// (autenticado) y ese dato actualiza la orden. Idempotente, sin sesión.
import { MercadoPagoConfig, Payment } from "mercadopago";
import { adminDb, FieldValue } from "@/lib/server/firebaseAdmin";
import {
  getMpConfig,
  validateWebhookSignature,
  mapMpStatus,
} from "@/lib/server/mercadopago";
import { transitionAllowed } from "@/lib/server/orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  let cfg;
  try {
    cfg = getMpConfig();
  } catch (e) {
    console.error("mp webhook config:", e.message);
    return res.status(500).send("Error");
  }

  try {
    const q = req.query || {};
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const topic = q.type || body.type || "";
    const dataId = q["data.id"] || body?.data?.id || "";

    // Solo nos interesan pagos.
    if (topic && topic !== "payment") {
      return res.status(200).send("OK");
    }
    if (!dataId) {
      console.error("mp webhook: sin data.id");
      return res.status(400).send("Bad Request");
    }

    // 1. Firma HMAC (defensa en profundidad; el fetch autenticado confirma).
    const sig = validateWebhookSignature(
      {
        xSignature: req.headers["x-signature"] || "",
        xRequestId: req.headers["x-request-id"] || "",
        dataId,
      },
      cfg.webhookSecret
    );
    if (!sig.ok) {
      if (sig.reason === "no-secret") {
        console.error("mp webhook: validación HMAC no configurada, se continúa solo con fetch");
      } else {
        console.error(`mp webhook: firma inválida (${sig.reason})`);
        return res.status(401).send("Unauthorized");
      }
    }

    // 2. Dato autoritativo: el pago consultado con nuestro access token.
    const client = new MercadoPagoConfig({ accessToken: cfg.accessToken });
    let payment;
    try {
      payment = await new Payment(client).get({ id: dataId });
    } catch (e) {
      console.error("mp webhook: pago inexistente en MP");
      return res.status(200).send("OK");
    }

    const reference = payment.external_reference || "";
    if (!reference) {
      console.error("mp webhook: pago sin external_reference");
      return res.status(200).send("OK");
    }
    // Un pago real (live) jamás debe tocar una orden de pruebas y viceversa.
    const paymentIsLive = payment.live_mode !== false;
    const envIsProd = cfg.env === "production";
    if (paymentIsLive !== envIsProd) {
      console.error(`mp webhook: live_mode=${payment.live_mode} no coincide con env=${cfg.env}`);
      return res.status(200).send("OK");
    }

    const db = adminDb();
    const ref = db.collection("orders").doc(String(reference));
    const snap = await ref.get();
    if (!snap.exists) {
      console.error(`mp webhook: orden inexistente ref=${reference}`);
      return res.status(200).send("OK");
    }
    const order = snap.data();

    // 3. Monto/moneda del pago real vs orden.
    if (String(payment.currency_id) !== String(order.currency)) {
      console.error(`mp webhook: moneda distinta ref=${reference}`);
      return res.status(200).send("OK");
    }
    if (Math.round(Number(payment.transaction_amount)) !== Number(order.total)) {
      console.error(`mp webhook: monto distinto ref=${reference}`);
      return res.status(200).send("OK");
    }

    const nextStatus = mapMpStatus(payment.status, payment.status_detail);
    const paymentKey = `mp-${payment.id}`;

    const applied = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      if (!fresh.exists) return false;
      const current = fresh.data();
      if (!transitionAllowed(current.status, nextStatus)) return false;
      const seen = Array.isArray(current.processedTx) ? current.processedTx : [];
      if (seen.includes(paymentKey)) return false;

      const from = current.status;
      const update = {
        status: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
        lastWebhookAt: FieldValue.serverTimestamp(),
        webhookAttempts: FieldValue.increment(1),
        mp: {
          ...(current.mp || {}),
          paymentId: String(payment.id),
          preferenceId: payment.preference_id || current.mp?.preferenceId || null,
          status: payment.status,
          statusDetail: payment.status_detail || null,
          method: payment.payment_method?.type || payment.payment_type_id || null,
          liveMode: payment.live_mode !== false,
        },
        processedTx: FieldValue.arrayUnion(paymentKey),
        statusHistory: FieldValue.arrayUnion({
          from,
          to: nextStatus,
          by: "webhook",
          at: new Date().toISOString(),
        }),
      };
      if (nextStatus === "paid") update.paidAt = FieldValue.serverTimestamp();
      tx.update(ref, update);

      if (nextStatus === "paid" && Array.isArray(current.items)) {
        for (const item of current.items) {
          tx.update(db.collection("productos").doc(item.id), {
            cantidad: FieldValue.increment(-Math.abs(Number(item.qty) || 0)),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
      return true;
    });

    // Si no hubo transición (duplicado/tardío), igual cuenta para conciliar.
    if (!applied) {
      await ref
        .update({
          webhookAttempts: FieldValue.increment(1),
          lastWebhookAt: FieldValue.serverTimestamp(),
        })
        .catch(() => {});
    }

    console.log(`mp webhook OK ref=${reference} payment=${payment.id} status=${payment.status}`);
    return res.status(200).send("OK");
  } catch (e) {
    console.error("mp webhook: error interno");
    return res.status(500).send("Error");
  }
}
