import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { Item, LinkPreview } from "../types";
import { useTranslation } from "../i18n";
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
  const { t } = useTranslation();
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
    <Modal title={t("linkModal.title")} maxWidth="xl" onClose={onClose}>
      <div className="grid gap-4">
        <p className="text-[15px] text-text-secondary">{item.name}</p>
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
