// src/features/products/types/index.ts

export interface Product {
    id?: string; // Es opcional porque al crearlo desde el formulario aún no tiene el ID de Firebase
    name: string;
    price: number;
    description?: string;
    stock: number;
    collectionId: string; // Para enlazar el producto con una categoría/colección
    createdAt?: number; 
  }