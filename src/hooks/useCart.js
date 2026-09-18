import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "vestiq-cart-v1";

function read() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useCart(products = []) {
  const [items, setItems] = useState([]); // [{ id, qty }]
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(read());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
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

  return { items: detailed, count, total, open, setOpen, add, setQty, remove, clear };
}
