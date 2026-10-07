// Lógica de órdenes compartida (agnóstica a la pasarela) — SOLO servidor.
import crypto from "node:crypto";

// Referencia única por intento de pago (sin espacios ni especiales).
export function buildReference(prefix = "VESTIQ") {
  const rand = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()
    .slice(0, 8);
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

// Dinero en enteros (pesos COP): sin flotantes en el cálculo final.
export function toIntAmount(total) {
  const v = Math.round(Number(total));
  if (!Number.isFinite(v) || v <= 0) throw new Error("Monto inválido.");
  return v;
}

// Cálculo confiable del total desde productos de Firestore.
// productsById: { id: { nombre, precio, cantidad } }. Lanza con status HTTP.
export function computeOrderItems(productsById, items) {
  const clean = (Array.isArray(items) ? items : [])
    .map((i) => ({
      id: String(i?.id || ""),
      qty: Math.max(1, Math.min(99, parseInt(i?.qty, 10) || 0)),
    }))
    .filter((i) => i.id && i.qty > 0);
  if (clean.length === 0 || clean.length > 50) {
    const e = new Error("Carrito vacío o inválido.");
    e.status = 400;
    throw e;
  }
  const orderItems = [];
  for (const i of clean) {
    const p = productsById[i.id];
    if (!p) {
      const e = new Error("El artículo ya no está disponible.");
      e.status = 400;
      throw e;
    }
    const unit = Math.round(Number(p.precio));
    if (!Number.isFinite(unit) || unit < 0) {
      const e = new Error("Precio inválido en catálogo.");
      e.status = 400;
      throw e;
    }
    const stock = Number(p.cantidad ?? 0);
    if (stock < i.qty) {
      const e = new Error(
        `Stock insuficiente para "${p.nombre}". Disponible: ${stock}.`
      );
      e.status = 400;
      throw e;
    }
    orderItems.push({
      id: i.id,
      nombre: String(p.nombre || "Artículo"),
      precio: unit,
      qty: i.qty,
      subtotal: unit * i.qty,
    });
  }
  return orderItems;
}

export const FINAL_STATES = new Set(["paid", "rejected", "cancelled", "error"]);

// 'paid' es terminal absoluto. Un 'paid' entrante rescata rejected/error/
// cancelled (reintento). Lo demás solo sale desde 'pending'.
export function transitionAllowed(from, to) {
  if (to === "paid") return from !== "paid";
  return from === "pending";
}
