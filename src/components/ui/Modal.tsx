import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

type Props = {
  title: string;
  maxWidth?: "lg" | "xl";
  children: ReactNode;
  onClose: () => void;
};

const widths = {
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({ title, maxWidth = "lg", children, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className={`w-full ${widths[maxWidth]} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer" className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
