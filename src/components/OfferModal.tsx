import { type FormEvent, useState } from "react";
import type { Item, ReserveItemInput } from "../types";
import { Button, Field, Modal, Notice, TextInput } from "./ui";

type Props = {
  item: Item | null;
  onClose: () => void;
  onReserve: (input: ReserveItemInput) => Promise<unknown>;
};

export function OfferModal({ item, onClose, onReserve }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("first_name") ?? "").trim();
    const lastName = String(form.get("last_name") ?? "").trim();

    if (!firstName || !lastName) {
      setError("Nom et prénom sont obligatoires");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onReserve({ first_name: firstName, last_name: lastName });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de réserver cet article");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Offrir cet article" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 p-5">
        <div>
          <p className="font-semibold text-slate-950">{item.name}</p>
          {item.note ? <p className="mt-1 text-sm text-slate-600">{item.note}</p> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom">
            <TextInput name="first_name" autoComplete="given-name" />
          </Field>
          <Field label="Nom">
            <TextInput name="last_name" autoComplete="family-name" />
          </Field>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Réservation..." : "Réserver"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
