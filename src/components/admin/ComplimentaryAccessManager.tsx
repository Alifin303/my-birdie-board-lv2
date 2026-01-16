import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Gift, CalendarIcon, Loader2, X } from "lucide-react";
import { format, addMonths, addYears } from "date-fns";
import { cn } from "@/lib/utils";

interface ComplimentaryAccessManagerProps {
  userId: string;
  userEmail: string;
  currentSubscription: {
    status: string;
    current_period_end: string | null;
  } | null;
  onUpdate: () => void;
}

export function ComplimentaryAccessManager({
  userId,
  userEmail,
  currentSubscription,
  onUpdate,
}: ComplimentaryAccessManagerProps) {
  const [isGranting, setIsGranting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    addMonths(new Date(), 12) // Default to 1 year
  );
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const isComplimentary = currentSubscription?.status === "complimentary";
  const hasActiveSubscription = currentSubscription && 
    ["active", "trialing", "paid"].includes(currentSubscription.status);

  const handleGrantAccess = async () => {
    if (!expiryDate) {
      toast({
        title: "Please select an expiry date",
        variant: "destructive",
      });
      return;
    }

    setIsGranting(true);
    try {
      // First, add to complimentary_accounts for audit trail
      const { error: auditError } = await supabase
        .from("complimentary_accounts")
        .upsert(
          {
            email: userEmail.toLowerCase(),
            notes: notes || `Granted via admin panel on ${format(new Date(), "PPP")}`,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          },
          { onConflict: "email" }
        );

      if (auditError) {
        console.error("Error adding to complimentary accounts:", auditError);
        // Continue anyway - audit is secondary
      }

      // Check if user already has a subscription record
      const { data: existingSub } = await supabase
        .from("customer_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingSub) {
        // Update existing subscription
        const { error } = await supabase
          .from("customer_subscriptions")
          .update({
            status: "complimentary",
            current_period_end: expiryDate.toISOString(),
            cancel_at_period_end: false,
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new subscription record
        const { error } = await supabase.from("customer_subscriptions").insert({
          user_id: userId,
          customer_id: `comp_${userId}`, // Placeholder customer ID for complimentary
          status: "complimentary",
          current_period_end: expiryDate.toISOString(),
          cancel_at_period_end: false,
        });

        if (error) throw error;
      }

      toast({
        title: "Complimentary access granted",
        description: `Access granted until ${format(expiryDate, "PPP")}`,
      });

      setShowForm(false);
      setNotes("");
      onUpdate();
    } catch (error: any) {
      console.error("Error granting complimentary access:", error);
      toast({
        title: "Error granting access",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeAccess = async () => {
    setIsRevoking(true);
    try {
      // Update subscription to expired status
      const { error } = await supabase
        .from("customer_subscriptions")
        .update({
          status: "canceled",
          current_period_end: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Remove from complimentary accounts
      await supabase
        .from("complimentary_accounts")
        .delete()
        .ilike("email", userEmail);

      toast({
        title: "Complimentary access revoked",
        description: "User has been returned to free tier",
      });

      onUpdate();
    } catch (error: any) {
      console.error("Error revoking complimentary access:", error);
      toast({
        title: "Error revoking access",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const quickDurations = [
    { label: "1 Month", date: addMonths(new Date(), 1) },
    { label: "3 Months", date: addMonths(new Date(), 3) },
    { label: "6 Months", date: addMonths(new Date(), 6) },
    { label: "1 Year", date: addYears(new Date(), 1) },
    { label: "Lifetime", date: addYears(new Date(), 100) },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          {isComplimentary ? (
            <Badge variant="default" className="bg-purple-500">
              Complimentary
            </Badge>
          ) : hasActiveSubscription ? (
            <Badge variant="default" className="bg-green-500">
              Paid ({currentSubscription?.status})
            </Badge>
          ) : (
            <Badge variant="secondary">Free Tier</Badge>
          )}
        </div>

        {currentSubscription?.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {isComplimentary ? "Expires:" : "Period End:"}
            </span>
            <span className="text-sm">
              {format(new Date(currentSubscription.current_period_end), "PPP")}
            </span>
          </div>
        )}

        {/* Actions */}
        {!showForm && (
          <div className="flex gap-2 pt-2">
            {!isComplimentary && !hasActiveSubscription && (
              <Button
                size="sm"
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                <Gift className="h-4 w-4 mr-2" />
                Grant Complimentary Access
              </Button>
            )}
            {isComplimentary && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="flex-1"
                >
                  Extend
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRevokeAccess}
                  disabled={isRevoking}
                  className="flex-1"
                >
                  {isRevoking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Revoke"
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Grant Form */}
        {showForm && (
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>Grant Complimentary Access</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Duration Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickDurations.map((duration) => (
                <Button
                  key={duration.label}
                  size="sm"
                  variant={
                    expiryDate?.getTime() === duration.date.getTime()
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setExpiryDate(duration.date)}
                >
                  {duration.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Picker */}
            <div className="space-y-2">
              <Label>Custom Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Reason for granting complimentary access..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleGrantAccess}
              disabled={isGranting || !expiryDate}
              className="w-full"
            >
              {isGranting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Grant Access until {expiryDate ? format(expiryDate, "PP") : "..."}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
