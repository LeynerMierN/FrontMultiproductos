// POST /api/chat { message, history? } — chatbot RAG de Vestiq.
// Público (ayuda a comprar), con límites anti-abuso. La key de Gemini
// nunca sale del servidor.
import {
  getCatalogSnapshot,
  retrieveRelevant,
  buildContext,
  askGemini,
} from "@/lib/server/rag";

// Límite simple en memoria: 20 mensajes por IP cada 5 minutos.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 5 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 2000) hits.clear();
  return arr.length > 20;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    if (rateLimited(ip)) {
      return res.status(429).json({ error: "Demasiados mensajes. Espera unos minutos." });
    }

    const { message, history } = req.body || {};
    const text = String(message || "").trim();
    if (text.length < 2 || text.length > 500) {
      return res.status(400).json({ error: "Mensaje inválido (2 a 500 caracteres)." });
    }
    const cleanHistory = Array.isArray(history)
      ? history.slice(-6).map((m) => ({
          role: m?.role === "assistant" ? "assistant" : "user",
          text: String(m?.text || "").slice(0, 500),
        }))
      : [];

    const products = await getCatalogSnapshot().catch(() => []);
    const relevant = retrieveRelevant(products, text);
    const context = buildContext(products, relevant);
    const reply = await askGemini(text, cleanHistory, context);
    return res.status(200).json({ reply });
  } catch (e) {
    console.error("chat:", e.message);
    return res.status(500).json({
      error: "No pude responder ahora. Escríbenos por WhatsApp y te ayudamos.",
    });
  }
}
