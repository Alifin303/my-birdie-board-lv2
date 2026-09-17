import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapseToggleProps {
  open: boolean;
  label: string;
}

/** Chevron button used inside a CollapsibleTrigger — matches the Advanced Statistics toggle. */
export function CollapseToggle({ open, label }: CollapseToggleProps) {
  return (
    <Button variant="ghost" size="sm" className="shrink-0">
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      <span className="sr-only">{open ? `Hide ${label}` : `Show ${label}`}</span>
    </Button>
  );
}
