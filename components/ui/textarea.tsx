import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, dir, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        dir={dir ?? "auto"}
        data-slot="textarea"
        className={cn(
          "flex min-h-24 w-full rounded-md border bg-input px-3 py-2 text-start text-sm [unicode-bidi:plaintext] ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
