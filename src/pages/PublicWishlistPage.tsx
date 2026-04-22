import { useMemo, useState } from "react";
import { OfferModal } from "../components/OfferModal";
import { ProgressBar } from "../components/ProgressBar";
import { CategorySection } from "../components/CategorySection";
import {
  WishlistEmptyState,
  WishlistPageFooter,
  WishlistPageShell,
  WishlistPublicHero,
  WishlistStickyCategoryNav,
} from "../components/wishlist";
import { Notice } from "../components/ui";
import { filterCategoriesForView } from "../lib/wishlistFilters";
import { useReserveItem, useWishlist } from "../hooks/useWishlist";
import { useTranslation } from "../i18n";
import type { Item, ReserveItemInput } from "../types";

type PublicFilter = "all" | "available" | "reserved";

export function PublicWishlistPage() {
  const { t } = useTranslation();
  const wishlist = useWishlist(false, true);
  const reserveItem = useReserveItem();
  const [filter, setFilter] = useState<PublicFilter>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [offerItem, setOfferItem] = useState<Item | null>(null);

  const filterOptions: Array<{ id: PublicFilter; label: string }> = [
    { id: "all", label: t("publicWishlist.filter_all") },
    { id: "available", label: t("publicWishlist.filter_available") },
    { id: "reserved", label: t("publicWishlist.filter_reserved") },
  ];

  function publicItemFilter(f: PublicFilter) {
    return (item: { is_reserved: boolean }) => {
      if (f === "available") return !item.is_reserved;
      if (f === "reserved") return item.is_reserved;
      return true;
    };
  }

  const categories = wishlist.data ?? [];
  const selectedCategoryExists = selectedCategoryId === "all" || categories.some(category => category.id === selectedCategoryId);
  const effectiveCategoryId = selectedCategoryExists ? selectedCategoryId : "all";
  const filtered = useMemo(
    () => filterCategoriesForView(categories, effectiveCategoryId, publicItemFilter(filter)),
    [categories, effectiveCategoryId, filter],
  );

  async function handleReserve(input: ReserveItemInput) {
    if (!offerItem) return;
    await reserveItem.mutateAsync({ id: offerItem.id, input });
    setOfferItem(null);
  }

  return (
    <WishlistPageShell>
      <ProgressBar categories={categories} variant="public" />
      <WishlistPublicHero />

      <main className="relative z-[1] mx-auto max-w-[1140px] px-4 pb-20 sm:px-6">
        {wishlist.isLoading ? (
          <Notice className="rounded-[14px] border border-[oklch(92%_0.07_295)] bg-white/90 p-6 text-center text-[oklch(45%_0.10_295)]">{t("common.loading")}</Notice>
        ) : null}
        {wishlist.error ? <Notice tone="error" className="p-6">{wishlist.error.message}</Notice> : null}

        {categories.length > 0 ? (
          <WishlistStickyCategoryNav
            categories={categories}
            allLabel={t("publicWishlist.all_label")}
            selectedCategoryId={effectiveCategoryId}
            onSelectCategory={setSelectedCategoryId}
            filterOptions={filterOptions}
            selectedFilter={filter}
            onSelectFilter={setFilter}
          />
        ) : null}

        {!wishlist.isLoading && filtered.length === 0 ? <WishlistEmptyState message={t("publicWishlist.empty_message")} /> : null}

        {filtered.map(category => (
          <CategorySection key={category.id} category={category} onOffer={setOfferItem} />
        ))}
      </main>

      <WishlistPageFooter message={t("publicWishlist.footer_message")} />
      <OfferModal item={offerItem} onClose={() => setOfferItem(null)} onReserve={handleReserve} />
    </WishlistPageShell>
  );
}
