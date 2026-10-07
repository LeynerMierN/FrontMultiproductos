// POST /api/mp/cancel { reference, idToken }
// Marca una orden como cancelada. Solo el dueño y solo si sigue pending.
import { adminDb, adminAuth, FieldValue } from "@/lib/server/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
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
    const ref = db.collection("orders").doc(String(reference));
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }
    const order = snap.data();
    if (order.uid !== decoded.uid) {
      return res.status(403).json({ error: "No te pertenece esta orden." });
    }
    if (order.status !== "pending") {
      return res
        .status(409)
        .json({ error: `La orden ya está en estado: ${order.status}.` });
    }
    await ref.update({
      status: "cancelled",
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        from: "pending",
        to: "cancelled",
        by: "user",
        at: new Date().toISOString(),
      }),
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("mp cancel:", e.message);
    return res.status(500).json({ error: "No se pudo cancelar." });
  }
}
