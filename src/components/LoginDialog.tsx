
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { SignUpDialog } from "./SignUpDialog";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";

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
  const { signIn, isLoaded: isClerkLoaded } = useSignIn();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!isClerkLoaded || !signIn) {
      toast({
        title: "Error",
        description: "Authentication system is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        setOpen(false);
        form.reset();
        navigate("/dashboard");
      } else {
        // Handle incomplete sign-in (e.g., 2FA required)
        console.log("Incomplete sign-in status:", result);
        toast({
          title: "Additional verification required",
          description: "Please complete the verification process.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Invalid email or password.",
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
          <Button 
            variant="link" 
            className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
            onClick={() => {
              // Clerk reset password functionality would be added here
              toast({
                title: "Password Reset",
                description: "If an account exists, we'll send you reset instructions.",
              });
            }}
          >
            Forgot your password?
          </Button>
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
