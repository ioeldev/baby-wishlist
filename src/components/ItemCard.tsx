import { ExternalLink, Gift, LinkIcon, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { Item } from "../types";
import { useTranslation } from "../i18n";
import { Butterfly } from "./Butterflies";
import { Button } from "./ui";

type Props = {
    item: Item;
    admin?: boolean;
    onOffer?: (item: Item) => void;
    onAddLink?: (item: Item) => void;
    onEdit?: (item: Item) => void;
    onDelete?: (item: Item) => void;
    onDeleteLink?: (id: number) => void;
    onClearReservation?: (item: Item) => void;
};

export function ItemCard({
    item,
    admin = false,
    onOffer,
    onAddLink,
    onEdit,
    onDelete,
    onDeleteLink,
    onClearReservation,
}: Props) {
    if (!admin) {
        return <PublicItemCard item={item} onOffer={onOffer} />;
    }

    const reserved = item.is_reserved;

    return <AdminItemCard item={item} reserved={reserved} onAddLink={onAddLink} onEdit={onEdit} onDelete={onDelete} onDeleteLink={onDeleteLink} onClearReservation={onClearReservation} />;
}

function AdminItemCard({ item, reserved, onAddLink, onEdit, onDelete, onDeleteLink, onClearReservation }: {
    item: Item;
    reserved: boolean;
    onAddLink?: (item: Item) => void;
    onEdit?: (item: Item) => void;
    onDelete?: (item: Item) => void;
    onDeleteLink?: (id: number) => void;
    onClearReservation?: (item: Item) => void;
}) {
    const { t } = useTranslation();

    return (
        <article
            className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border-[1.5px] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-card ${
                reserved ? "border-reserved-border bg-[oklch(96%_0.03_295)]" : "border-border bg-white"
            }`}
        >
            <ItemImage item={item} />
            <div className="flex flex-1 flex-col gap-2.5 p-5 pb-4 sm:px-[22px]">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        className={`min-w-0 flex-1 text-pretty font-heading text-[21px] font-semibold leading-tight ${
                            reserved ? "text-text-tertiary" : "text-text-primary"
                        }`}
                    >
                        {item.name}
                    </h3>
                    {reserved ? (
                        <span className="shrink-0 rounded-full bg-reserved px-2.5 py-1 text-[10px] font-bold tracking-[0.05em] text-reserved-text">
                            {t("itemCard.reserved_badge")}
                        </span>
                    ) : null}
                </div>

                {item.note ? (
                    <p className="text-[13px] italic leading-relaxed text-text-tertiary">{item.note}</p>
                ) : null}

                <div className="grid min-h-7 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-[11px]">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {item.reserved_first_name && item.reserved_last_name ? (
                            <span className="max-w-full truncate rounded-full bg-border px-2.5 py-1 font-bold text-text-primary">
                                {item.reserved_first_name} {item.reserved_last_name}
                            </span>
                        ) : null}
                        {item.assigned_to ? (
                            <span className="max-w-full truncate rounded-full bg-[oklch(95%_0.05_200)] px-2.5 py-1 font-bold text-[oklch(42%_0.10_200)]">
                                {item.assigned_to}
                            </span>
                        ) : null}
                    </div>
                    {item.price_estimate !== null ? (
                        <span className="shrink-0 whitespace-nowrap pt-0.5 text-right font-heading text-sm font-medium text-price">
                            ~{item.price_estimate} ₪
                        </span>
                    ) : (
                        <span />
                    )}
                </div>

                {item.links.length > 0 ? (
                    <div className="grid gap-1.5">
                        {item.links.map((link) => (
                            <div
                                key={link.id}
                                className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-[oklch(95%_0.03_295)] px-2.5 py-2"
                            >
                                {link.image ? (
                                    <img src={link.image} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                                ) : (
                                    <span className="text-[13px]">🛍️</span>
                                )}
                                <a href={link.url} target="_blank" rel="noreferrer" className="min-w-0 no-underline">
                                    <span className="block truncate text-xs font-semibold text-text-primary">
                                        {link.title ?? link.shop_name ?? link.url}
                                    </span>
                                    {link.shop_name ? (
                                        <span className="block truncate text-[11px] text-text-tertiary">
                                            {link.shop_name}
                                        </span>
                                    ) : null}
                                </a>
                                <div className="flex shrink-0 items-center gap-0.5">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-text-tertiary hover:text-text-primary"
                                        aria-label={t("itemCard.open_link_label")}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                    {onDeleteLink ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDeleteLink(link.id)}
                                            className="h-7 w-7 text-text-tertiary hover:bg-bg-lighter"
                                            aria-label={t("itemCard.delete_link_label")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                    {onAddLink ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onAddLink(item)}
                            icon={<LinkIcon className="h-4 w-4" />}
                            className="w-full min-w-0 sm:w-auto"
                        >
                            {t("itemCard.link_button")}
                        </Button>
                    ) : null}
                    {onEdit ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onEdit(item)}
                            icon={<Pencil className="h-4 w-4" />}
                            className="w-full min-w-0 sm:w-auto"
                        >
                            {t("itemCard.edit_button")}
                        </Button>
                    ) : null}
                    {reserved && onClearReservation ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onClearReservation(item)}
                            icon={<RotateCcw className="h-4 w-4" />}
                            className="w-full min-w-0 sm:w-auto"
                        >
                            {t("itemCard.release_button")}
                        </Button>
                    ) : null}
                    {onDelete ? (
                        <Button
                            size="sm"
                            variant="wishlistDanger"
                            onClick={() => onDelete(item)}
                            icon={<Trash2 className="h-4 w-4" />}
                            className="w-full min-w-0 sm:w-auto"
                        >
                            {t("itemCard.delete_button")}
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function ItemImage({ item }: { item: Item }) {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(false);
    const image = item.links.find((link) => link.image)?.image;

    if (image && !failed) {
        return (
            <div className="relative h-[200px] overflow-hidden rounded-t-[18px] bg-[oklch(97%_0.02_295)]">
                <img
                    src={image}
                    alt={item.name}
                    onError={() => setFailed(true)}
                    className="h-full w-full object-contain p-3 transition duration-300"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[oklch(97%_0.02_295_/_0.6)]" />
            </div>
        );
    }

    return (
        <div className="img-placeholder relative flex h-[200px] items-center justify-center overflow-hidden rounded-t-[18px]">
            <Butterfly index={item.id} size={90} className="absolute opacity-15" />
            <span className="relative font-mono text-[11px] tracking-[0.04em] text-primary opacity-70">
                {t("itemCard.product_photo")}
            </span>
        </div>
    );
}

function PublicItemCard({ item, onOffer }: { item: Item; onOffer?: (item: Item) => void }) {
    const { t } = useTranslation();
    const reserved = item.is_reserved;
    const detailPath = `/item/${item.id}`;

    return (
        <Link
            to={detailPath}
            className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border-[1.5px] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_36px_oklch(55%_0.15_295_/_0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                reserved ? "border-reserved-border bg-[oklch(96%_0.03_295)]" : "border-border bg-white"
            }`}
        >
            <article className="flex min-h-0 flex-1 flex-col">
                <div className="pointer-events-none">
                    <ItemImage item={item} />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-5 pb-4 sm:px-[22px]">
                    <div className="pointer-events-none flex items-start justify-between gap-2">
                        <h3
                            className={`min-w-0 flex-1 text-pretty font-heading text-[21px] font-semibold leading-tight ${
                                reserved ? "text-text-tertiary" : "text-text-primary"
                            }`}
                        >
                            {item.name}
                        </h3>
                        {reserved ? (
                            <span className="shrink-0 rounded-full bg-reserved px-2.5 py-1 text-[10px] font-bold tracking-[0.05em] text-reserved-text">
                                {t("itemCard.reserved_badge")}
                            </span>
                        ) : null}
                        {!reserved && item.assigned_to ? (
                            <span className="max-w-[45%] shrink-0 truncate rounded-full bg-border px-2.5 py-1 text-[10px] font-bold text-text-primary">
                                {item.assigned_to}
                            </span>
                        ) : null}
                    </div>

                    {item.note ? (
                        <p className="line-clamp-2 text-[13px] italic leading-relaxed text-text-tertiary pointer-events-none">
                            {item.note}
                        </p>
                    ) : null}

                    {item.links.length > 0 ? (
                        <div className="grid gap-1.5">
                            {item.links.map((link) => (
                                <div
                                    key={link.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        window.open(link.url, "_blank", "noreferrer");
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            window.open(link.url, "_blank", "noreferrer");
                                        }
                                    }}
                                    className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-[oklch(95%_0.03_295)] px-2.5 py-2 transition hover:border-border-medium cursor-pointer"
                                >
                                    <span className="text-[13px]" aria-hidden="true">
                                        🛍️
                                    </span>
                                    <span className="min-w-0 truncate text-xs font-semibold text-text-primary">
                                        {link.title ?? link.shop_name ?? link.url}
                                    </span>
                                    {link.price ? (
                                        <span className="shrink-0 text-[11px] font-bold text-price">{link.price}</span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        {item.price_estimate !== null ? (
                            <span className="shrink-0 font-heading text-[22px] font-medium text-price">
                                ~{item.price_estimate} ₪
                            </span>
                        ) : (
                            <span />
                        )}
                        {!reserved && onOffer ? (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    onOffer(item);
                                }}
                                className="ml-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-0 bg-gradient-to-br from-primary to-primary-dark px-[18px] py-2.5 text-[13px] font-bold leading-none text-white shadow-md"
                            >
                                <Gift className="h-4 w-4" />
                                {t("itemCard.offer_button")}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="ml-auto min-h-[44px] whitespace-nowrap rounded-xl border-[1.5px] border-reserved-border bg-transparent px-[18px] py-2.5 text-xs font-semibold leading-none text-[oklch(45%_0.12_295)]"
                            >
                                {t("itemCard.already_reserved")}
                            </button>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
