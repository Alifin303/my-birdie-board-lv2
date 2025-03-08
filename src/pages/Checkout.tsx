import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { isSubscriptionValid } from "@/integrations/supabase/subscription/subscription-utils";

const billingFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

type BillingFormValues = z.infer<typeof billingFormSchema>

const Checkout = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionValidStatus, setIsSubscriptionValidStatus] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [stripe, setStripe] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    const loadStripe = async () => {
      const stripeInstance = await (window as any).Stripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
      setStripe(stripeInstance);
    };

    loadStripe();
  }, []);

  useEffect(() => {
    const getSubscription = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();

        if (!session?.session?.user?.id) {
          console.error("No user ID found, redirecting to login");
          navigate("/");
          return;
        }

        const userId = session.session.user.id;

        const { data, error } = await supabase
          .from("customer_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching subscription:", error);
          setLoading(false);
          return;
        }

        if (data) {
          setSubscription(data);
          setCustomerId(data.customer_id);
          setSubscriptionId(data.subscription_id);
          setIsSubscribed(true);
          setIsSubscriptionValidStatus(isSubscriptionValid(data));
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error("Error in getSubscription:", error);
      } finally {
        setLoading(false);
      }
    };

    getSubscription();
  }, [navigate]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId },
      });

      if (error) {
        console.error("Error cancelling subscription:", error);
        toast({
          title: "Error",
          description: "Failed to cancel subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled.",
      });

      setSubscription((prevSubscription: any) => ({
        ...prevSubscription,
        status: "canceled",
      }));
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error in handleCancelSubscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsActivating(true);
    try {
      const { error } = await supabase.functions.invoke('reactivate-subscription', {
        body: { subscriptionId },
      });

      if (error) {
        console.error("Error reactivating subscription:", error);
        toast({
          title: "Error",
          description: "Failed to reactivate subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Subscription reactivated",
        description: "Your subscription has been reactivated.",
      });

      setSubscription((prevSubscription: any) => ({
        ...prevSubscription,
        status: "active",
      }));
      setIsSubscribed(true);
    } catch (error) {
      console.error("Error in handleReactivateSubscription:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const onSubmit = async (data: BillingFormValues) => {
    setIsCheckoutLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user?.id) {
        console.error("No user ID found, redirecting to login");
        navigate("/");
        return;
      }

      const userId = session.session.user.id;

      const { data: setupIntent, error: setupIntentError } = await supabase.functions.invoke('create-setup-intent', {
        body: { customerId: customerId },
      });

      if (setupIntentError) {
        console.error("Error creating setup intent:", setupIntentError);
        toast({
          title: "Error",
          description: "Failed to create setup intent. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setClientSecret(setupIntent.data.client_secret);

      if (!stripe) {
        console.error("Stripe SDK not loaded");
        toast({
          title: "Error",
          description: "Stripe SDK failed to load. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await stripe.confirmCardSetup(
        setupIntent.data.client_secret,
        {
          payment_method: {
            card: stripe.elements().create('card'),
            billing_details: {
              name: data.name,
            },
          },
        }
      );

      if (error) {
        console.error("Error confirming card setup:", error);
        toast({
          title: "Error",
          description: "Failed to confirm card setup. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke('create-subscription', {
        body: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          customerId: customerId,
        },
      });

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
        toast({
          title: "Error",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: updatedSubscription, error: updatedSubscriptionError } = await supabase
        .from("customer_subscriptions")
        .update({
          status: subscriptionData.data.status,
          subscription_id: subscriptionData.data.id,
        })
        .eq("customer_id", customerId)
        .select("*")
        .single();

      if (updatedSubscriptionError) {
        console.error("Error updating subscription:", updatedSubscriptionError);
        toast({
          title: "Error",
          description: "Failed to update subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSubscription(updatedSubscription);
      setIsSubscribed(true);
      toast({
        title: "Success",
        description: "Subscription created successfully!",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Subscription Details</h2>
          <p className="text-muted-foreground">
            Manage your subscription and billing details.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                {isSubscribed ? 'You are currently subscribed.' : 'You are not subscribed.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Your subscription details.</TableCaption>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>{subscription?.status || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Subscription ID</TableCell>
                    <TableCell>{subscription?.subscription_id || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Customer ID</TableCell>
                    <TableCell>{subscription?.customer_id || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Price ID</TableCell>
                    <TableCell>{process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Is Valid</TableCell>
                    <TableCell>{isSubscriptionValidStatus ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isSubscribed && subscription && (subscription.status === "incomplete" || subscription.status === "past_due" || subscription.status === "active") ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCancelling}>
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will cancel your subscription.
                        Please be aware that you will lose access to premium features.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription} disabled={isCancelling}>
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Confirm Cancellation"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : subscription && subscription.status === "canceled" ? (
                <Button onClick={handleReactivateSubscription} disabled={isActivating}>
                  {isActivating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reactivating...
                    </>
                  ) : (
                    "Reactivate Subscription"
                  )}
                </Button>
              ) : null}
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            </CardFooter>
          </Card>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Billing Details</h2>
          <p className="text-muted-foreground">
            Update your billing details.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                {isSubscribed ? 'Update your payment information.' : 'Enter your payment information.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isCheckoutLoading}>
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      isSubscribed ? "Update Payment Method" : "Subscribe"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
