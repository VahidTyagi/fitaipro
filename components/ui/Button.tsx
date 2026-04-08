import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" &&
            "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg",
          variant === "secondary" &&
            "bg-white text-gray-900 hover:bg-gray-50 shadow-md",
          variant === "outline" &&
            "border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50",
          variant === "ghost" &&
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };