import { PROMOS } from "@/config/site";

export function PromoBar() {
  const row = [...PROMOS, ...PROMOS];
  return (
    <div className="overflow-hidden bg-charcoal py-2 text-cream">
      <div className="animate-marquee flex w-max items-center gap-8 pr-8">
        {row.map((p, i) => (
          <span
            key={i}
            className="font-display flex items-center gap-8 whitespace-nowrap text-xs font-semibold tracking-widest"
          >
            {p}
            <span className="text-neutral-500">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
