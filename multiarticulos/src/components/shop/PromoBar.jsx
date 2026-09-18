import { PROMOS } from "@/config/site";

export function PromoBar() {
  const row = [...PROMOS, ...PROMOS];
  return (
    <div className="overflow-hidden bg-neutral-900 py-2 text-white">
      <div className="animate-marquee flex w-max items-center gap-8 pr-8">
        {row.map((p, i) => (
          <span
            key={i}
            className="flex items-center gap-8 whitespace-nowrap text-xs font-medium tracking-wide"
          >
            {p}
            <span className="text-neutral-500">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
