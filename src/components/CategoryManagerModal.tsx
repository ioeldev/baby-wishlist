import { FolderCog, Plus, Save, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { CategoryWithItems, NewCategoryInput, UpdateCategoryInput } from "../types";
import { Button, Field, Modal, Notice, TextInput } from "./ui";

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
    <Modal title="Gérer les catégories" maxWidth="xl" onClose={onClose}>
      <div className="grid gap-5 p-5">
        <form onSubmit={handleCreate} className="grid gap-3 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-950">
            <FolderCog className="h-5 w-5 text-emerald-700" />
            Nouvelle catégorie
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <TextInput
              value={newName}
              onChange={event => setNewName(event.target.value)}
              placeholder="Ex: Sorties & voyages"
              className="min-w-0 flex-1"
            />
            <Button type="submit" variant="primary" disabled={busyId === "new"} icon={<Plus className="h-4 w-4" />}>
              Ajouter
            </Button>
          </div>
        </form>

        {error ? <Notice tone="error">{error}</Notice> : null}

        <div className="grid gap-3">
          {categories.map(category => (
            <form
              key={category.id}
              onSubmit={event => handleUpdate(event, category)}
              className="grid gap-3 rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-500">
                  {category.reserved_count}/{category.total_count} articles réservés
                </span>
                <span className="text-xs text-slate-400">ID {category.id}</span>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_96px] sm:items-end">
                <Field label="Nom">
                  <TextInput name="name" defaultValue={category.name} />
                </Field>
                <Field label="Ordre">
                  <TextInput name="sort_order" type="number" defaultValue={category.sort_order} />
                </Field>
                <div className="flex min-w-0 flex-wrap gap-2 sm:col-span-2 sm:justify-end">
                  <Button type="submit" size="sm" disabled={busyId === category.id} icon={<Save className="h-4 w-4" />}>
                    Sauver
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={busyId === category.id}
                    onClick={() => void handleDelete(category)}
                    icon={<Trash2 className="h-4 w-4" />}
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
