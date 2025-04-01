
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Handle focus/blur for mobile to prevent scroll jumps
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (props.onFocus) {
        props.onFocus(e);
      }
      
      // For mobile devices
      if (window.innerWidth <= 640) {
        // Prevent immediate scroll jump
        e.preventDefault();
        
        // After a small delay, focus the input again smoothly
        setTimeout(() => {
          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      }
    }, [props.onFocus]);
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
