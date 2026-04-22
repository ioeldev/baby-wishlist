import { ArrowLeft, ExternalLink, Gift, Sparkles } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Butterfly } from "../components/Butterflies";
import { OfferModal } from "../components/OfferModal";
import { ProgressBar } from "../components/ProgressBar";
import { WishlistPageFooter, WishlistPageShell } from "../components/wishlist";
import { Notice } from "../components/ui";
import { findItemInWishlist, getPrimaryItemImageUrl } from "../lib/itemHelpers";
import { useReserveItem, useWishlist } from "../hooks/useWishlist";
import type { Item, ItemLink, ReserveItemInput } from "../types";

function DetailHeroImage({ item, alt }: { item: Item; alt: string }) {
    const [failed, setFailed] = useState(false);
    const url = getPrimaryItemImageUrl(item);

    if (url && !failed) {
        return (
            <div className="relative aspect-[4/3] w-full max-h-[min(52vh,520px)] overflow-hidden rounded-[24px] shadow-[0_12px_48px_oklch(55%_0.12_295_/_0.12)]">
                <img
                    src={url}
                    alt={alt}
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover animate-detail-hero"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(22%_0.08_295_/_0.35)] via-transparent to-[oklch(22%_0.06_295_/_0.12)]" />
            </div>
        );
    }

    return (
        <div className="img-placeholder relative flex aspect-[4/3] max-h-[min(52vh,520px)] w-full items-center justify-center overflow-hidden rounded-[24px] shadow-inner">
            <Butterfly index={item.id} size={120} className="absolute opacity-20" />
            <span className="relative font-mono text-xs tracking-[0.08em] text-[oklch(68%_0.16_295)] opacity-80">
                photo produit
            </span>
        </div>
    );
}

