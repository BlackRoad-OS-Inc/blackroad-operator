import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

export function Button({ variant = "primary", size = "md", asChild = false, className, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-slate-500 shadow-md hover:shadow-lg",
    secondary: "bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
    gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus-visible:ring-indigo-500 shadow-lg hover:shadow-xl"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg"
  };

  const Component: any = asChild ? Slot : "button";

  return <Component className={clsx(baseStyles, variants[variant], sizes[size], className)} {...props} />;
}
