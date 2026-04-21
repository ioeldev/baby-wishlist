import { Euro } from "lucide-react";
import type { CategoryWithItems } from "../types";

type Props = {
  categories: CategoryWithItems[];
};

export function ProgressBar({ categories }: Props) {
  const items = categories.flatMap(category => category.items);
  const total = items.length;
  const reserved = items.filter(item => item.is_reserved).length;
  const percent = total === 0 ? 0 : Math.round((reserved / total) * 100);
  const estimated = items.reduce((sum, item) => sum + (item.price_estimate ?? 0), 0);
  const reservedBudget = items.filter(item => item.is_reserved).reduce((sum, item) => sum + (item.price_estimate ?? 0), 0);

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{reserved}/{total} articles réservés</p>
            <p className="text-xs text-slate-500">{percent}% de la wishlist réservé</p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <Euro className="h-4 w-4" />
            <span>{reservedBudget.toFixed(0)} / {estimated.toFixed(0)}</span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
