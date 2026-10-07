import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GUEST_KEY = "vestiq-cart-guest";
const keyFor = (uid) => (uid ? `vestiq-cart-${uid}` : GUEST_KEY);

function readKey(key) {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function mergeCarts(a, b) {
  const map = new Map();
  for (const i of [...a, ...b]) {
    if (!i?.id) continue;
    map.set(i.id, { id: i.id, qty: (map.get(i.id)?.qty || 0) + (i.qty || 0) });
  }
  return [...map.values()];
}

// Carrito por usuario: cada sesión (invitado o uid de Google) tiene su
// propia llave en localStorage. Al iniciar sesión, el carrito de invitado
// se fusiona con el del usuario.
export function useCart(products = [], uid = null) {
  const [items, setItems] = useState([]); // [{ id, qty }]
  const [open, setOpen] = useState(false);
  const uidRef = useRef(uid);

  // Cambió la sesión (login/logout): carga el carrito correspondiente.
  useEffect(() => {
    const prevUid = uidRef.current;
    if (prevUid === uid) return;
    setItems((current) => {
      // Si acaba de iniciar sesión y había algo como invitado, fusionar.
      if (uid && !prevUid && current.length > 0) {
        const mine = readKey(keyFor(uid));
        return mergeCarts(mine, current);
      }
      return readKey(keyFor(uid));
    });
    uidRef.current = uid;
  }, [uid]);

  // Carga inicial.
  useEffect(() => {
    setItems(readKey(keyFor(uidRef.current)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir en la llave de la sesión actual.
  useEffect(() => {
    try {
      localStorage.setItem(keyFor(uidRef.current), JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = useCallback((id, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found)
        return prev.map((i) =>
          i.id === id ? { ...i, qty: i.qty + qty } : i
        );
      return [...prev, { id, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((id, qty) => {
    const v = Math.max(0, parseInt(qty, 10) || 0);
    setItems((prev) =>
      v === 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: v } : i))
    );
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const p = products.find((x) => x.id === i.id);
          if (!p) return null;
          return { ...p, qty: i.qty, subtotal: Number(p.precio || 0) * i.qty };
        })
        .filter(Boolean),
    [items, products]
  );

  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items]);
  const total = useMemo(
    () => detailed.reduce((a, d) => a + d.subtotal, 0),
    [detailed]
  );

  return { items: detailed, rawItems: items, count, total, open, setOpen, add, setQty, remove, clear };
}
