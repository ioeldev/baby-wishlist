import { ExternalLink, Gift, ImagePlus, LinkIcon, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { Item } from "../types";
import { useLocalizeItem, useTranslation } from "../i18n";
import { Butterfly } from "./Butterflies";
import { Button } from "./ui";

type Props = {
    item: Item;
    admin?: boolean;
    onOffer?: (item: Item) => void;
    onAddLink?: (item: Item) => void;
    onAddFallbackImage?: (item: Item) => void;
    uploadingFallbackImageItemId?: number | null;
    onEdit?: (item: Item) => void;
    onDelete?: (item: Item) => void;
    onDeleteLink?: (id: number) => void;
    onDeleteFallbackImage?: (item: Item) => void;
    onClearReservation?: (item: Item) => void;
};

export function ItemCard({
    item,
    admin = false,
    onOffer,
    onAddLink,
    onAddFallbackImage,
    uploadingFallbackImageItemId,
    onEdit,
    onDelete,
    onDeleteLink,
    onDeleteFallbackImage,
    onClearReservation,
}: Props) {
    if (!admin) {
        return <PublicItemCard item={item} onOffer={onOffer} />;
    }

    const reserved = item.is_reserved;

    return <AdminItemCard item={item} reserved={reserved} onAddLink={onAddLink} onAddFallbackImage={onAddFallbackImage} uploadingFallbackImageItemId={uploadingFallbackImageItemId} onEdit={onEdit} onDelete={onDelete} onDeleteLink={onDeleteLink} onDeleteFallbackImage={onDeleteFallbackImage} onClearReservation={onClearReservation} />;
}

function AdminItemCard({ item, reserved, onAddLink, onAddFallbackImage, uploadingFallbackImageItemId, onEdit, onDelete, onDeleteLink, onDeleteFallbackImage, onClearReservation }: {
    item: Item;
    reserved: boolean;
    onAddLink?: (item: Item) => void;
    onAddFallbackImage?: (item: Item) => void;
    uploadingFallbackImageItemId?: number | null;
    onEdit?: (item: Item) => void;
    onDelete?: (item: Item) => void;
    onDeleteLink?: (id: number) => void;
    onDeleteFallbackImage?: (item: Item) => void;
    onClearReservation?: (item: Item) => void;
}) {
    const { t } = useTranslation();
    const { localName, localNote } = useLocalizeItem();

    return (
        <article
            className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border-[1.5px] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-card ${
                reserved ? "border-reserved-border bg-[oklch(96%_0.03_295)]" : "border-border bg-white"
            }`}
        >
            <ItemImage item={item} onDeleteFallbackImage={onDeleteFallbackImage} />
            <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-1.5">
                    <h3
                        className={`line-clamp-2 min-w-0 flex-1 text-pretty font-heading text-[17px] font-semibold leading-tight sm:text-[19px] ${
                            reserved ? "text-text-tertiary" : "text-text-primary"
                        }`}
                    >
                        {localName(item)}
                    </h3>
                    {reserved ? (
                        <span className="shrink-0 rounded-full bg-reserved px-2 py-0.5 text-[9px] font-bold tracking-[0.04em] text-reserved-text">
                            {t("itemCard.reserved_badge")}
                        </span>
                    ) : null}
                </div>

                {localNote(item) ? (
                    <p className="line-clamp-2 text-[12px] italic leading-snug text-text-tertiary">{localNote(item)}</p>
                ) : null}

                <div className="grid min-h-6 grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5 text-[10px]">
                    <div className="flex min-w-0 flex-wrap items-center gap-1">
                        {item.reserved_first_name && item.reserved_last_name ? (
                            <span className="max-w-full truncate rounded-full bg-border px-2 py-0.5 font-bold text-text-primary">
                                {item.reserved_first_name} {item.reserved_last_name}
                            </span>
                        ) : null}
                        {item.assigned_to ? (
                            <span className="max-w-full truncate rounded-full bg-[oklch(95%_0.05_200)] px-2 py-0.5 font-bold text-[oklch(42%_0.10_200)]">
                                {item.assigned_to}
                            </span>
                        ) : null}
                    </div>
                    {item.price_estimate !== null ? (
                        <span className="shrink-0 whitespace-nowrap text-right font-heading text-xs font-medium text-price sm:text-sm">
                            ~{item.price_estimate} ₪
                        </span>
                    ) : (
                        <span />
                    )}
                </div>

                {item.links.length > 0 ? (
                    <div className="grid gap-1">
                        {item.links.map((link) => (
                            <div
                                key={link.id}
                                className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-md border border-border bg-[oklch(95%_0.03_295)] px-2 py-1.5"
                            >
                                {link.image ? (
                                    <img src={link.image} alt="" className="h-7 w-7 shrink-0 rounded object-cover" />
                                ) : (
                                    <span className="text-xs">🛍️</span>
                                )}
                                <a href={link.url} target="_blank" rel="noreferrer" className="min-w-0 no-underline">
                                    <span className="block truncate text-[11px] font-semibold text-text-primary">
                                        {link.title ?? link.shop_name ?? link.url}
                                    </span>
                                    {link.shop_name ? (
                                        <span className="block truncate text-[10px] text-text-tertiary">
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
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                    {onDeleteLink ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDeleteLink(link.id)}
                                            className="h-6 w-6 text-text-tertiary hover:bg-bg-lighter"
                                            aria-label={t("itemCard.delete_link_label")}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2">
                    {onAddFallbackImage ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onAddFallbackImage(item)}
                            disabled={uploadingFallbackImageItemId === item.id}
                            icon={<ImagePlus className="h-3.5 w-3.5" />}
                            className="min-w-0 px-2 py-1.5 text-[11px]"
                        >
                            {uploadingFallbackImageItemId === item.id ? t("itemCard.image_button_busy") : t("itemCard.image_button")}
                        </Button>
                    ) : null}
                    {onAddLink ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onAddLink(item)}
                            icon={<LinkIcon className="h-3.5 w-3.5" />}
                            className="min-w-0 px-2 py-1.5 text-[11px]"
                        >
                            {t("itemCard.link_button")}
                        </Button>
                    ) : null}
                    {onEdit ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onEdit(item)}
                            icon={<Pencil className="h-3.5 w-3.5" />}
                            className="min-w-0 px-2 py-1.5 text-[11px]"
                        >
                            {t("itemCard.edit_button")}
                        </Button>
                    ) : null}
                    {reserved && onClearReservation ? (
                        <Button
                            size="sm"
                            variant="wishlistSecondary"
                            onClick={() => onClearReservation(item)}
                            icon={<RotateCcw className="h-3.5 w-3.5" />}
                            className="min-w-0 px-2 py-1.5 text-[11px]"
                        >
                            {t("itemCard.release_button")}
                        </Button>
                    ) : null}
                    {onDelete ? (
                        <Button
                            size="sm"
                            variant="wishlistDanger"
                            onClick={() => onDelete(item)}
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            className="min-w-0 px-2 py-1.5 text-[11px]"
                        >
                            {t("itemCard.delete_button")}
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function ItemImage({ item, onDeleteFallbackImage }: { item: Item; onDeleteFallbackImage?: (item: Item) => void }) {
    const { t } = useTranslation();
    const { localName } = useLocalizeItem();
    const [failed, setFailed] = useState(false);
    const scrapedImage = item.links.find((link) => link.image)?.image;
    const displayImage = item.fallback_image && !failed ? item.fallback_image : scrapedImage;

    if (displayImage) {
        return (
            <div className="relative h-[150px] overflow-hidden rounded-t-2xl bg-[oklch(97%_0.02_295)] sm:h-[180px]">
                <img
                    src={displayImage}
                    alt={localName(item)}
                    onError={() => setFailed(true)}
                    className="h-full w-full object-contain p-2.5 transition duration-300 sm:p-3"
                />
                {item.fallback_image && onDeleteFallbackImage ? (
                    <Button
                        type="button"
                        variant="wishlistDanger"
                        size="icon"
                        onClick={() => onDeleteFallbackImage(item)}
                        className="absolute right-3 top-3 h-8 w-8 shadow-sm"
                        aria-label={t("itemCard.delete_fallback_image_label")}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                ) : null}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[oklch(97%_0.02_295_/_0.6)]" />
            </div>
        );
    }

    return (
        <div className="img-placeholder relative flex h-[150px] items-center justify-center overflow-hidden rounded-t-2xl sm:h-[180px]">
            <Butterfly index={item.id} size={78} className="absolute opacity-15 sm:size-[90px]" />
            <span className="relative font-mono text-[11px] tracking-[0.04em] text-primary opacity-70">
                {t("itemCard.product_photo")}
            </span>
        </div>
    );
}

function PublicItemCard({ item, onOffer }: { item: Item; onOffer?: (item: Item) => void }) {
    const { t } = useTranslation();
    const { localName, localNote } = useLocalizeItem();
    const reserved = item.is_reserved;
    const detailPath = `/item/${item.id}`;

    return (
        <Link
            to={detailPath}
            className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border-[1.5px] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_36px_oklch(55%_0.15_295_/_0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                reserved ? "border-reserved-border bg-[oklch(96%_0.03_295)]" : "border-border bg-white"
            }`}
        >
            <article className="flex min-h-0 flex-1 flex-col">
                <div className="pointer-events-none">
                    <ItemImage item={item} />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 sm:p-4">
                    <div className="pointer-events-none flex items-start justify-between gap-1.5">
                        <h3
                            className={`line-clamp-2 min-w-0 flex-1 text-pretty font-heading text-[17px] font-semibold leading-tight sm:text-[19px] ${
                                reserved ? "text-text-tertiary" : "text-text-primary"
                            }`}
                        >
                            {localName(item)}
                        </h3>
                        {reserved ? (
                            <span className="shrink-0 rounded-full bg-reserved px-2 py-0.5 text-[9px] font-bold tracking-[0.04em] text-reserved-text">
                                {t("itemCard.reserved_badge")}
                            </span>
                        ) : null}
                        {!reserved && item.assigned_to ? (
                            <span className="max-w-[42%] shrink-0 truncate rounded-full bg-border px-2 py-0.5 text-[9px] font-bold text-text-primary">
                                {item.assigned_to}
                            </span>
                        ) : null}
                    </div>

                    {localNote(item) ? (
                        <p className="pointer-events-none line-clamp-2 text-[12px] italic leading-snug text-text-tertiary">
                            {localNote(item)}
                        </p>
                    ) : null}

                    {item.links.length > 0 ? (
                        <div className="grid gap-1">
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
                                    className="grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-md border border-border bg-[oklch(95%_0.03_295)] px-2 py-1.5 transition hover:border-border-medium"
                                >
                                    <span className="text-xs" aria-hidden="true">
                                        🛍️
                                    </span>
                                    <span className="min-w-0 truncate text-[11px] font-semibold text-text-primary">
                                        {link.title ?? link.shop_name ?? link.url}
                                    </span>
                                    {link.price ? (
                                        <span className="shrink-0 text-[10px] font-bold text-price">{link.price}</span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        {item.price_estimate !== null ? (
                            <span className="shrink-0 font-heading text-[18px] font-medium text-price sm:text-[20px]">
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
                                className="ml-auto inline-flex min-h-9 min-w-9 items-center justify-center gap-1 whitespace-nowrap rounded-lg border-0 bg-gradient-to-br from-primary to-primary-dark px-3 py-2 text-[12px] font-bold leading-none text-white shadow-md"
                            >
                                <Gift className="h-3.5 w-3.5" />
                                {t("itemCard.offer_button")}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="ml-auto min-h-9 whitespace-nowrap rounded-lg border-[1.5px] border-reserved-border bg-transparent px-3 py-2 text-[11px] font-semibold leading-none text-[oklch(45%_0.12_295)]"
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
