import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Carrusel hero a pantalla completa.
// onSelect(gender, subcat): filtra el catálogo y hace scroll (igual que las tiles).
// Cada slide acepta `image` (URL Cloudinary 1920×1080); vacío = fondo editorial.
export function HeroCarousel({ onSelect }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const total = HERO_SLIDES.length;

  const go = useCallback(
    (i) => setActive(((i % total) + total) % total),
    [total]
  );

  useEffect(() => {
    if (paused || total < 2) return;
    timer.current = setTimeout(() => go(active + 1), 6500);
    return () => clearTimeout(timer.current);
  }, [active, paused, total, go]);

  return (
    <section
      className="relative h-[92svh] min-h-[560px] w-full overflow-hidden bg-charcoal text-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === active ? "z-10 opacity-100" : "z-0 opacity-0"
          )}
          aria-hidden={i !== active}
        >
          {s.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.image}
              alt={s.title}
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                i === active && "hero-active-img"
              )}
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0",
                s.id === "perfumeria" &&
                  "bg-[radial-gradient(120%_100%_at_80%_10%,#4a3b22_0%,#1c1c1e_55%)]",
                s.id === "mujer" &&
                  "bg-[radial-gradient(120%_100%_at_20%_15%,#5c4a33_0%,#1c1c1e_60%)]",
                s.id === "hombre" &&
                  "bg-[radial-gradient(120%_100%_at_50%_0%,#3a3a40_0%,#1c1c1e_60%)]"
              )}
            />
          )}
          {/* Overlay oscuro sutil para legibilidad */}
          <div className="absolute inset-0 bg-charcoal/55" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-charcoal/80 to-transparent" />
        </div>
      ))}

      {/* Texto superpuesto */}
      <div className="absolute inset-0 z-20 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-24 md:pb-28">
        <div key={active}>
          <p className="font-display text-xs font-semibold tracking-[0.3em] text-sand">
            {HERO_SLIDES[active].eyebrow}
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-5xl font-bold leading-[0.95] md:text-8xl">
            {HERO_SLIDES[active].title}
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-cream/80">
            {HERO_SLIDES[active].subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="sand"
              size="lg"
              onClick={() =>
                onSelect(HERO_SLIDES[active].gender, HERO_SLIDES[active].subcat)
              }
            >
              {HERO_SLIDES[active].ctaLabel} <ArrowRight />
            </Button>
            <a href="#catalogo">
              <Button
                size="lg"
                variant="outline"
                className="border-cream/70 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-charcoal"
              >
                Ver todo
              </Button>
            </a>
          </div>
        </div>

        {/* Controles */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={cn(
                  "h-1 transition-all",
                  i === active ? "w-10 bg-sand" : "w-5 bg-cream/30 hover:bg-cream/60"
                )}
              />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => go(active - 1)}
              aria-label="Anterior"
              className="flex h-10 w-10 items-center justify-center border border-cream/40 hover:border-sand hover:text-sand"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(active + 1)}
              aria-label="Siguiente"
              className="flex h-10 w-10 items-center justify-center border border-cream/40 hover:border-sand hover:text-sand"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
