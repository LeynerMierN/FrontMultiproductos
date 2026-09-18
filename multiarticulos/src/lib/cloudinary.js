import { validateImage } from "@/lib/storage";

// Subida sin firmar (unsigned) a Cloudinary.
// Requiere en .env.local:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET= (preset "unsigned" de Cloudinary)

export const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
export const uploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

export async function uploadImageToCloudinary(file) {
  const err = validateImage(file);
  if (err) throw new Error(err);
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary no configurado. Llena NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local"
    );
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", "productos");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "No se pudo subir a Cloudinary.");
  }
  return data.secure_url;
}

// Si Cloudinary está configurado lo usa; si no, usa Firebase Storage.
export async function uploadProductPhoto(file) {
  if (isCloudinaryConfigured) return uploadImageToCloudinary(file);
  const { uploadProductImage } = await import("@/lib/storage");
  return uploadProductImage(file);
}
