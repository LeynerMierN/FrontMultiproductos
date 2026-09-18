import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/config/site";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-12">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Preguntas frecuentes
      </p>
      <h2 className="mt-1 text-center text-2xl font-bold tracking-tight">
        Lo que necesitas saber
      </h2>
      <div className="mt-5 grid gap-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-bold"
              >
                {f.q}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-4 text-sm text-neutral-600">{f.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
