import Link from "next/link";
import { ArrowLeft, Store, Loader2, ShieldAlert, LogIn } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminList } from "@/components/admin/AdminList";
import { Button } from "@/components/ui/button";

function Gate({ children }) {
  const { user, role, loading, signIn } = useAuth();

  if (loading) {
    return (
      <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-16 text-sm text-neutral-500">
        <Loader2 className="animate-spin" /> Verificando acceso…
      </p>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-bold">Inicia sesión para continuar</p>
        <p className="mt-1 text-sm text-neutral-500">
          El panel de administración requiere una cuenta de Google con rol admin.
        </p>
        <Button
          className="mt-4"
          onClick={() => signIn().catch((e) => alert(e.message))}
        >
          <LogIn /> Ingresar con Google
        </Button>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-2 text-lg font-bold">Acceso restringido</p>
        <p className="mt-1 text-sm text-neutral-500">
          {user.email} tiene rol “usuario”. Pide al dueño de la tienda que te
          asigne rol admin.
        </p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            <ArrowLeft /> Volver a la tienda
          </Button>
        </Link>
      </div>
    );
  }

  return children;
}

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

      <Gate>
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
      </Gate>
    </div>
  );
}
