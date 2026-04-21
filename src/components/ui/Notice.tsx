import type { HTMLAttributes } from "react";

type Tone = "error" | "neutral";

const tones: Record<Tone, string> = {
  error: "bg-red-50 text-red-700",
  neutral: "bg-white text-slate-600",
};

type Props = HTMLAttributes<HTMLParagraphElement> & {
  tone?: Tone;
};

export function Notice({ tone = "neutral", className = "", ...props }: Props) {
  return <p className={`rounded-md px-3 py-2 text-sm ${tones[tone]} ${className}`} {...props} />;
}
