import * as React from "react";

import { cn } from "@/lib/utils";

/** Default RTL for Hebrew; pass dir="ltr" for email, password, date, and number fields. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, dir, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        dir={dir ?? "rtl"}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded-md border bg-input px-3 py-2 text-start text-sm [unicode-bidi:plaintext] ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
