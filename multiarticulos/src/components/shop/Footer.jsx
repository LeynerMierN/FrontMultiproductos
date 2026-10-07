import { useState } from "react";
import { ArrowRight, MessageCircle, Send, Check } from "lucide-react";
import { CONTACT, whatsappLink } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-12 bg-charcoal text-cream">
      {/* CTA final */}
      <section className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display max-w-2xl text-4xl font-bold leading-[0.95] md:text-6xl">
            Tu próximo favorito te espera
          </h2>
          <p className="mt-3 max-w-md text-sm text-neutral-300">
            Explora el catálogo y haz tu pedido hoy mismo. Stock en tiempo
            real y atención personalizada.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#catalogo">
              <Button variant="sand" size="lg">
                Comprar ahora <ArrowRight />
              </Button>
            </a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="border-cream/70 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-charcoal"
              >
                <MessageCircle /> WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Links */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-bold">Vestiq</p>
            <p className="mt-2 text-sm text-neutral-400">
              Todo lo que buscas, en un solo lugar.
            </p>
            <p className="mt-3 text-sm text-neutral-400">{CONTACT.email}</p>
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-widest text-neutral-400">
              Explora
            </p>
            <ul className="mt-3 grid gap-2 text-sm font-medium">
              <li><a className="hover:underline" href="#catalogo">Catálogo</a></li>
              <li><a className="hover:underline" href="#destacados">Novedades</a></li>
              <li><a className="hover:underline" href="#faq">Ayuda</a></li>
              <li>
                <a className="hover:underline" href={whatsappLink()} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-widest text-neutral-400">
              Únete al club
            </p>
            {subscribed ? (
              <p className="mt-3 flex items-center gap-2 border border-emerald-500 px-4 py-3 text-sm font-medium text-emerald-400">
                <Check className="h-4 w-4" /> ¡Listo! Te avisaremos lo nuevo.
              </p>
            ) : (
              <form
                className="mt-3 flex gap-2"
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
                  className="border-cream/30 bg-transparent text-cream placeholder:text-neutral-500"
                />
                <Button type="submit" variant="secondary" aria-label="Suscribirme">
                  <Send />
                </Button>
              </form>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              Ofertas y nuevos artículos, sin spam.
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-neutral-500 sm:flex-row">
            <p>© 2026 Vestiq · Todos los derechos reservados</p>
            <p className="sm:ml-auto">Hecho con Next.js + Firebase</p>
          </div>
        </div>
      </section>
    </footer>
  );
}
