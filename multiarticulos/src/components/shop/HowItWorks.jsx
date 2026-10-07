import { STEPS } from "@/config/site";

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Así funciona
      </p>
      <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
        Cómo comprar
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="border border-charcoal/10 bg-paper p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift"
          >
            <span className="font-display flex h-9 w-9 items-center justify-center bg-charcoal text-base font-bold text-cream">
              {s.n}
            </span>
            <h3 className="font-display mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
