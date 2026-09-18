import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MAX_MB = 5;

export function validateImage(file) {
  if (!file) return "Sin archivo.";
  if (!file.type.startsWith("image/"))
    return "Debe ser una imagen (jpg, png, webp).";
  if (file.size > MAX_MB * 1024 * 1024)
    return `Máximo ${MAX_MB}MB. Pesa ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
  return "";
}

export async function uploadProductImage(file) {
  const err = validateImage(file);
  if (err) throw new Error(err);
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `productos/${Date.now()}_${safe}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return await getDownloadURL(r);
}

export async function deleteProductImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes("firebasestorage")) return;
  try {
    const { refFromURL } = await import("firebase/storage");
    await deleteObject(refFromURL(storage, imageUrl));
  } catch {
    // no bloquea el borrado del doc
  }
}
