import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/config/site";

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Comunidad Vestiq
      </p>
      <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
        La comunidad opina
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col gap-3 border border-charcoal/10 bg-paper p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift"
          >
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <blockquote className="text-sm text-neutral-700">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-auto text-xs font-semibold text-neutral-500">
              {t.name} · {t.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
