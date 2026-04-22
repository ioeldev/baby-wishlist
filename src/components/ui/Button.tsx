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
    "border border-transparent bg-gradient-to-br from-primary to-primary-dark text-white shadow-md hover:opacity-[0.96]",
  wishlistSecondary:
    "border-[1.5px] border-border-medium bg-white text-text-primary hover:bg-bg-lighter",
  wishlistDanger:
    "border-[1.5px] border-reserved-border bg-white text-red-700 hover:bg-red-50",
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
