import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app, isFirebaseConfigured } from "@/lib/firebase";

// Correos con rol admin, separados por coma en .env.local:
// NEXT_PUBLIC_ADMIN_EMAILS=tu@correo.com,otro@correo.com
export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || "").toLowerCase());
}

let auth = null;
if (isFirebaseConfigured && app) {
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();

export { auth };

export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase no configurado. Revisa tu .env.local");
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}
