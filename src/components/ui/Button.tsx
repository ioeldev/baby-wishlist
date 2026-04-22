import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "dark" | "ghost" | "wishlistPrimary" | "wishlistSecondary" | "wishlistDanger";
type Size = "sm" | "md" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-red-100 bg-white text-red-700 hover:bg-red-50",
  dark: "bg-slate-900 text-white hover:bg-slate-800",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
  wishlistPrimary:
    "border border-transparent bg-gradient-to-br from-[oklch(68%_0.16_295)] to-[oklch(52%_0.20_295)] text-white shadow-[0_4px_14px_oklch(52%_0.20_295_/_0.3)] hover:opacity-[0.96]",
  wishlistSecondary:
    "border-[1.5px] border-[oklch(80%_0.12_295)] bg-white text-[oklch(38%_0.18_295)] hover:bg-[oklch(99%_0.02_295)]",
  wishlistDanger:
    "border-[1.5px] border-[oklch(80%_0.12_160)] bg-white text-[oklch(45%_0.14_25)] hover:bg-[oklch(97%_0.04_25)]",
};

const sizes: Record<Size, string> = {
  sm: "gap-2 px-3 py-2 text-sm",
  md: "gap-2 px-4 py-2.5",
  icon: "h-10 w-10 justify-center p-0",
};

const wishlistRadius = (variant: Variant) =>
  variant === "wishlistPrimary" || variant === "wishlistSecondary" || variant === "wishlistDanger" ? "rounded-xl" : "rounded-md";

export function Button({ variant = "secondary", size = "md", icon, className = "", type = "button", children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition disabled:opacity-60 ${wishlistRadius(variant)} ${variants[variant]} ${sizes[size]} ${className}`}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
