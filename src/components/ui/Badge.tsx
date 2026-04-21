import type { HTMLAttributes } from "react";

type Tone = "rose" | "sky" | "slate";

const tones: Record<Tone, string> = {
  rose: "bg-rose-50 text-rose-700",
  sky: "bg-sky-50 text-sky-700",
  slate: "bg-slate-100 text-slate-700",
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({ tone = "slate", className = "", ...props }: Props) {
  return <span className={`rounded px-2 py-1 text-xs font-medium ${tones[tone]} ${className}`} {...props} />;
}
