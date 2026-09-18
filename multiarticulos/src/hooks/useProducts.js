import { useCallback, useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

// Estructura Firestore — colección "productos":
// { nombre: string, precio: number, cantidad: number,
//   imageUrl: string, createdAt: Timestamp, updatedAt: Timestamp }
const COLLECTION = "productos";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      setError(
        "Firebase no configurado. Revisa tu .env.local con variables NEXT_PUBLIC_FIREBASE_*"
      );
      return;
    }
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error(err);
        setError("No se pudo leer Firestore. Revisa reglas y conexión.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const addProduct = useCallback(
    async ({ nombre, precio, cantidad, imageUrl }) => {
      const payload = {
        nombre: nombre.trim(),
        precio: Number(precio),
        cantidad: Math.max(0, parseInt(cantidad, 10) || 0),
        imageUrl: imageUrl || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (!payload.nombre) throw new Error("El nombre es obligatorio");
      if (!(payload.precio >= 0)) throw new Error("Precio inválido");
      await addDoc(collection(db, COLLECTION), payload);
    },
    []
  );

  const removeProduct = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  const changeQuantity = useCallback(async (id, delta) => {
    await updateDoc(doc(db, COLLECTION, id), {
      cantidad: increment(delta),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const setQuantity = useCallback(async (id, cantidad) => {
    const value = Math.max(0, parseInt(cantidad, 10) || 0);
    await updateDoc(doc(db, COLLECTION, id), {
      cantidad: value,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const updatePrice = useCallback(async (id, precio) => {
    const value = Number(precio);
    if (!(value >= 0)) throw new Error("Precio inválido");
    await updateDoc(doc(db, COLLECTION, id), {
      precio: value,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const updateImage = useCallback(async (id, imageUrl) => {
    await updateDoc(doc(db, COLLECTION, id), {
      imageUrl: imageUrl || "",
      updatedAt: serverTimestamp(),
    });
  }, []);

  return {
    products,
    loading,
    error,
    addProduct,
    removeProduct,
    changeQuantity,
    setQuantity,
    updatePrice,
    updateImage,
  };
}
