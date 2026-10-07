import { useEffect, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Espejo del carrito en Firestore: users/{uid}.cart = [{id, qty}].
// Así el admin puede ver el carrito de cada usuario y el carrito
// sobrevive entre dispositivos. Solo cuando hay sesión.
export function useCartSync(uid, rawItems) {
  const first = useRef(true);

  useEffect(() => {
    if (!uid || !db) return;
    if (first.current) {
      first.current = false;
      return; // evita pisar con el estado inicial vacío al cargar
    }
    const t = setTimeout(() => {
      setDoc(
        doc(db, "users", uid),
        {
          cart: rawItems.map((i) => ({ id: i.id, qty: i.qty })),
          cartUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch((e) => console.error("No se pudo sincronizar el carrito:", e));
    }, 800);
    return () => clearTimeout(t);
  }, [uid, rawItems]);

  useEffect(() => {
    first.current = true;
  }, [uid]);
}
