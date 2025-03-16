
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, getSiteUrl } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SignUpDialog({ open, onOpenChange }: SignUpDialogProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setSignupSuccess(false);
      setErrorMessage(null);
      
      const siteUrl = getSiteUrl();
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            first_name: data.firstName,
            last_name: data.lastName,
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        
        if (error.message.includes("duplicate key") && error.message.includes("profiles_username_key")) {
          setErrorMessage("This username is already taken. Please choose a different username.");
          form.setError('username', { 
            type: 'manual', 
            message: 'This username is already taken' 
          });
        } else if (error.message.includes("User already registered")) {
          setErrorMessage("This email is already registered. Please use a different email or try logging in.");
          form.setError('email', { 
            type: 'manual', 
            message: 'This email is already registered' 
          });
        } else {
          const errorMsg = error.message || "Something went wrong. Please try again.";
          setErrorMessage(errorMsg);
          
          if (errorMsg.includes("Database error") && error.status === 500) {
            setErrorMessage("This username may already be taken. Please try a different username.");
            form.setError('username', { 
              type: 'manual', 
              message: 'This username may already be taken' 
            });
          }
        }
        
        throw error;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        console.error("Auto sign-in error:", signInError);
      }

      setSignupSuccess(true);
      
      toast({
        title: "Account created!",
        description: "You are now logged in and can access the app.",
        duration: 5000,
      });
      
      setTimeout(() => {
        handleOpenChange(false);
        navigate("/checkout");
      }, 2000);
      
      form.reset();
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      if (!errorMessage) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
        >
          <UserPlus className="mr-2" />
          Sign up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create your MyBirdieBoard account</DialogTitle>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {signupSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center">Account Created Successfully!</h3>
            <p className="text-center text-muted-foreground">
              You will now be redirected to complete your subscription setup.
            </p>
            <Button 
              onClick={() => handleOpenChange(false)} 
              className="mt-4"
            >
              Got it
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (displayed on leaderboards)</FormLabel>
                    <FormControl>
                      <Input placeholder="golfpro123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
