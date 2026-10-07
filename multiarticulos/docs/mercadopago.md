# Mercado Pago — Vestiq (Checkout Pro)

Checkout por redirección (Mercado Pago hospeda el formulario; la tienda
nunca toca PAN/CVV). Docs: https://www.mercadopago.com.co/developers

## Arquitectura

```
Carrito → POST /api/mp/create → redirect init_point → Checkout MP
   ↓ (redirect navegador)                    ↓ (server-to-server)
GET /pago/resultado?ref= (SOLO lectura)      POST /api/mp/webhook (verdad)
```

- Totales en servidor desde Firestore (Admin SDK). El cliente solo envía `{id, qty}`.
- Estados internos: `pending → paid | rejected | pending | error | cancelled`.
  `paid` terminal; `paid` entrante rescata `rejected` (reintento).
- Webhook: valida HMAC `x-signature`, luego consulta el pago vía SDK
  (dato autoritativo) y actualiza en transacción atómica. Stock se
  descuenta una sola vez al entrar a `paid`.

## Test vs producción

| | Test | Producción |
|---|---|---|
| `MP_ENV` | (vacío) | `production` |
| `MP_ACCESS_TOKEN` | `TEST-...` | `APP_USR-...` (fail fast si es TEST-*) |
| `MP_WEBHOOK_SECRET` | opcional* | obligatorio |
| `APP_BASE_URL` | localhost ok | HTTPS pública obligatoria |

\* Sin secret, el webhook se valida solo con el fetch autenticado (se registra
aviso). En producción sin secret no arranca.

## Variables (nombres; valores solo en despliegue)

```
MP_ENV=
MP_ACCESS_TOKEN=      # TEST-* para pruebas, APP_USR-* en producción
MP_WEBHOOK_SECRET=    # Tus integraciones > Webhooks > revelar clave
MP_CURRENCY=COP
APP_BASE_URL=https://vestiq.example.com
```

## URLs

- Webhook: `https://<dominio>/api/mp/webhook` (va por transacción en
  `notification_url`; debe ser pública con TLS válido).
- Retorno: `https://<dominio>/pago/resultado?ref=VESTIQ-...` (las 3
  `back_urls` apuntan aquí; solo lectura).
- Salud: `GET /api/mp/health` (sin secretos).

## Reglas Firestore (`orders`)

```js
match /orders/{ref} {
  allow read: if request.auth != null && (resource.data.uid == request.auth.uid
    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow write: if false; // solo Admin SDK (servidor)
}
```

## Despliegue a producción

1. `MP_ENV=production` + token `APP_USR-*` + secret en el hosting.
2. `APP_BASE_URL` con dominio HTTPS final.
3. Reglas `orders` publicadas. 4. `pnpm build`.
5. 1 compra real mínima antes de anunciar (ver checklist abajo).

## Rollback

Aditivo y por variable: quitar `MP_ENV=production` regresa a test sin
redeploy. Órdenes `pending` viejas se cancelan desde `/pago/resultado`.

## Reconciliación

`POST /api/mp/reconcile {reference, idToken}` (solo admin): estado
canónico + consulta EN VIVO del pago en MP (`live` + `diverges`) +
checklist. No cambia estados.

## Pruebas (`pnpm test`, sin red)

26→14 tests `node:test`: entornos, HMAC (vector independiente),
estados, totales enteros, idempotencia, no-secretos.

## Checklist de humo (1 transacción)

1. `GET /api/mp/health` → `env` correcto, sin secretos.
2. Compra de prueba con usuario de prueba → `paid`, `paymentId` guardado.
3. Repetir notificación → sin duplicados (stock −1 sola vez).
4. `reconcile` → `diverges: false`.
5. Logs sin tokens ni firmas.

## Troubleshooting

- `401` create: token expirado o `FIREBASE_*` mal copiados.
- Orden eterna en `pending`: webhook no llega (localhost sin túnel) o
  firma rechazada (secret desactualizado tras Reset en el panel).
- `back_urls` exigen dominio con DNS (no localhost): en dev usa ngrok
  también para el retorno.
