import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          "block w-full rounded-lg border px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "placeholder:text-gray-400",
          error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
