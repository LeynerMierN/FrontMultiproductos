// Tests Mercado Pago — node:test built-in (sin red, sin Firebase).
// Ejecutar: pnpm test  (node --test tests/*.test.mjs)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  getMpEnv,
  getMpConfig,
  publicMpInfo,
  mapMpStatus,
  validateWebhookSignature,
} from "../src/lib/server/mercadopago.js";
import {
  buildReference,
  toIntAmount,
  computeOrderItems,
  transitionAllowed,
} from "../src/lib/server/orders.js";

function withEnv(vars, fn) {
  const keys = new Set([...Object.keys(vars),
    "MP_ENV", "MP_ACCESS_TOKEN", "MP_WEBHOOK_SECRET", "MP_CURRENCY",
    "MP_APP_BASE_URL", "APP_BASE_URL"]);
  const saved = {};
  for (const k of keys) saved[k] = process.env[k];
  for (const k of keys) delete process.env[k];
  Object.assign(process.env, vars);
  try {
    fn();
  } finally {
    for (const k of keys) delete process.env[k];
    for (const [k, v] of Object.entries(saved)) if (v !== undefined) process.env[k] = v;
  }
}

const SECRET = "testsecret123";
// Vector independiente (openssl): manifiesto
// "id:1234567890;request-id:req-abc-123;ts:1704908010;" con esa clave.
const GOOD_SIG = "ts=1704908010,v1=681507590d0780238386905296d8356932327e56965b9d6a0ba0d17c57b53355";

describe("entorno y configuración", () => {
  it("test por defecto; producción exige token productivo", () => {
    withEnv({}, () => assert.equal(getMpEnv(), "test"));
    withEnv({ MP_ENV: "production" }, () => {
      assert.throws(() => getMpConfig(), /Faltan/);
    });
    withEnv({
      MP_ENV: "production",
      MP_ACCESS_TOKEN: "TEST-123",
      MP_WEBHOOK_SECRET: "s",
      MP_APP_BASE_URL: "https://tienda.example.com",
    }, () => {
      assert.throws(() => getMpConfig(), /TEST-\*/);
    });
  });

  it("producción rechaza localhost y test-mode usa token TEST", () => {
    withEnv({
      MP_ENV: "production",
      MP_ACCESS_TOKEN: "APP_USR-abc",
      MP_WEBHOOK_SECRET: "s",
      MP_APP_BASE_URL: "http://localhost:3000",
    }, () => {
      assert.throws(() => getMpConfig(), /localhost/);
    });
    withEnv({ MP_ACCESS_TOKEN: "TEST-abc", MP_APP_BASE_URL: "http://localhost:3000" }, () => {
      const c = getMpConfig();
      assert.equal(c.env, "test");
      assert.equal(c.testMode, true);
      assert.equal(c.provider, "mercadopago");
    });
  });

  it("health pública nunca expone token ni secret", () => {
    withEnv({ MP_ACCESS_TOKEN: "TEST-abc" }, () => {
      const info = publicMpInfo();
      assert.ok(!("accessToken" in info) && !("webhookSecret" in info));
      assert.equal(info.provider, "mercadopago");
    });
  });

  it("sin rastro PayU en el código", () => {
    const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
    const files = ["src/lib/server/mercadopago.js", "src/lib/server/orders.js"];
    for (const f of files) {
      assert.doesNotMatch(readFileSync(path.join(root, f), "utf8"), /payu/i, f);
    }
  });
});

describe("firma del webhook (HMAC-SHA256)", () => {
  const base = {
    xSignature: GOOD_SIG,
    xRequestId: "req-abc-123",
    dataId: "1234567890",
  };

  it("firma válida pasa", () => {
    assert.deepEqual(validateWebhookSignature(base, SECRET), { ok: true });
  });

  it("dataId en mayúsculas también pasa (MP lo normaliza)", () => {
    const r = validateWebhookSignature({ ...base, dataId: "1234567890" }, SECRET);
    assert.equal(r.ok, true);
  });

  it("payload manipulado, firma ausente o sin secret fallan", () => {
    assert.equal(
      validateWebhookSignature({ ...base, dataId: "999" }, SECRET).ok,
      false
    );
    assert.equal(
      validateWebhookSignature({ ...base, xSignature: "ts=1,v1=00" }, SECRET).ok,
      false
    );
    assert.equal(validateWebhookSignature(base, "").ok, false);
  });
});

describe("estados y totales", () => {
  it("mapea estados oficiales MP", () => {
    assert.equal(mapMpStatus("approved"), "paid");
    assert.equal(mapMpStatus("rejected"), "rejected");
    assert.equal(mapMpStatus("pending"), "pending");
    assert.equal(mapMpStatus("in_process"), "pending");
    assert.equal(mapMpStatus("authorized"), "pending");
    assert.equal(mapMpStatus("cancelled"), "cancelled");
    assert.equal(mapMpStatus("refunded"), "cancelled");
    assert.equal(mapMpStatus("charged_back"), "cancelled");
  });

  it("paid terminal; paid rescata rejected", () => {
    assert.equal(transitionAllowed("paid", "rejected"), false);
    assert.equal(transitionAllowed("rejected", "paid"), true);
    assert.equal(transitionAllowed("pending", "paid"), true);
  });

  it("totales enteros desde catálogo, ignora cliente", () => {
    const items = computeOrderItems(
      { a: { nombre: "Tenis", precio: 119900, cantidad: 5 } },
      [{ id: "a", qty: 2, precio: 1 }]
    );
    assert.equal(items[0].subtotal, 239800);
    assert.equal(toIntAmount(239800.4), 239800);
    assert.throws(() => toIntAmount(0), /inválido/);
  });

  it("referencias únicas", () => {
    assert.notEqual(buildReference(), buildReference());
  });
});

describe("no persistir ni loggear secretos", () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

  it("sin PAN/CVV/tarjetas en código de pagos", () => {
    for (const f of [
      "src/lib/server/mercadopago.js",
      "src/lib/server/orders.js",
      "src/pages/api/mp/create.js",
      "src/pages/api/mp/webhook.js",
      "src/pages/api/mp/cancel.js",
      "src/pages/api/mp/reconcile.js",
    ]) {
      const src = readFileSync(path.join(root, f), "utf8");
      assert.doesNotMatch(src, /cvv|cvc|\bpan\b|card_?number|cc_number/i, f);
    }
  });

  it("logs sin secretos", () => {
    for (const f of [
      "src/pages/api/mp/create.js",
      "src/pages/api/mp/webhook.js",
      "src/pages/api/mp/cancel.js",
      "src/pages/api/mp/reconcile.js",
    ]) {
      const src = readFileSync(path.join(root, f), "utf8");
      for (const l of src.split("\n").filter((x) => x.includes("console."))) {
        assert.doesNotMatch(l, /token|secret|signature|v1=|key/i, `${f}: ${l.trim()}`);
      }
    }
  });

  it("resultado solo lectura", () => {
    const src = readFileSync(path.join(root, "src/pages/pago/resultado.js"), "utf8");
    assert.match(src, /onSnapshot/);
    assert.doesNotMatch(src, /setDoc|updateDoc|addDoc/);
  });
});
