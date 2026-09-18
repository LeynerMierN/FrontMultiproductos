import { useState } from "react";
import { ArrowRight, MessageCircle, Send, Check } from "lucide-react";
import { CONTACT, whatsappLink } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-12">
      {/* CTA final */}
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Tu próximo favorito ya te está esperando
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-300">
            Explora el catálogo y haz tu pedido hoy mismo. Stock en tiempo
            real y atención personalizada.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a href="#catalogo">
              <Button
                variant="secondary"
                size="lg"
                className="border-0"
              >
                Comprar ahora <ArrowRight />
              </Button>
            </a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
              >
                <MessageCircle /> WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-bold">Vestiq</p>
            <p className="mt-2 text-sm text-neutral-500">
              Todo lo que buscas, en un solo lugar. Catálogo en tiempo real
              desde Firestore.
            </p>
            <p className="mt-3 text-sm text-neutral-500">{CONTACT.email}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Enlaces</p>
            <ul className="mt-2 grid gap-1.5 text-sm text-neutral-600">
              <li><a className="hover:underline" href="#catalogo">Catálogo</a></li>
              <li><a className="hover:underline" href="#destacados">Destacados</a></li>
              <li><a className="hover:underline" href="#faq">Preguntas frecuentes</a></li>
              <li>
                <a className="hover:underline" href={whatsappLink()} target="_blank" rel="noreferrer">
                  Contáctanos por WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">Recibe novedades</p>
            {subscribed ? (
              <p className="mt-2 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" /> ¡Listo! Te avisaremos lo nuevo.
              </p>
            ) : (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
              >
                <Input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" aria-label="Suscribirme">
                  <Send />
                </Button>
              </form>
            )}
            <p className="mt-2 text-xs text-neutral-400">
              Ofertas y nuevos artículos, sin spam.
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-100">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-neutral-400 sm:flex-row">
            <p>© 2026 Vestiq · Todos los derechos reservados</p>
            <p className="sm:ml-auto">Hecho con Next.js + Firebase</p>
          </div>
        </div>
      </section>
    </footer>
  );
}
