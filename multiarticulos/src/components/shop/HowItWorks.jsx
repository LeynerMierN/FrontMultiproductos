import { STEPS } from "@/config/site";

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Así funciona
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">
        Comprar aquí es fácil
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
              {s.n}
            </span>
            <h3 className="mt-3 font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
