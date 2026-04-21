// import "./index.css";
import { Baby, FolderCog, Plus } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { AddItemModal } from "./components/AddItemModal";
import { CategoryManagerModal } from "./components/CategoryManagerModal";
import { CategorySection } from "./components/CategorySection";
import { LinkModal } from "./components/LinkModal";
import { OfferModal } from "./components/OfferModal";
import { ProgressBar } from "./components/ProgressBar";
import { Button, Field, Notice, TextInput } from "./components/ui";
import {
    useAddItemLink,
    useClearReservation,
    useCreateCategory,
    useCreateItem,
    useDeleteCategory,
    useDeleteItem,
    useDeleteItemLink,
    usePreviewLink,
    useReserveItem,
    useUpdateCategory,
    useUpdateItem,
    useWishlist,
} from "./hooks/useWishlist";
import type { CategoryWithItems, Item, LinkPreview, NewItemInput, ReserveItemInput } from "./types";

type Filter = "all" | "unchecked" | "checked";

const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: "Tout" },
    { id: "unchecked", label: "Disponibles" },
    { id: "checked", label: "Réservés" },
];

function filterCategories(categories: CategoryWithItems[], filter: Filter, selectedCategoryId: number | "all") {
    return categories
        .filter((category) => selectedCategoryId === "all" || category.id === selectedCategoryId)
        .map((category) => ({
            ...category,
            items: category.items.filter((item) => {
                if (filter === "unchecked") return !item.is_reserved;
                if (filter === "checked") return item.is_reserved;
                return true;
            }),
        }))
        .filter((category) => category.items.length > 0);
}

export function App() {
    const adminMode = location.pathname.startsWith("/admin");
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") ?? "");
    const wishlist = useWishlist(adminMode, !adminMode || Boolean(adminToken));
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    const createItem = useCreateItem();
    const updateItem = useUpdateItem();
    const deleteItem = useDeleteItem();
    const previewLink = usePreviewLink();
    const addItemLink = useAddItemLink();
    const deleteItemLink = useDeleteItemLink();
    const reserveItem = useReserveItem();
    const clearReservation = useClearReservation();

    const [filter, setFilter] = useState<Filter>("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [linkItem, setLinkItem] = useState<Item | null>(null);
    const [offerItem, setOfferItem] = useState<Item | null>(null);
    const [preview, setPreview] = useState<LinkPreview | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const categories = wishlist.data ?? [];
    const selectedCategoryExists = selectedCategoryId === "all" || categories.some(category => category.id === selectedCategoryId);
    const effectiveCategoryId = selectedCategoryExists ? selectedCategoryId : "all";
    const filtered = useMemo(() => filterCategories(categories, filter, effectiveCategoryId), [categories, filter, effectiveCategoryId]);

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
            setPreviewError(err instanceof Error ? err.message : "Prévisualisation impossible");
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

    async function handleReserve(input: ReserveItemInput) {
        if (!offerItem) return;
        await reserveItem.mutateAsync({ id: offerItem.id, input });
        setOfferItem(null);
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
        <div className="min-h-screen bg-slate-50 text-slate-950">
            {adminMode ? <ProgressBar categories={categories} /> : null}
            <header className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                            <Baby className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Baby Wishlist</h1>
                            <p className="text-sm text-slate-500">
                                {adminMode ? "Administration de la liste et des réservations." : "Choisissez un cadeau à offrir."}
                            </p>
                        </div>
                    </div>
                    {adminMode ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button onClick={() => setCategoryModalOpen(true)} className="py-3" icon={<FolderCog className="h-5 w-5" />}>
                                Catégories
                            </Button>
                            <Button
                                onClick={() => setItemModalOpen(true)}
                                variant="primary"
                                className="py-3"
                                icon={<Plus className="h-5 w-5" />}
                            >
                                Ajouter
                            </Button>
                        </div>
                    ) : null}
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
                {adminMode && !adminToken ? (
                    <form onSubmit={handleAdminLogin} className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-end">
                        <Field label="Token admin">
                            <TextInput name="admin_token" type="password" placeholder="ADMIN_TOKEN" />
                        </Field>
                        <Button type="submit" variant="primary">Entrer</Button>
                    </form>
                ) : null}
                {wishlist.isLoading ? <Notice className="p-6">Chargement...</Notice> : null}
                {wishlist.error ? (
                    <Notice tone="error" className="p-6">
                        {wishlist.error.message}
                    </Notice>
                ) : null}
                {(!adminMode || adminToken) && categories.length > 0 ? (
                    <nav className="sticky top-0 z-20 -mx-4 mb-5 grid gap-3 border-y border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <Button
                                onClick={() => setSelectedCategoryId("all")}
                                variant={effectiveCategoryId === "all" ? "dark" : "secondary"}
                                size="sm"
                                className="shrink-0 whitespace-nowrap"
                            >
                                Tout
                            </Button>
                            {categories.map(category => (
                                <Button
                                    key={category.id}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                    variant={effectiveCategoryId === category.id ? "dark" : "secondary"}
                                    size="sm"
                                    className="shrink-0 whitespace-nowrap"
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filters.map((option) => (
                                <Button
                                    key={option.id}
                                    onClick={() => setFilter(option.id)}
                                    variant={filter === option.id ? "dark" : "secondary"}
                                    size="sm"
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </nav>
                ) : null}
                {(!adminMode || adminToken) && !wishlist.isLoading && filtered.length === 0 ? (
                    <Notice className="p-6">Aucun article pour ce filtre.</Notice>
                ) : null}
                {filtered.map((category) => (
                    <CategorySection
                        key={category.id}
                        category={category}
                        admin={adminMode}
                        onOffer={(item) => setOfferItem(item)}
                        onAddLink={(item) => setLinkItem(item)}
                        onEdit={openEdit}
                        onDelete={(item) => {
                            if (confirm(`Supprimer "${item.name}" ?`)) {
                                deleteItem.mutate(item.id);
                            }
                        }}
                        onDeleteLink={(id) => deleteItemLink.mutate(id)}
                        onClearReservation={(item) => {
                            if (confirm(`Libérer la réservation de "${item.name}" ?`)) {
                                clearReservation.mutate(item.id);
                            }
                        }}
                    />
                ))}
            </main>
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
            <OfferModal item={offerItem} onClose={() => setOfferItem(null)} onReserve={handleReserve} />
            <LinkModal
                item={linkItem}
                preview={preview}
                loading={previewLink.isPending}
                error={previewError}
                onPreview={handlePreview}
                onSave={handleSaveLink}
                onClose={closeLinkModal}
            />
        </div>
    );
}

export default App;