function ShopLinkCard({ link, index }: { link: ItemLink; index: number }) {
    const delay = `${100 + index * 70}ms`;
    return (
        <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            style={{ animationDelay: delay }}
            className="group flex gap-4 rounded-[18px] border-[1.5px] border-[oklch(92%_0.07_295)] bg-white p-4 shadow-[0_2px_12px_oklch(55%_0.08_295_/_0.06)] transition duration-200 animate-detail-in hover:-translate-y-0.5 hover:border-[oklch(82%_0.12_295)] hover:shadow-[0_8px_28px_oklch(55%_0.12_295_/_0.1)]"
        >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[oklch(96%_0.03_295)]">
                {link.image ? (
                    <img
                        src={link.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center text-2xl">🛍️</div>
                )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="font-['Cormorant_Garamond'] text-lg font-semibold leading-snug text-[oklch(38%_0.18_295)] group-hover:text-[oklch(45%_0.16_295)]">
                    {link.title ?? link.shop_name ?? "Voir l’offre"}
                </p>
                {link.shop_name ? <p className="text-sm text-[oklch(52%_0.10_295)]">{link.shop_name}</p> : null}
                {link.price ? <p className="mt-0.5 text-sm font-bold text-[oklch(52%_0.16_82)]">{link.price}</p> : null}
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[oklch(58%_0.14_295)]">
                    Ouvrir le lien
                    <ExternalLink className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
            </div>
        </a>
    );
}

export function PublicItemDetailPage() {
    const { id: idParam } = useParams();
    const wishlist = useWishlist(false, true);
    const reserveItem = useReserveItem();
    const [offerItem, setOfferItem] = useState<Item | null>(null);

    const itemId = idParam ? Number(idParam) : NaN;
    const categories = wishlist.data ?? [];

    const resolved = useMemo(() => {
        if (!Number.isFinite(itemId) || itemId < 1) return null;
        return findItemInWishlist(categories, itemId);
    }, [categories, itemId]);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [idParam]);

    async function handleReserve(input: ReserveItemInput) {
        if (!offerItem) return;
        await reserveItem.mutateAsync({ id: offerItem.id, input });
        setOfferItem(null);
    }

    if (wishlist.isLoading) {
        return (
            <WishlistPageShell>
                <div className="flex min-h-[50vh] items-center justify-center px-6">
                    <p className="text-[oklch(45%_0.10_295)]">Chargement...</p>
                </div>
            </WishlistPageShell>
        );
    }

    if (wishlist.error) {
        return (
            <WishlistPageShell>
                <div className="mx-auto max-w-lg px-6 py-20">
                    <Notice tone="error" className="p-5">
                        {wishlist.error.message}
                    </Notice>
                    <Link
                        to="/"
                        className="mt-4 inline-block text-sm font-semibold text-[oklch(55%_0.16_295)] underline-offset-2 hover:underline"
                    >
                        Retour à la liste
                    </Link>
                </div>
            </WishlistPageShell>
        );
    }

    if (!resolved) {
        return (
            <WishlistPageShell>
                <div className="mx-auto max-w-lg px-6 py-20 text-center">
                    <div className="mb-4 flex justify-center">
                        <Butterfly index={0} size={64} className="opacity-40" />
                    </div>
                    <h1 className="font-['Cormorant_Garamond'] text-2xl text-[oklch(45%_0.12_295)]">
                        Article introuvable
                    </h1>
                    <p className="mt-2 text-sm text-[oklch(50%_0.10_295)]">
                        Ce cadeau n’existe pas ou n’est plus sur la liste.
                    </p>
                    <Link
                        to="/"
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[oklch(68%_0.16_295)] to-[oklch(52%_0.20_295)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_oklch(52%_0.20_295_/_0.3)]"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Retour à la liste
                    </Link>
                </div>
            </WishlistPageShell>
        );
    }

    const { item, categoryName } = resolved;
    const reserved = item.is_reserved;

    return (
        <WishlistPageShell>
            <ProgressBar categories={categories} variant="public" />

            <div className="relative z-[1] mx-auto w-full max-w-[800px] px-4 pb-28 sm:px-6 sm:pb-20">
                <header className="animate-detail-in">
                    <nav className="flex flex-wrap items-center gap-2 py-4 text-sm" aria-label="Fil d’Ariane">
                        <Link
                            to="/"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[oklch(88%_0.10_295)] bg-white/80 px-3.5 text-[oklch(45%_0.12_295)] shadow-sm backdrop-blur transition hover:border-[oklch(80%_0.12_295)] hover:text-[oklch(32%_0.18_295)]"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="max-sm:sr-only">Liste</span>
                        </Link>
                        <span className="text-[oklch(70%_0.08_295)]" aria-hidden="true">
                            /
                        </span>
                        <span
                            className="min-w-0 max-w-[40vw] truncate font-medium text-[oklch(50%_0.10_295)]"
                            title={categoryName}
                        >
                            {categoryName}
                        </span>
                        <span className="text-[oklch(70%_0.08_295)]" aria-hidden="true">
                            /
                        </span>
                        <span className="min-w-0 truncate text-[oklch(40%_0.12_295)]" title={item.name}>
                            Fiche
                        </span>
                    </nav>
                </header>

                <article>
                    <div style={{ animationDelay: "50ms" }} className="animate-detail-in">
                        <DetailHeroImage item={item} alt={item.name} />
                    </div>

                    <div style={{ animationDelay: "120ms" }} className="mt-8 animate-detail-in">
                        <div className="mb-3 flex flex-wrap items-start gap-3">
                            <h1 className="min-w-0 flex-1 font-['Cormorant_Garamond'] text-[clamp(28px,5vw,40px)] font-medium leading-tight text-[oklch(38%_0.18_295)]">
                                {item.name}
                            </h1>
                            {reserved ? (
                                <span className="shrink-0 rounded-full bg-reserved px-3.5 py-1.5 text-xs font-bold tracking-[0.04em] text-reserved-text">
                                    Réservé
                                </span>
                            ) : null}
                            {!reserved && item.assigned_to ? (
                                <span className="shrink-0 max-w-full rounded-full bg-[oklch(92%_0.07_295)] px-3.5 py-1.5 text-xs font-bold text-[oklch(38%_0.18_295)]">
                                    {item.assigned_to}
                                </span>
                            ) : null}
                        </div>

                        {item.note ? (
                            <p className="text-[16px] leading-relaxed text-[oklch(45%_0.10_295)] [text-wrap:pretty]">
                                {item.note}
                            </p>
                        ) : null}

                        {item.price_estimate !== null ? (
                            <p className="mt-5 font-['Cormorant_Garamond'] text-3xl font-medium text-[oklch(55%_0.14_82)]">
                                ~{item.price_estimate} ₪
                            </p>
                        ) : null}
                    </div>

                    {item.links.length > 0 ? (
                        <section
                            style={{ animationDelay: "200ms" }}
                            className="mt-10 animate-detail-in"
                            aria-labelledby="shop-links-heading"
                        >
                            <h2
                                id="shop-links-heading"
                                className="mb-4 flex items-center gap-2 font-['Cormorant_Garamond'] text-[22px] font-medium text-[oklch(38%_0.18_295)]"
                            >
                                <Sparkles className="h-5 w-5 text-[oklch(70%_0.14_82)]" aria-hidden="true" />
                                Où l’acheter
                            </h2>
                            <p className="mb-4 text-sm text-[oklch(50%_0.10_295)]">
                                Liens vérifiés par les parents — ouvrez-les pour voir le détail, la taille, les
                                couleurs, etc.
                            </p>
                            <ul className="grid gap-3">
                                {item.links.map((link, i) => (
                                    <li key={link.id}>
                                        <ShopLinkCard link={link} index={i} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : (
                        <p
                            style={{ animationDelay: "200ms" }}
                            className="mt-8 text-sm italic text-[oklch(55%_0.10_295)] animate-detail-in"
                        >
                            Aucun lien boutique pour l’instant — revenez plus tard.
                        </p>
                    )}

                    {!reserved ? (
                        <div className="mt-8 hidden sm:block" style={{ animationDelay: "280ms" }}>
                            <button
                                type="button"
                                onClick={() => setOfferItem(item)}
                                className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[oklch(68%_0.16_295)] to-[oklch(52%_0.20_295)] py-4 text-base font-bold text-white shadow-[0_6px_24px_oklch(52%_0.20_295_/_0.35)] transition hover:opacity-[0.97] active:scale-[0.99] animate-detail-in"
                            >
                                <Gift className="h-5 w-5" aria-hidden="true" />
                                Offrir ce cadeau
                            </button>
                        </div>
                    ) : null}
                    {reserved ? (
                        <p
                            style={{ animationDelay: "240ms" }}
                            className="mt-8 text-center text-sm text-[oklch(45%_0.12_295)] animate-detail-in"
                        >
                            Ce cadeau a déjà été choisi. Merci de votre générosité !
                        </p>
                    ) : null}
                </article>
            </div>

            {!reserved ? (
                <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
                    <div className="pointer-events-auto mx-auto max-w-[800px]">
                        <button
                            type="button"
                            onClick={() => setOfferItem(item)}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[oklch(68%_0.16_295)] to-[oklch(52%_0.20_295)] py-4 text-base font-bold text-white shadow-[0_8px_32px_oklch(52%_0.20_295_/_0.45)]"
                        >
                            <Gift className="h-5 w-5" aria-hidden="true" />
                            Offrir ce cadeau
                        </button>
                    </div>
                </div>
            ) : null}

            <WishlistPageFooter message="Merci pour votre amour et vos cadeaux" />

            <OfferModal item={offerItem} onClose={() => setOfferItem(null)} onReserve={handleReserve} />
        </WishlistPageShell>
    );
}
