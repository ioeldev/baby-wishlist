import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CategoryWithItems, Item } from "../types";
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
  const { category } = props;
  const [open, setOpen] = useState(true);
  const total = category.items.length;
  const reserved = category.items.filter(item => item.is_reserved).length;
  const percent = total === 0 ? 0 : Math.round((reserved / total) * 100);

  return (
    <section className="border-b border-slate-200 py-5">
      <button type="button" onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{category.name}</h2>
          <p className="text-sm text-slate-500">{reserved}/{total} articles réservés</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{percent}%</span>
          <ChevronDown className={`h-5 w-5 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open ? (
        <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-2">
          {category.items.map(item => (
            <ItemCard key={item.id} item={item} {...props} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
