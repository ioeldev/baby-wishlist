import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { Item, LinkPreview } from "../types";
import { Button, Modal, Notice, TextInput } from "./ui";

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
    <Modal title="Ajouter un lien" onClose={onClose}>
      <div className="grid gap-4 p-5">
          <p className="text-sm text-slate-600">{item.name}</p>
          <form onSubmit={handlePreview} className="flex gap-2">
            <TextInput value={url} onChange={event => setUrl(event.target.value)} placeholder="https://..." className="min-w-0 flex-1" />
            <Button type="submit" variant="dark" size="icon" disabled={loading} aria-label="Prévisualiser">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {error ? <Notice tone="error">{error}</Notice> : null}
          {loading ? <p className="text-sm text-slate-500">Chargement de la prévisualisation...</p> : null}
          {preview ? (
            <div className="rounded-lg border border-slate-200 p-3">
              {preview.image ? <img src={preview.image} alt="" className="mb-3 aspect-video w-full rounded-md object-cover" /> : null}
              <p className="font-semibold text-slate-950">{preview.title ?? preview.url}</p>
              <p className="text-sm text-slate-500">{preview.shop_name}</p>
              {preview.price ? <p className="mt-2 text-sm font-semibold text-emerald-700">{preview.price}</p> : null}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Annuler</Button>
            <Button onClick={handleSave} disabled={!preview || saving} variant="primary">
              {saving ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
      </div>
    </Modal>
  );
}
