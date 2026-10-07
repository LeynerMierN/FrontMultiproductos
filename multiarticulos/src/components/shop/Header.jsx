import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { whatsappLink } from "@/config/site";
import { useAuth } from "@/context/AuthContext";

function AccountButton() {
  const { user, profile, role, loading, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <span className="h-8 w-8 animate-pulse bg-neutral-100" />;
  }

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await signIn();
          } catch (e) {
            alert(e.message || "No se pudo iniciar sesión con Google.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <LogIn /> <span className="hidden sm:inline">Ingresar</span>
      </Button>
    );
  }

  const initial = (profile?.displayName || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden border border-charcoal bg-parchment font-bold hover:bg-[#e4ddcd]"
        aria-label="Mi cuenta"
      >
        {profile?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photoURL} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm">{initial}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-60 border border-charcoal bg-paper p-4 shadow-lift">
            <p className="truncate text-sm font-bold">
              {profile?.displayName || "Mi cuenta"}
            </p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
            <p className="mt-2">
              <Badge tone={role === "admin" ? "amber" : "slate"} className="rounded-none uppercase">
                {role === "admin" ? "Administrador" : "Usuario"}
              </Badge>
            </p>
            {role === "admin" && (
              <Link
                href="/admin"
                className="mt-3 flex items-center gap-2 px-2 py-2 text-sm font-semibold hover:bg-neutral-100"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" /> Administrar
              </Link>
            )}
            <button
              onClick={async () => {
                setOpen(false);
                await signOut();
              }}
              className="mt-1 flex w-full items-center gap-2 px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Header({ q, setQ, cartCount, onCartOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-charcoal/15 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center bg-charcoal">
            <span className="font-display text-lg font-bold text-cream">V</span>
          </span>
          <span className="font-display text-2xl font-bold tracking-wide">
            Vestiq
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-sm md:block">
          <Input placeholder="Buscar artículos…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <AccountButton />
          <Button onClick={onCartOpen} size="sm" className="relative">
            <ShoppingBag /> <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-cream px-1 text-[11px] font-bold text-charcoal">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      <nav className="border-t border-charcoal/10">
        <div className="no-scrollbar mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-2">
          {[
            ["#catalogo", "Catálogo"],
            ["#categorias", "Mujer · Hombre"],
            ["#destacados", "Novedades"],
            ["#faq", "Ayuda"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="font-display whitespace-nowrap text-sm font-semibold tracking-wider text-neutral-800 hover:text-black hover:underline hover:underline-offset-4"
            >
              {label}
            </a>
          ))}
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="font-display whitespace-nowrap text-sm font-semibold tracking-wider text-neutral-800 hover:text-black hover:underline hover:underline-offset-4"
          >
            Contáctanos
          </a>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <Input
          placeholder="Buscar artículos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
    </header>
  );
}
