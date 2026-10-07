// RAG de Vestiq — SOLO servidor (la API key de Gemini jamás sale al navegador).
// Retrieval: lee el catálogo vivo de Firestore + conocimiento de la tienda.
// Generation: Google Gemini (REST) con ese contexto.
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FAQS, PERKS, CONTACT, whatsappLink } from "@/config/site";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

function assertGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Falta GEMINI_API_KEY en el servidor.");
  }
}

// Normaliza para comparar: minúsculas, sin tildes.
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Top productos por coincidencia de palabras con el mensaje.
export function retrieveRelevant(products, message, limit = 6) {
  const tokens = norm(message).split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  if (!tokens.length) return products.filter((p) => (p.cantidad ?? 0) > 0).slice(0, limit);
  const scored = products.map((p) => {
    const hay = norm(
      `${p.nombre} ${p.subcategory} ${p.gender} ${p.description || ""}`
    );
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += t.length > 4 ? 2 : 1;
    }
    return { p, score };
  });
  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
  if (ranked.length) return ranked;
  return products.filter((p) => (p.cantidad ?? 0) > 0).slice(0, limit);
}

export async function getCatalogSnapshot() {
  const db = adminDb();
  const snap = await db.collection("productos").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function productLine(p) {
  const stock = Number(p.cantidad ?? 0);
  return `- ${p.nombre} | $${Number(p.precio ?? 0).toLocaleString("es-CO")} COP | ${
    stock > 0 ? `stock: ${stock}` : "AGOTADO"
  } | cat: ${p.gender || "unisex"}${p.subcategory ? ` / ${p.subcategory}` : ""}`;
}

export function buildContext(products, relevant) {
  const faqs = FAQS.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n");
  const perks = PERKS.map((p) => `• ${p.title}: ${p.text}`).join("\n");
  return `Eres "Vesti", el asistente de la tienda Vestiq (Colombia).
Respondes en español, tono amable y breve (máximo 120 palabras).
Solo hablas de la tienda: productos, precios, stock, envíos, pagos y garantías.
Si preguntan algo fuera de tema, redirige amablemente a la tienda.
Para comprar, invita a agregar al carrito en la web o escribir al WhatsApp ${CONTACT.whatsapp}.

BENEFICIOS:
${perks}

PREGUNTAS FRECUENTES:
${faqs}

PRODUCTOS RELEVANTES (precios y stock reales, úsalos tal cual):
${relevant.map(productLine).join("\n")}

Si un producto está AGOTADO dilo claramente y sugiere otro disponible.`;
}

export async function askGemini(message, history = [], context = "") {
  assertGemini();
  const contents = [
    ...history.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.text || "").slice(0, 1000) }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: context }] },
        contents,
        generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
      }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Gemini no disponible.");
  }
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini no devolvió respuesta.");
  return text;
}

export function whatsappFallback() {
  return whatsappLink("Hola Vestiq, necesito ayuda con un producto");
}
