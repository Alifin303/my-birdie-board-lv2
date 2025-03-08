
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function PortalLink({ compact = false }: { compact?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenPortal = async () => {
    try {
      setIsLoading(true);
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        throw new Error("You must be logged in to access billing");
      }
      
      console.log("Creating portal session for user:", session.user.id);
      
      // Get the origin to use as return URL
      const origin = window.location.origin;
      const returnUrl = `${origin}/dashboard`;
      
      // Call the Supabase Edge Function to create a Stripe Customer Portal session
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          user_id: session.user.id,
          return_url: returnUrl
        }
      });
      
      if (error) {
        console.error("Portal creation error:", error);
        throw new Error(error.message || "Failed to create portal session");
      }
      
      if (!data || !data.url) {
        throw new Error("No portal URL returned");
      }
      
      // Redirect to Stripe Customer Portal
      console.log("Redirecting to Stripe portal:", data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Portal error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleOpenPortal}
        disabled={isLoading}
        className="text-primary hover:text-primary/80 hover:bg-primary/10"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage Subscription"}
      </Button>
    );
  }

  return (
    <div className="py-3 px-4 border border-border rounded-lg max-w-md w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Subscription Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your plan and billing information</p>
        </div>
        <Button
          onClick={handleOpenPortal}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Manage"
          )}
        </Button>
      </div>
    </div>
  );
}
