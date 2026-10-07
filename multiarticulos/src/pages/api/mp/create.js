// POST /api/mp/create
// Crea la orden interna (pending, total calculado en SERVIDOR desde
// Firestore) + preferencia Checkout Pro, y devuelve init_point para redirigir.
import { MercadoPagoConfig, Preference } from "mercadopago";
import { adminDb, adminAuth, FieldValue } from "@/lib/server/firebaseAdmin";
import { getMpConfig } from "@/lib/server/mercadopago";
import {
  buildReference,
  toIntAmount,
  computeOrderItems,
} from "@/lib/server/orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  let cfg;
  try {
    cfg = getMpConfig(); // fail fast si producción está mal configurada
  } catch (e) {
    console.error("mp create config:", e.message);
    return res.status(500).json({ error: "Pagos no disponibles por configuración." });
  }

  try {
    const { items, idToken, buyerEmail } = req.body || {};
    if (!idToken) {
      return res.status(401).json({ error: "Debes iniciar sesión para pagar." });
    }

    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(idToken);
    } catch (e) {
      console.error("mp auth:", e.code || e.message);
      return res.status(401).json({ error: "Sesión inválida. Vuelve a ingresar." });
    }
    const uid = decoded.uid;

    const db = adminDb();
    const wanted = (Array.isArray(items) ? items : [])
      .map((i) => String(i?.id || ""))
      .filter(Boolean)
      .slice(0, 50);
    if (wanted.length === 0) {
      return res.status(400).json({ error: "Carrito vacío o inválido." });
    }
    const snapshots = await db.getAll(
      ...wanted.map((id) => db.collection("productos").doc(id))
    );
    const productsById = {};
    snapshots.forEach((s) => {
      if (s.exists) productsById[s.id] = s.data();
    });

    let orderItems;
    try {
      orderItems = computeOrderItems(productsById, items);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    const total = toIntAmount(orderItems.reduce((a, i) => a + i.subtotal, 0));
    const email = String(buyerEmail || decoded.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: "Email de compra inválido." });
    }

    const reference = buildReference("VESTIQ");
    const resultUrl = `${cfg.appBaseUrl}/pago/resultado?ref=${reference}`;

    const client = new MercadoPagoConfig({ accessToken: cfg.accessToken });
    const preference = new Preference(client);
    let pref;
    try {
      pref = await preference.create({
        body: {
          items: orderItems.map((i) => ({
            id: i.id,
            title: i.nombre.slice(0, 255),
            quantity: i.qty,
            unit_price: i.precio,
            currency_id: cfg.currency,
          })),
          payer: { email },
          back_urls: { success: resultUrl, failure: resultUrl, pending: resultUrl },
          auto_return: "approved",
          notification_url: `${cfg.appBaseUrl}/api/mp/webhook`,
          external_reference: reference,
          statement_descriptor: "VESTIQ",
          expires: true,
          expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });
    } catch (e) {
      console.error("mp preference:", e.message);
      return res.status(502).json({ error: "Mercado Pago no disponible. Intenta luego." });
    }

    await db.collection("orders").doc(reference).set({
      reference,
      uid,
      email: decoded.email || "",
      buyerEmail: email,
      items: orderItems,
      total,
      currency: cfg.currency,
      status: "pending",
      provider: cfg.provider,
      region: cfg.region,
      environment: cfg.env,
      mp: { preferenceId: pref.id || null, paymentId: null },
      processedTx: [],
      webhookAttempts: 0,
      statusHistory: [
        { from: null, to: "pending", by: "create-order", at: FieldValue.serverTimestamp() },
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      paidAt: null,
    });

    return res.status(200).json({ initPoint: pref.init_point, reference });
  } catch (e) {
    console.error("mp create:", e.message);
    return res.status(500).json({ error: "No se pudo crear la orden." });
  }
}
