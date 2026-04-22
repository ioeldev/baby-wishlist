import { type FormEvent, useState } from "react";
import type { Item, ReserveItemInput } from "../types";
import { Butterfly } from "./Butterflies";
import { Notice } from "./ui";

type Props = {
  item: Item | null;
  onClose: () => void;
  onReserve: (input: ReserveItemInput) => Promise<unknown>;
};

export function OfferModal({ item, onClose, onReserve }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
      setDone(true);
      window.setTimeout(() => {
        setDone(false);
        onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de réserver cet article");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(22%_0.06_295_/_0.5)] p-5 font-['Nunito'] backdrop-blur-lg animate-public-fade-up"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-3xl border-[1.5px] border-border bg-white px-8 py-9 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Butterfly index={0} size={72} className="absolute -top-7 right-4 animate-public-float-a" />
        <Butterfly index={1} size={44} className="absolute -top-3 left-3.5 animate-public-float-b opacity-40" />

        {done ? (
          <div className="py-5 text-center animate-public-fade-up">
            <Butterfly index={0} size={72} className="mx-auto mb-3.5 animate-public-float-a" />
            <h3 className="mb-2 font-heading text-3xl font-semibold text-text-primary">Merci !</h3>
            <p className="text-sm text-text-secondary">Votre cadeau est réservé avec amour.</p>
          </div>
        ) : (
          <>
            <h3 className="mb-1 font-heading text-[26px] font-semibold leading-tight text-text-primary">Offrir ce cadeau</h3>
            <p className="mb-6 text-sm italic text-text-tertiary">{item.name}</p>
            <form onSubmit={handleSubmit} className="grid gap-3.5">
              <label>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.07em] text-text-secondary">Prénom</span>
                <input
                  name="first_name"
                  autoComplete="given-name"
                  required
                  placeholder="Votre prénom"
                  className="w-full rounded-xl border-[1.5px] border-border-medium bg-[oklch(95%_0.03_295)] px-4 py-3 text-[15px] text-text-dark outline-none transition focus:border-primary"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.07em] text-text-secondary">Nom</span>
                <input
                  name="last_name"
                  autoComplete="family-name"
                  required
                  placeholder="Votre nom"
                  className="w-full rounded-xl border-[1.5px] border-border-medium bg-[oklch(95%_0.03_295)] px-4 py-3 text-[15px] text-text-dark outline-none transition focus:border-primary"
                />
              </label>
              {error ? <Notice tone="error">{error}</Notice> : null}
              <div className="mt-1 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border-[1.5px] border-border-medium bg-white p-3 text-sm font-semibold text-text-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-[2] rounded-xl border-0 bg-gradient-to-br from-primary to-primary-dark p-3 text-sm font-bold text-white shadow-md disabled:opacity-70"
                >
                  {busy ? "Réservation..." : "Je l'offre !"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
