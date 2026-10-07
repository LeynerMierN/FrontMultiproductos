import { Truck, Banknote, ShieldCheck, RefreshCcw } from "lucide-react";
import { PERKS } from "@/config/site";

const ICONS = { Truck, Banknote, ShieldCheck, RefreshCcw };

export function Perks() {
  return (
    <section className="border-y border-charcoal/15 bg-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
        {PERKS.map((p) => {
          const Icon = ICONS[p.icon] || ShieldCheck;
          return (
            <div key={p.title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-charcoal text-cream">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="font-display block text-sm font-semibold tracking-wide">{p.title}</span>
                <span className="block text-xs text-neutral-500">{p.text}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
