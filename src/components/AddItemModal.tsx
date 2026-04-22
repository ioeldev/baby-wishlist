import { type FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import type { CategoryWithItems, Item, NewItemInput } from "../types";
import { WISHLIST_FORM_FIELD, WISHLIST_FORM_LABEL } from "./wishlist";
import { Button, Field, Modal, Notice, SelectInput, TextArea, TextInput } from "./ui";

const schema = z.object({
  category_id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, "Le nom est obligatoire"),
  note: z.string().trim().optional(),
  assigned_to: z.string().trim().optional(),
  price_estimate: z.union([z.literal(""), z.coerce.number().nonnegative()]).optional(),
});

type Props = {
  open: boolean;
  categories: CategoryWithItems[];
  item?: Item | null;
  onClose: () => void;
  onSubmit: (input: NewItemInput) => Promise<void>;
};

export function AddItemModal({ open, categories, item, onClose, onSubmit }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      category_id: form.get("category_id"),
      name: form.get("name"),
      note: form.get("note"),
      assigned_to: form.get("assigned_to"),
      price_estimate: form.get("price_estimate"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    const value = parsed.data;
    setBusy(true);
    try {
      await onSubmit({
        category_id: value.category_id,
        name: value.name,
        note: value.note || null,
        assigned_to: value.assigned_to || null,
        price_estimate: value.price_estimate === "" ? null : value.price_estimate ?? null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={item ? "Modifier l'article" : "Ajouter un article"} maxWidth="xl" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Field label="Nom" className={WISHLIST_FORM_LABEL}>
          <TextInput name="name" defaultValue={item?.name ?? ""} className={WISHLIST_FORM_FIELD} required />
        </Field>
        <Field label="Note" className={WISHLIST_FORM_LABEL}>
          <TextArea name="note" defaultValue={item?.note ?? ""} className={WISHLIST_FORM_FIELD} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Catégorie" className={WISHLIST_FORM_LABEL}>
            <SelectInput name="category_id" defaultValue={item?.category_id ?? categories[0]?.id} className={WISHLIST_FORM_FIELD}>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Assigné à" className={WISHLIST_FORM_LABEL}>
            <TextInput name="assigned_to" defaultValue={item?.assigned_to ?? ""} className={WISHLIST_FORM_FIELD} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix estimé" className={WISHLIST_FORM_LABEL}>
            <TextInput
              name="price_estimate"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item?.price_estimate ?? ""}
              className={WISHLIST_FORM_FIELD}
            />
          </Field>
        </div>
        {error ? (
          <Notice tone="error" className="rounded-[12px] border border-red-200/60 px-3 py-2.5 text-sm">
            {error}
          </Notice>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-[oklch(92%_0.07_295)] pt-4">
          <Button type="button" variant="wishlistSecondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="wishlistPrimary" disabled={busy}>
            {busy ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
