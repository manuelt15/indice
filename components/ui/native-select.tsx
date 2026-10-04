import * as React from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { cn } from "cn"

/** Selector nativo con el estilo de Input: accesible y cómodo en móvil. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div data-slot="native-select-wrapper" className={cn("relative w-full has-[select:disabled]:opacity-45", className)}>
      <select
        data-slot="native-select"
        className="h-9 w-full min-w-0 appearance-none rounded-lg border border-dotted border-input bg-background pr-9 pl-3 text-sm text-foreground transition-colors duration-150 outline-none focus-visible:border-solid focus-visible:border-primary disabled:pointer-events-none"
        {...props}
      />
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

export { NativeSelect, NativeSelectOption }
