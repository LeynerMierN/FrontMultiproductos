import { Sparkles, RotateCcw } from "lucide-react";
import { FILTER_GROUPS, GENDERS, subcategoryLabel } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sección de filtros "EXPLORA TODO".
// - groups: [{ id, label, featured, items: [subcatId...] }] → listo para
//   venir de Firestore sin cambiar el componente.
// - gender: pills Todo/Mujer/Hombre/Unisex. subcat: id activo o "all".
function labelFor(id) {
  return subcategoryLabel(id) || id.charAt(0).toUpperCase() + id.slice(1);
}

export function FilterSection({ gender, subcat, onGender, onSubcat, onClear }) {
  const hasActive = gender !== "all" || subcat !== "all";

  return (
    <div className="grid gap-4">
      {/* Categoría principal */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display mr-1 text-xs font-semibold tracking-widest text-neutral-500">
          Categoría
        </span>
        <Button
          size="sm"
          variant={gender === "all" ? "default" : "outline"}
          onClick={() => onGender("all")}
        >
          Todo
        </Button>
        {GENDERS.map((g) => (
          <Button
            key={g.id}
            size="sm"
            variant={gender === g.id ? "default" : "outline"}
            onClick={() => onGender(gender === g.id ? "all" : g.id)}
          >
            {g.label}
          </Button>
        ))}
        {hasActive && (
          <button
            onClick={onClear}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-charcoal hover:underline"
          >
            <RotateCcw className="h-3 w-3" /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Grupos de subcategorías */}
      {FILTER_GROUPS.map((group) => (
        <fieldset
          key={group.id}
          className={cn(
            "border p-4",
            group.featured
              ? "border-sand bg-sand/10"
              : "border-charcoal/15 bg-paper shadow-soft"
          )}
        >
          <legend
            className={cn(
              "font-display px-2 text-xs font-semibold tracking-widest",
              group.featured ? "text-sand-dark" : "text-neutral-500"
            )}
          >
            {group.featured && <Sparkles className="mr-1 inline h-3 w-3" />}
            {group.label}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.items.map((id) => (
              <Button
                key={id}
                size="sm"
                variant={subcat === id ? "default" : "secondary"}
                onClick={() => onSubcat(subcat === id ? "all" : id)}
              >
                {labelFor(id)}
              </Button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
