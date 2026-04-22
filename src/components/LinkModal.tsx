import { Search, Upload, X } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import type { Item, LinkPreview } from "../types";
import { useLocalizeItem, useTranslation } from "../i18n";
import { WISHLIST_FORM_FIELD, WISHLIST_FORM_LABEL } from "./wishlist";
import { Button, Field, Modal, Notice, TextInput } from "./ui";

type Props = {
  item: Item | null;
  preview: LinkPreview | null;
  loading: boolean;
  error: string | null;
  onPreview: (url: string) => Promise<void>;
  onSave: (preview: LinkPreview, fallbackImageUrl?: string) => Promise<void>;
  onClose: () => void;
};

export function LinkModal({ item, preview, loading, error, onPreview, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const { localName } = useLocalizeItem();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [fallbackFile, setFallbackFile] = useState<File | null>(null);
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);
  const [uploadingFallback, setUploadingFallback] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  async function handlePreview(event: FormEvent) {
    event.preventDefault();
    await onPreview(url);
  }

  async function handleUploadFallback(event: FormEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file || !item) return;

    setUploadingFallback(true);
    setFallbackError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/items/${item.id}/upload-fallback`, {
        method: "POST",
        headers: {
          "x-admin-token": localStorage.getItem("adminToken") ?? "",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      const result = (await response.json()) as { url: string };
      setFallbackImageUrl(result.url);
      setFallbackFile(file);
    } catch (err) {
      setFallbackError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploadingFallback(false);
    }
  }

  function removeFallbackImage() {
    setFallbackImageUrl(null);
    setFallbackFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    try {
      await onSave(preview, fallbackImageUrl ?? undefined);
      setUrl("");
      setFallbackImageUrl(null);
      setFallbackFile(null);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={t("linkModal.title")} maxWidth="xl" onClose={onClose}>
      <div className="grid gap-4">
        <p className="text-[15px] text-text-secondary">{localName(item)}</p>
        <form onSubmit={event => void handlePreview(event)} className="grid gap-2">
          <Field label="URL" className={WISHLIST_FORM_LABEL}>
            <div className="flex min-w-0 items-stretch gap-2">
              <TextInput
                value={url}
                onChange={event => setUrl(event.target.value)}
                placeholder="https://..."
                className={`min-w-0 flex-1 ${WISHLIST_FORM_FIELD}`}
              />
              <Button type="submit" variant="wishlistPrimary" size="icon" disabled={loading} aria-label={t("linkModal.preview_label")} className="h-[42px] w-[42px] shrink-0 sm:h-[44px] sm:w-[44px]">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </Field>
        </form>

        <div className="rounded-lg border border-border bg-[oklch(98%_0.02_295)] p-4">
          <p className="mb-3 text-sm font-semibold text-text-primary">Image de secours (optionnel)</p>
          <p className="mb-3 text-xs text-text-tertiary">Téléchargez une image locale à utiliser si le scraper n'en trouve pas une</p>

          {fallbackImageUrl ? (
            <div className="mb-3 flex items-center gap-2 rounded border border-[oklch(90%_0.05_120)] bg-[oklch(95%_0.02_120)] p-3">
              <img src={fallbackImageUrl} alt="" className="h-10 w-10 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text-primary">{fallbackFile?.name}</p>
              </div>
              <button
                type="button"
                onClick={removeFallbackImage}
                className="shrink-0 text-text-tertiary hover:text-text-primary"
                aria-label="Supprimer l'image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 transition hover:border-border-medium hover:bg-[oklch(96%_0.02_295)] cursor-pointer">
              <Upload className="h-5 w-5 text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Cliquez pour télécharger</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={event => void handleUploadFallback(event)}
                disabled={uploadingFallback}
                className="hidden"
              />
            </label>
          )}

          {uploadingFallback && <p className="mt-2 text-xs text-text-secondary">Upload en cours...</p>}
          {fallbackError ? (
            <Notice tone="error" className="mt-2 rounded-lg border border-red-200/60 px-3 py-2 text-xs">
              {fallbackError}
            </Notice>
          ) : null}
        </div>

        {error ? (
          <Notice tone="error" className="rounded-[12px] border border-red-200/60 px-3 py-2.5 text-sm">
            {error}
          </Notice>
        ) : null}
        {loading ? <p className="text-sm text-text-secondary">{t("linkModal.loading")}</p> : null}
        {preview ? (
          <div className="rounded-xl border-[1.5px] border-border bg-bg-white p-3 sm:p-4">
            {preview.image ? <img src={preview.image} alt="" className="mb-3 aspect-video w-full rounded-lg object-cover" /> : null}
            <p className="font-heading text-lg font-medium text-text-primary">{preview.title ?? preview.url}</p>
            <p className="text-sm text-text-secondary">{preview.shop_name}</p>
            {preview.price ? <p className="mt-2 text-sm font-semibold text-price">{preview.price}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="wishlistSecondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="button" variant="wishlistPrimary" onClick={() => void handleSave()} disabled={!preview || saving}>
            {saving ? t("common.add_busy") : t("common.add_idle")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
