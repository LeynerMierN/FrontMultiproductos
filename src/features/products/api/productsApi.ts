// src/features/products/api/productsApi.ts

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebase"; // Usando el alias que configuraste
import { Product } from "../types";

// Referencia a la colección 'productos' en tu base de datos Firestore
const productsCollection = collection(db, "productos");

// 1. CREATE: Añadir un nuevo producto
export const createProduct = async (productData: Product) => {
  try {
    const docRef = await addDoc(productsCollection, productData);
    return docRef.id;
  } catch (error) {
    console.error("Error creando el producto:", error);
    throw error;
  }
};

// 2. READ: Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error obteniendo los productos:", error);
    throw error;
  }
};

// 3. UPDATE: Actualizar un producto
export const updateProduct = async (productId: string, updatedData: Partial<Product>) => {
  try {
    const productRef = doc(db, "productos", productId);
    await updateDoc(productRef, updatedData);
  } catch (error) {
    console.error("Error actualizando el producto:", error);
    throw error;
  }
};

// 4. DELETE: Eliminar un producto
export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, "productos", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error eliminando el producto:", error);
    throw error;
  }
};