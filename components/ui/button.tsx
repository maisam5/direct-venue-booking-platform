import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all outline-none select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] hover:opacity-90",
        outline:
          "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--soft)]",
        secondary:
          "border-[var(--line)] bg-[var(--soft)] text-[var(--ink)] hover:opacity-80",
        ghost: "border-transparent hover:bg-[var(--soft)] text-[var(--ink)]",
        destructive:
          "border-red-600 bg-red-600 text-white hover:bg-red-700",
        link: "border-transparent text-[var(--ink)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

function Button({
  className = "",
  variant = "default",
  size = "default",
  loading = false,
  icon,
  children,
  disabled,
  type = "button",
  ...props
}: CustomButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${buttonVariants({ variant, size })} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export { Button, buttonVariants };
export default Button;
