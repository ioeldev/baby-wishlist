import { Euro } from "lucide-react";
import type { CategoryWithItems } from "../types";

type Props = {
    categories: CategoryWithItems[];
    variant?: "admin" | "public";
};

export function ProgressBar({ categories, variant = "admin" }: Props) {
    const items = categories.flatMap((category) => category.items);
    const total = items.length;
    const reserved = items.filter((item) => item.is_reserved).length;
    const percent = total === 0 ? 0 : Math.round((reserved / total) * 100);
    const estimated = items.reduce((sum, item) => sum + (item.price_estimate ?? 0), 0);
    const reservedBudget = items
        .filter((item) => item.is_reserved)
        .reduce((sum, item) => sum + (item.price_estimate ?? 0), 0);

    return (
        <div className="relative z-10">
            <div className="bg-primary-light text-text-primary">
                <div className="mx-auto flex max-w-[1140px] items-center gap-3 px-6 py-2.5">
                    <span className="shrink-0 whitespace-nowrap text-xs font-semibold">
                        {reserved}/{total} réservés
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-medium">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-700"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <span className="shrink-0 text-xs font-bold">{percent}%</span>
                </div>
                {variant === "admin" ? (
                    <div className="border-t border-[oklch(86%_0.09_295)] bg-[oklch(94%_0.06_295_/_0.88)]">
                        <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-end gap-2 px-6 py-2 text-[13px] text-text-secondary">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                                <Euro className="h-3.5 w-3.5 text-[oklch(58%_0.12_295)]" aria-hidden="true" />
                                {reservedBudget.toFixed(0)} / {estimated.toFixed(0)} ₪
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
