import { useRef, useState } from "react";
import { Plus, Loader2, ImagePlus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { validateImage } from "@/lib/storage";
import {
  uploadProductPhoto,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

export function AdminForm({ onAdd, disabled }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileRef = useRef(null);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateImage(f);
    if (err) return setFormError(err);
    setFormError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearImage() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setImageLink("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!nombre.trim()) return setFormError("Ponle un nombre al producto.");
    if (precio === "" || Number(precio) < 0)
      return setFormError("Precio inválido. Debe ser 0 o más.");
    if (imageLink.trim() && !/^https?:\/\/.+/i.test(imageLink.trim()))
      return setFormError("El link debe empezar con http:// o https://");
    setSaving(true);
    try {
      let imageUrl = imageLink.trim();
      if (file) imageUrl = await uploadProductPhoto(file);
      await onAdd({ nombre, precio, cantidad, imageUrl });
      setNombre("");
      setPrecio("");
      setCantidad("1");
      clearImage();
    } catch (err) {
      setFormError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar artículo</CardTitle>
        <CardDescription>
          Se guarda en Firestore +{" "}
          {isCloudinaryConfigured ? "Cloudinary" : "Storage"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ej. Café molido 500g"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={disabled || saving}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Foto (opcional)</Label>
            {preview || imageLink.trim() ? (
              <div className="relative overflow-hidden rounded-2xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview || imageLink.trim()}
                  alt="preview"
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow"
                  aria-label="Quitar foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled || saving}
                className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-semibold">Elegir archivo</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickFile}
            />
            <Input
              placeholder="…o pega link https://…"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
              disabled={disabled || saving || Boolean(file)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="precio">Precio ($)</Label>
              <Input
                id="precio"
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                disabled={disabled || saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cantidad">Stock</Label>
              <Input
                id="cantidad"
                type="number"
                min="0"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={disabled || saving}
              />
            </div>
          </div>
          {formError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {formError}
            </p>
          )}
          <Button type="submit" disabled={disabled || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Plus />}
            {saving ? "Guardando…" : "Agregar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
