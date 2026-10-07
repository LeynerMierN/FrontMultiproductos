// Conexión privilegiada a Firebase SOLO para API Routes (servidor).
// Nunca importar este módulo desde componentes del navegador.
// Usa la API modular de firebase-admin v14+.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function clean(v) {
  let s = String(v || "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  return s;
}

function init() {
  if (getApps().length) return getApps()[0];
  const projectId = clean(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
  // La llave puede venir con \n literales o saltos reales.
  const privateKey = clean(process.env.FIREBASE_PRIVATE_KEY).replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY en el servidor. Genera una Service Account en Firebase Console."
    );
  }
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let _db = null;
let _auth = null;

export function adminDb() {
  init();
  if (!_db) _db = getFirestore();
  return _db;
}

export function adminAuth() {
  init();
  if (!_auth) _auth = getAuth();
  return _auth;
}

export { FieldValue };
