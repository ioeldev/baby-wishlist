import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { Item, LinkPreview } from "../types";
import { WISHLIST_FORM_FIELD, WISHLIST_FORM_LABEL } from "./wishlist";
import { Button, Field, Modal, Notice, TextInput } from "./ui";

type Props = {
  item: Item | null;
  preview: LinkPreview | null;
  loading: boolean;
  error: string | null;
  onPreview: (url: string) => Promise<void>;
  onSave: (preview: LinkPreview) => Promise<void>;
  onClose: () => void;
};

export function LinkModal({ item, preview, loading, error, onPreview, onSave, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  if (!item) return null;

  async function handlePreview(event: FormEvent) {
    event.preventDefault();
    await onPreview(url);
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    try {
      await onSave(preview);
      setUrl("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Ajouter un lien" maxWidth="xl" onClose={onClose}>
      <div className="grid gap-4">
        <p className="text-[15px] text-[oklch(45%_0.10_295)]">{item.name}</p>
        <form onSubmit={event => void handlePreview(event)} className="grid gap-2">
          <Field label="URL" className={WISHLIST_FORM_LABEL}>
            <div className="flex min-w-0 items-stretch gap-2">
              <TextInput
                value={url}
                onChange={event => setUrl(event.target.value)}
                placeholder="https://..."
                className={`min-w-0 flex-1 ${WISHLIST_FORM_FIELD}`}
              />
              <Button type="submit" variant="wishlistPrimary" size="icon" disabled={loading} aria-label="Prévisualiser" className="h-[42px] w-[42px] shrink-0 sm:h-[44px] sm:w-[44px]">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </Field>
        </form>
        {error ? (
          <Notice tone="error" className="rounded-[12px] border border-red-200/60 px-3 py-2.5 text-sm">
            {error}
          </Notice>
        ) : null}
        {loading ? <p className="text-sm text-[oklch(50%_0.10_295)]">Chargement de la prévisualisation...</p> : null}
        {preview ? (
          <div className="rounded-[14px] border-[1.5px] border-[oklch(92%_0.07_295)] bg-[oklch(99.2%_0.015_295)] p-3 sm:p-4">
            {preview.image ? <img src={preview.image} alt="" className="mb-3 aspect-video w-full rounded-[10px] object-cover" /> : null}
            <p className="font-['Cormorant_Garamond'] text-lg font-medium text-[oklch(38%_0.18_295)]">{preview.title ?? preview.url}</p>
            <p className="text-sm text-[oklch(50%_0.10_295)]">{preview.shop_name}</p>
            {preview.price ? <p className="mt-2 text-sm font-semibold text-[oklch(50%_0.18_82)]">{preview.price}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-[oklch(92%_0.07_295)] pt-4">
          <Button type="button" variant="wishlistSecondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" variant="wishlistPrimary" onClick={() => void handleSave()} disabled={!preview || saving}>
            {saving ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
