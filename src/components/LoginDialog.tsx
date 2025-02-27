
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SignUpDialog } from "./SignUpDialog";
import { useNavigate } from "react-router-dom";
import { supabase, getSiteUrl } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Your email has not been verified. Please check your inbox for the verification link or request a new one.");
        }
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      setOpen(false);
      form.reset();
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the site URL dynamically
      const siteUrl = getSiteUrl();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Reset",
        description: "If an account exists, we'll send you reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      // Still show success message to prevent user enumeration
      toast({
        title: "Password Reset",
        description: "If an account exists, we'll send you reset instructions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    const email = form.getValues("email");
    
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the site URL dynamically
      const siteUrl = getSiteUrl();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="lg"
          className="text-white hover:bg-white/10 border border-white/20"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Log in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Welcome back to BirdieBoard</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="link" 
              className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
              onClick={handleForgotPassword}
              disabled={isLoading}
            >
              Forgot your password?
            </Button>
            <Button 
              variant="link" 
              className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
              onClick={handleResendVerificationEmail}
              disabled={isLoading}
            >
              Resend verification email
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => {
                setOpen(false);
              }}
            >
              <SignUpDialog />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
