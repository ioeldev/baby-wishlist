import type { CategoryWithItems } from "../types";
import { useTranslation, type Locale } from "../i18n";

type Props = {
    categories: CategoryWithItems[];
    variant?: "admin" | "public";
};

const LOCALE_OPTIONS: Array<{ value: Locale; label: string }> = [
    { value: "fr", label: "FR" },
    { value: "he", label: "HE" },
];

export function ProgressBar({ categories, variant = "admin" }: Props) {
    const { t, locale, setLocale } = useTranslation();
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
                        {t("progressBar.reserved_count", { reserved, total })}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-medium">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-700"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <span className="shrink-0 text-xs font-bold">{percent}%</span>
                    <div
                        className="ml-1 flex shrink-0 items-center gap-0.5 rounded-full border border-[oklch(82%_0.10_295)] bg-white/70 p-0.5"
                        aria-label={t("languageSelector.label")}
                    >
                        {LOCALE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setLocale(opt.value)}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none transition ${
                                    locale === opt.value
                                        ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm"
                                        : "text-[oklch(50%_0.12_295)] hover:text-[oklch(38%_0.18_295)]"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                {variant === "admin" ? (
                    <div className="border-t border-[oklch(86%_0.09_295)] bg-[oklch(94%_0.06_295_/_0.88)]">
                        <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-end gap-2 px-6 py-2 text-[13px] text-text-secondary">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                                {reservedBudget.toFixed(0)} / {estimated.toFixed(0)} ₪
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
