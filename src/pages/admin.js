import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminList } from "@/components/admin/AdminList";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const {
    products,
    loading,
    error,
    addProduct,
    removeProduct,
    changeQuantity,
    setQuantity,
    updatePrice,
  } = useProducts();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
            <Store className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-[15px] font-bold">Vestiq · Admin</h1>
            <p className="text-[11px] text-neutral-500">
              {products.length} artículos · Firestore “productos”
            </p>
          </div>
          <Link href="/" className="ml-auto">
            <Button variant="secondary" size="sm">
              <ArrowLeft /> Ver tienda
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <div>
          <AdminForm onAdd={addProduct} disabled={Boolean(error)} />
          {error && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {error}
            </p>
          )}
        </div>
        <AdminList
          products={products}
          loading={loading}
          onQty={changeQuantity}
          onDelete={removeProduct}
          onPrice={updatePrice}
          onStock={setQuantity}
        />
      </main>
    </div>
  );
}
