import { FolderCog, Plus, Save, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { CategoryWithItems, NewCategoryInput, UpdateCategoryInput } from "../types";
import { WISHLIST_FORM_FIELD, WISHLIST_FORM_LABEL } from "./wishlist";
import { Button, Field, Modal, Notice, TextInput } from "./ui";

const cardClass =
  "grid gap-3 rounded-[14px] border-[1.5px] border-[oklch(92%_0.07_295)] bg-[oklch(99.2%_0.015_295)] p-4";

type Props = {
  open: boolean;
  categories: CategoryWithItems[];
  onClose: () => void;
  onCreate: (input: NewCategoryInput) => Promise<unknown>;
  onUpdate: (id: number, input: UpdateCategoryInput) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
};

export function CategoryManagerModal({ open, categories, onClose, onCreate, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Le nom de la catégorie est obligatoire");
      return;
    }

    setBusyId("new");
    setError(null);
    try {
      const nextOrder = categories.reduce((max, category) => Math.max(max, category.sort_order), -1) + 1;
      await onCreate({ name, sort_order: nextOrder });
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ajouter la catégorie");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, category: CategoryWithItems) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const sortOrder = Number(form.get("sort_order"));

    if (!name) {
      setError("Le nom de la catégorie est obligatoire");
      return;
    }

    setBusyId(category.id);
    setError(null);
    try {
      await onUpdate(category.id, {
        name,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : category.sort_order,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier la catégorie");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(category: CategoryWithItems) {
    if (!confirm(`Supprimer "${category.name}" et ses ${category.total_count} article(s) ?`)) return;

    setBusyId(category.id);
    setError(null);
    try {
      await onDelete(category.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer la catégorie");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Modal title="Gérer les catégories" maxWidth="2xl" onClose={onClose}>
      <div className="grid gap-5">
        <form onSubmit={handleCreate} className={`${cardClass} gap-3`}>
          <div className="flex items-center gap-2 font-['Cormorant_Garamond'] text-lg font-medium text-[oklch(38%_0.18_295)]">
            <FolderCog className="h-5 w-5 text-[oklch(55%_0.18_295)]" aria-hidden="true" />
            Nouvelle catégorie
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <TextInput
              value={newName}
              onChange={event => setNewName(event.target.value)}
              placeholder="Ex: Sorties & voyages"
              className={`min-w-0 flex-1 ${WISHLIST_FORM_FIELD}`}
            />
            <Button
              type="submit"
              variant="wishlistPrimary"
              disabled={busyId === "new"}
              className="shrink-0 sm:min-w-[120px]"
              icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            >
              Ajouter
            </Button>
          </div>
        </form>

        {error ? (
          <Notice tone="error" className="rounded-[12px] border border-red-200/60 px-3 py-2.5 text-sm">
            {error}
          </Notice>
        ) : null}

        <div className="grid gap-3">
          {categories.map(category => (
            <form
              key={category.id}
              onSubmit={event => void handleUpdate(event, category)}
              className={cardClass}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-[oklch(50%_0.10_295)]">
                  {category.reserved_count}/{category.total_count} articles réservés
                </span>
                <span className="text-xs text-[oklch(60%_0.08_295)]">ID {category.id}</span>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_104px] sm:items-end">
                <Field label="Nom" className={WISHLIST_FORM_LABEL}>
                  <TextInput name="name" defaultValue={category.name} className={WISHLIST_FORM_FIELD} required />
                </Field>
                <Field label="Ordre" className={WISHLIST_FORM_LABEL}>
                  <TextInput name="sort_order" type="number" defaultValue={category.sort_order} className={WISHLIST_FORM_FIELD} />
                </Field>
                <div className="flex min-w-0 flex-wrap gap-2 sm:col-span-2 sm:justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    variant="wishlistSecondary"
                    disabled={busyId === category.id}
                    icon={<Save className="h-4 w-4" aria-hidden="true" />}
                  >
                    Sauver
                  </Button>
                  <Button
                    type="button"
                    variant="wishlistDanger"
                    size="sm"
                    disabled={busyId === category.id}
                    onClick={() => void handleDelete(category)}
                    icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </form>
          ))}
        </div>
      </div>
    </Modal>
  );
}
