import { FolderCog, Plus } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { AddItemModal } from "../components/AddItemModal";
import { CategoryManagerModal } from "../components/CategoryManagerModal";
import { CategorySection } from "../components/CategorySection";
import { LinkModal } from "../components/LinkModal";
import { ProgressBar } from "../components/ProgressBar";
import {
    WishlistAdminHero,
    WishlistEmptyState,
    WishlistPageFooter,
    WishlistPageShell,
    WishlistStickyCategoryNav,
    WISHLIST_FORM_FIELD,
} from "../components/wishlist";
import { Button, Field, Notice, TextInput } from "../components/ui";
import { filterCategoriesForView } from "../lib/wishlistFilters";
import {
    useAddItemLink,
    useClearReservation,
    useCreateCategory,
    useCreateItem,
    useDeleteCategory,
    useDeleteItem,
    useDeleteItemLink,
    usePreviewLink,
    useUpdateCategory,
    useUpdateItem,
    useWishlist,
} from "../hooks/useWishlist";
import { useTranslation } from "../i18n";
import type { Item, LinkPreview, NewItemInput } from "../types";

type AdminFilter = "all" | "unchecked" | "checked";

export function AdminWishlistPage() {
    const { t } = useTranslation();
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") ?? "");
    const wishlist = useWishlist(true, Boolean(adminToken));
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    const createItem = useCreateItem();
    const updateItem = useUpdateItem();
    const deleteItem = useDeleteItem();
    const previewLink = usePreviewLink();
    const addItemLink = useAddItemLink();
    const deleteItemLink = useDeleteItemLink();
    const clearReservation = useClearReservation();

    const filterOptions: Array<{ id: AdminFilter; label: string }> = [
        { id: "all", label: t("adminWishlist.filter_all") },
        { id: "unchecked", label: t("adminWishlist.filter_available") },
        { id: "checked", label: t("adminWishlist.filter_reserved") },
    ];

    function adminItemFilter(filter: AdminFilter) {
        return (item: { is_reserved: boolean }) => {
            if (filter === "unchecked") return !item.is_reserved;
            if (filter === "checked") return item.is_reserved;
            return true;
        };
    }

    const [filter, setFilter] = useState<AdminFilter>("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [linkItem, setLinkItem] = useState<Item | null>(null);
    const [preview, setPreview] = useState<LinkPreview | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const categories = wishlist.data ?? [];
    const selectedCategoryExists =
        selectedCategoryId === "all" || categories.some((category) => category.id === selectedCategoryId);
    const effectiveCategoryId = selectedCategoryExists ? selectedCategoryId : "all";
    const filtered = useMemo(
        () => filterCategoriesForView(categories, effectiveCategoryId, adminItemFilter(filter)),
        [categories, effectiveCategoryId, filter]
    );

    async function handleItemSubmit(input: NewItemInput) {
        if (editingItem) {
            await updateItem.mutateAsync({ id: editingItem.id, input });
            setEditingItem(null);
            return;
        }

        await createItem.mutateAsync(input);
    }

    async function handlePreview(url: string) {
        setPreviewError(null);
        setPreview(null);
        try {
            const result = await previewLink.mutateAsync(url);
            setPreview(result);
        } catch (err) {
            setPreviewError(err instanceof Error ? err.message : t("adminWishlist.error_preview"));
        }
    }

    async function handleSaveLink(linkPreview: LinkPreview) {
        if (!linkItem) return;
        await addItemLink.mutateAsync({
            itemId: linkItem.id,
            input: {
                url: linkPreview.url,
                title: linkPreview.title,
                image: linkPreview.image,
                shop_name: linkPreview.shop_name,
                price: linkPreview.price,
            },
        });
        setPreview(null);
        setLinkItem(null);
    }

    function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const token = String(form.get("admin_token") ?? "").trim();
        localStorage.setItem("adminToken", token);
        setAdminToken(token);
    }

    function openEdit(item: Item) {
        setEditingItem(item);
        setItemModalOpen(true);
    }

    function closeItemModal() {
        setItemModalOpen(false);
        setEditingItem(null);
    }

    function closeLinkModal() {
        setLinkItem(null);
        setPreview(null);
        setPreviewError(null);
    }

    return (
        <WishlistPageShell>
            <ProgressBar categories={categories} />
            <WishlistAdminHero
                title={t("adminWishlist.title")}
                description={t("adminWishlist.description")}
                kicker={t("adminWishlist.kicker")}
                actions={
                    adminToken ? (
                        <>
                            <Button
                                onClick={() => setCategoryModalOpen(true)}
                                variant="wishlistSecondary"
                                className="min-w-[120px] px-5 py-3"
                                icon={<FolderCog className="h-5 w-5" aria-hidden="true" />}
                            >
                                {t("adminWishlist.categories_button")}
                            </Button>
                            <Button
                                onClick={() => setItemModalOpen(true)}
                                variant="wishlistPrimary"
                                className="min-w-[120px] px-5 py-3"
                                icon={<Plus className="h-5 w-5" aria-hidden="true" />}
                            >
                                {t("adminWishlist.add_button")}
                            </Button>
                        </>
                    ) : null
                }
            />

            <main className="relative z-[1] mx-auto max-w-[1140px] px-4 pb-20 sm:px-6">
                {!adminToken ? (
                    <form
                        onSubmit={handleAdminLogin}
                        className="my-8 grid gap-4 rounded-[20px] border-[1.5px] border-[oklch(92%_0.07_295)] bg-white/95 p-6 shadow-[0_2px_12px_oklch(55%_0.10_295_/_0.08)] sm:grid-cols-[1fr_auto] sm:items-end"
                    >
                        <Field label={t("adminWishlist.token_label")} className="text-sm font-semibold text-[oklch(38%_0.18_295)]">
                            <TextInput
                                name="admin_token"
                                type="password"
                                placeholder="ADMIN_TOKEN"
                                className={WISHLIST_FORM_FIELD}
                                autoComplete="off"
                            />
                        </Field>
                        <Button
                            type="submit"
                            variant="wishlistPrimary"
                            className="h-[46px] min-w-[120px] px-6 sm:h-[46px]"
                        >
                            {t("adminWishlist.enter_button")}
                        </Button>
                    </form>
                ) : null}
                {wishlist.isLoading ? (
                    <Notice className="rounded-[14px] border border-[oklch(92%_0.07_295)] bg-white/90 p-6 text-center text-[oklch(45%_0.10_295)]">
                        {t("common.loading")}
                    </Notice>
                ) : null}
                {wishlist.error ? (
                    <Notice tone="error" className="p-6">
                        {wishlist.error.message}
                    </Notice>
                ) : null}
                {adminToken && categories.length > 0 ? (
                    <WishlistStickyCategoryNav
                        categories={categories}
                        allLabel={t("adminWishlist.all_label")}
                        selectedCategoryId={effectiveCategoryId}
                        onSelectCategory={setSelectedCategoryId}
                        filterOptions={filterOptions}
                        selectedFilter={filter}
                        onSelectFilter={setFilter}
                    />
                ) : null}
                {adminToken && !wishlist.isLoading && filtered.length === 0 ? (
                    <WishlistEmptyState message={t("adminWishlist.empty_message")} />
                ) : null}
                {filtered.map((category) => (
                    <CategorySection
                        key={category.id}
                        category={category}
                        admin
                        onAddLink={setLinkItem}
                        onEdit={openEdit}
                        onDelete={(item) => {
                            if (confirm(t("adminWishlist.confirm_delete_item", { name: item.name }))) {
                                deleteItem.mutate(item.id);
                            }
                        }}
                        onDeleteLink={(id) => deleteItemLink.mutate(id)}
                        onClearReservation={(item) => {
                            if (confirm(t("adminWishlist.confirm_clear_reservation", { name: item.name }))) {
                                clearReservation.mutate(item.id);
                            }
                        }}
                    />
                ))}
            </main>

            <WishlistPageFooter message={t("adminWishlist.footer_message")} />

            <AddItemModal
                open={itemModalOpen}
                categories={categories}
                item={editingItem}
                onClose={closeItemModal}
                onSubmit={handleItemSubmit}
            />
            <CategoryManagerModal
                open={categoryModalOpen}
                categories={categories}
                onClose={() => setCategoryModalOpen(false)}
                onCreate={(input) => createCategory.mutateAsync(input)}
                onUpdate={(id, input) => updateCategory.mutateAsync({ id, input })}
                onDelete={(id) => deleteCategory.mutateAsync(id)}
            />
            <LinkModal
                item={linkItem}
                preview={preview}
                loading={previewLink.isPending}
                error={previewError}
                onPreview={handlePreview}
                onSave={handleSaveLink}
                onClose={closeLinkModal}
            />
        </WishlistPageShell>
    );
}
