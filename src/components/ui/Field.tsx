import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const controlClass = "rounded-md border border-slate-300 px-3 py-2";

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, children, className = "" }: FieldProps) {
  return (
    <label className={`grid min-w-0 gap-1 text-sm font-medium text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full min-w-0 ${controlClass} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`min-h-20 w-full min-w-0 ${controlClass} ${className}`} {...props} />;
}

export function SelectInput({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full min-w-0 ${controlClass} ${className}`} {...props} />;
}
