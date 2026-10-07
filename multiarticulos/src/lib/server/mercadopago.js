// Configuración y utilidades Mercado Pago (Checkout Pro) — SOLO servidor.
// Docs: https://www.mercadopago.com.co/developers (Checkout Pro + Webhooks)
//  - Preferencia: items, payer.email, back_urls, auto_return, notification_url,
//    external_reference (= nuestra referencia), statement_descriptor.
//  - Webhook: header x-signature `ts=...,v1=...`; manifiesto
//    `id:{dataId};request-id:{xRequestId};ts:{ts};` (omitir ausentes),
//    HMAC-SHA256 hex con el secret de "Tus integraciones > Webhooks".
import crypto from "node:crypto";

export function getMpEnv() {
  const raw = String(process.env.MP_ENV || "").trim().toLowerCase();
  if (raw === "production" || raw === "prod" || raw === "live") return "production";
  return "test"; // test por defecto explícito; producción solo opt-in
}

function pick(...names) {
  for (const n of names) {
    const v = String(process.env[n] || "").trim();
    if (v) return v;
  }
  return "";
}

export function getMpConfig() {
  const env = getMpEnv();
  const accessToken = pick("MP_ACCESS_TOKEN");
  const webhookSecret = pick("MP_WEBHOOK_SECRET");
  const currency = pick("MP_CURRENCY") || "COP";
  const appBaseUrl = pick("MP_APP_BASE_URL", "APP_BASE_URL").replace(/\/$/, "");

  if (env === "production") {
    const missing = [];
    if (!accessToken) missing.push("MP_ACCESS_TOKEN");
    if (!webhookSecret) missing.push("MP_WEBHOOK_SECRET");
    if (!appBaseUrl) missing.push("MP_APP_BASE_URL");
    if (missing.length) {
      throw new Error(
        `Mercado Pago producción mal configurado. Faltan: ${missing.join(", ")}.`
      );
    }
    if (accessToken.startsWith("TEST-")) {
      throw new Error(
        "MP_ACCESS_TOKEN de prueba (TEST-*) en entorno production. Usa credenciales productivas."
      );
    }
    if (/localhost|127\.0\.0\.1/i.test(appBaseUrl)) {
      throw new Error("APP_BASE_URL no puede ser localhost en producción.");
    }
  } else {
    if (!accessToken) {
      throw new Error(
        "Falta MP_ACCESS_TOKEN (credencial TEST-* de Mercado Pago) en el servidor."
      );
    }
    // El secret puede faltar en test si aún no configuran webhooks: se exige
    // al validar, no al crear preferencias (el pago igual funciona).
  }

  return {
    env,
    provider: "mercadopago",
    region: "CO",
    accessToken,
    webhookSecret,
    currency,
    testMode: env !== "production",
    appBaseUrl: appBaseUrl || "http://localhost:3000",
  };
}

// Vista pública y segura (health): nunca el token ni el secret.
export function publicMpInfo() {
  const cfg = getMpConfig();
  return {
    env: cfg.env,
    provider: cfg.provider,
    region: cfg.region,
    currency: cfg.currency,
    testMode: cfg.testMode,
    tokenConfigured: true,
    webhookSecretConfigured: Boolean(cfg.webhookSecret),
  };
}

// states de pago MP → estado interno (códigos oficiales de la API).
export function mapMpStatus(status, detail) {
  switch (String(status)) {
    case "approved":
      return "paid";
    case "rejected":
    case "cancelled":
      return status === "cancelled" ? "cancelled" : "rejected";
    case "refunded":
    case "charged_back":
      return "cancelled";
    case "pending":
    case "authorized":
    case "in_process":
    case "in_mediation":
    default:
      return "pending";
  }
}

// Valida x-signature. Retorna {ok, reason}. Pura y testeable.
export function validateWebhookSignature({ xSignature, xRequestId, dataId }, secret) {
  if (!secret) return { ok: false, reason: "no-secret" };
  if (!xSignature) return { ok: false, reason: "no-signature" };
  const parts = Object.fromEntries(
    String(xSignature)
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((kv) => kv.length === 2)
  );
  const ts = parts.ts || "";
  const v1 = (parts.v1 || "").toLowerCase();
  if (!ts || !v1) return { ok: false, reason: "malformed-signature" };

  let manifest = "";
  const id = dataId != null && String(dataId).trim() !== "" ? String(dataId).toLowerCase() : "";
  if (id) manifest += `id:${id};`;
  if (xRequestId) manifest += `request-id:${xRequestId};`;
  manifest += `ts:${ts};`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest, "utf8")
    .digest("hex")
    .toLowerCase();
  if (expected.length !== v1.length) return { ok: false, reason: "bad-signature" };
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
    return ok ? { ok: true } : { ok: false, reason: "bad-signature" };
  } catch {
    return { ok: false, reason: "bad-signature" };
  }
}
