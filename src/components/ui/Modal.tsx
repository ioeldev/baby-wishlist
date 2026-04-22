import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

type Props = {
  title: string;
  maxWidth?: "lg" | "xl" | "2xl";
  children: ReactNode;
  onClose: () => void;
};

const widths = {
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({ title, maxWidth = "lg", children, onClose }: Props) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[oklch(22%_0.08_295_/_0.45)] backdrop-blur-[3px] transition"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 flex max-h-[min(90dvh,56rem)] w-full ${widths[maxWidth]} flex-col overflow-hidden rounded-[20px] border-[1.5px] border-[oklch(92%_0.07_295)] bg-white shadow-[0_20px_50px_oklch(22%_0.10_295_/_0.2)]`}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[oklch(92%_0.07_295)] bg-[oklch(99.2%_0.015_295)] px-5 py-4 sm:px-6">
          <h2 id="modal-title" className="min-w-0 font-['Cormorant_Garamond'] text-2xl font-medium leading-tight text-[oklch(38%_0.18_295)]">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            aria-label="Fermer"
            className="h-9 w-9 shrink-0 text-[oklch(48%_0.10_295)] hover:bg-[oklch(96%_0.04_295)]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 [scrollbar-gutter:stable] sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
