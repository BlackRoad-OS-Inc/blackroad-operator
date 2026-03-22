import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className = "", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={`px-4 py-2 rounded-md bg-br-neon-accent text-white hover:opacity-90 transition ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
