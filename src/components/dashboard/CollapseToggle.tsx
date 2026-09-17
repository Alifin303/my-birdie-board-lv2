import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapseToggleProps extends ButtonProps {
  open: boolean;
  label: string;
}

/**
 * Chevron button used inside a CollapsibleTrigger.
 * Forwards ref and props so Radix's `asChild` trigger can wire up the click handler.
 */
export const CollapseToggle = forwardRef<HTMLButtonElement, CollapseToggleProps>(
  ({ open, label, className, ...props }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="sm"
      className={cn("shrink-0 gap-1.5", className)}
      aria-label={open ? `Hide ${label}` : `Show ${label}`}
      {...props}
    >
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      <span className="text-xs font-medium">{open ? "Hide" : "Show"}</span>
    </Button>
  )
);

CollapseToggle.displayName = "CollapseToggle";
