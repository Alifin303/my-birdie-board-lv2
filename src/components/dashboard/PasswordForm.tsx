
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverContent } from "@/components/ui/popover";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

interface PasswordFormProps {
  userEmail: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function PasswordForm({ userEmail, onBack, onSuccess }: PasswordFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Initialize form with React Hook Form
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  // Using manual focus management without automatic focus to avoid aria-hidden conflicts
  const currentPasswordRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    // Short delay to ensure the dialog is fully rendered
    const timer = setTimeout(() => {
      if (currentPasswordRef.current) {
        try {
          // Try to focus without causing a conflict with Radix UI's aria-hidden
          currentPasswordRef.current.focus();
        } catch (e) {
          console.error("Could not focus the password field:", e);
        }
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePasswordChange = async (values: z.infer<typeof passwordFormSchema>) => {
    setLoading(true);
    try {
      // First verify the current password is correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: values.currentPassword
      });

      if (signInError) throw new Error("Current password is incorrect");

      // If current password is correct, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  ref={(e) => {
                    field.ref(e);
                    // @ts-ignore - we're attaching our ref in addition to the field ref
                    currentPasswordRef.current = e;
                  }}
                  {...field}
                  // Ensure the input is directly controllable
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  // Ensure the input is directly controllable
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    // Ensure the input is directly controllable
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="mr-2"
          >
            Back to Profile
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
