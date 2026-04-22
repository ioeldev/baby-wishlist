import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CategoryWithItems, Item } from "../types";
import { Butterfly } from "./Butterflies";
import { ItemCard } from "./ItemCard";

type Props = {
  category: CategoryWithItems;
  admin?: boolean;
  onOffer?: (item: Item) => void;
  onAddLink?: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onDeleteLink?: (id: number) => void;
  onClearReservation?: (item: Item) => void;
};

export function CategorySection(props: Props) {
  const { category, admin = false } = props;
  const [open, setOpen] = useState(true);
  const total = category.items.length;
  const reserved = category.items.filter(item => item.is_reserved).length;
  const percent = total === 0 ? 0 : Math.round((reserved / total) * 100);

  if (!admin) {
    return (
      <section className="mb-13">
        <div className="mb-[22px] flex items-center gap-3.5">
          <div className="h-px flex-1 bg-gradient-to-r from-[oklch(80%_0.12_295)] to-transparent" />
          <div className="flex min-w-0 items-center gap-2">
            <Butterfly index={category.id} size={28} className="shrink-0 opacity-75" />
            <h2 className="min-w-0 text-center font-['Cormorant_Garamond'] text-xl font-medium leading-tight text-[oklch(38%_0.18_295)]">
              {category.name}
            </h2>
            <Butterfly index={category.id + 1} size={28} className="shrink-0 scale-x-[-1] opacity-75" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-[oklch(80%_0.12_295)] to-transparent" />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {category.items.map(item => (
            <ItemCard key={item.id} item={item} {...props} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="mb-[22px] flex min-w-0 items-center gap-2">
        <div className="h-px min-w-[12px] flex-1 bg-gradient-to-r from-[oklch(80%_0.12_295)] to-transparent" />
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          className="flex min-w-0 max-w-full flex-1 items-center justify-center gap-2 text-left"
        >
          <Butterfly index={category.id} size={28} className="shrink-0 opacity-75" />
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="min-w-0 font-['Cormorant_Garamond'] text-xl font-medium leading-tight text-[oklch(38%_0.18_295)]">
              {category.name}
            </h2>
            <p className="mt-0.5 text-center text-xs font-semibold text-[oklch(55%_0.10_295)] sm:text-left">
              {reserved}/{total} réservés · {percent}%
            </p>
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-[oklch(55%_0.10_295)] transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        <div className="h-px min-w-[12px] flex-1 bg-gradient-to-l from-[oklch(80%_0.12_295)] to-transparent" />
      </div>
      {open ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {category.items.map(item => (
            <ItemCard key={item.id} item={item} {...props} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
