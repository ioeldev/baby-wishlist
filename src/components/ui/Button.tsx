import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "dark" | "ghost";
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
};

const sizes: Record<Size, string> = {
  sm: "gap-2 px-3 py-2 text-sm",
  md: "gap-2 px-4 py-2.5",
  icon: "h-10 w-10 justify-center p-0",
};

export function Button({ variant = "secondary", size = "md", icon, className = "", children, ...props }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md font-semibold transition disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
