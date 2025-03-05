
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Webhook received, processing request...");
    
    // Get the stripe webhook secret from environment variables
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }
    
    // Get the stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      throw new Error('Missing STRIPE_SECRET_KEY');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error("No stripe signature in the request headers");
      throw new Error('No stripe signature in the request');
    }

    // Get the raw body
    const body = await req.text();
    
    console.log(`Received webhook request with signature: ${signature.substring(0, 20)}...`);
    console.log(`Webhook secret length: ${stripeWebhookSecret.length}`);
    console.log(`First 10 chars of webhook secret: ${stripeWebhookSecret.substring(0, 10)}...`);
    
    let event;
    // Verify the webhook
    try {
      console.log("Attempting to verify webhook signature...");
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
      console.log("Webhook signature verification successful!");
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Received Stripe webhook event: ${event.type}`);
    console.log(`Event ID: ${event.id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://rbhzesocmhazynkfyhst.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log("Processing checkout.session.completed:", session.id);
        console.log("Customer ID:", session.customer);
        console.log("Subscription ID:", session.subscription);
        
        if (!session.subscription) {
          console.log("No subscription ID in checkout session, skipping update");
          break;
        }
        
        // Find customer by Stripe customer ID
        const { data: subscription, error: selectError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('customer_id', session.customer)
          .maybeSingle();
        
        if (selectError) {
          console.error("Error finding customer subscription:", selectError);
          throw selectError;
        }
        
        if (subscription) {
          console.log(`Updating subscription record for user ${subscription.user_id}`);
          console.log(`Current status: ${subscription.status}, updating to: active`);
          
          // Update the subscription record
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              subscription_id: session.subscription,
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);
          
          if (updateError) {
            console.error("Error updating subscription record:", updateError);
            throw updateError;
          }
          
          console.log(`Successfully updated subscription record for user ${subscription.user_id}`);
        } else {
          console.error(`No subscription record found for customer ${session.customer}`);
          
          // Let's query to see if the customer exists with a different ID format
          const { data: allSubscriptions, error: listError } = await supabase
            .from('customer_subscriptions')
            .select('*');
            
          if (listError) {
            console.error("Error listing all subscriptions:", listError);
          } else {
            console.log("All customer_subscriptions records:", allSubscriptions);
          }
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscriptionData = event.data.object;
        console.log("Processing customer.subscription.updated:", subscriptionData.id);
        console.log("Customer ID:", subscriptionData.customer);
        
        // Find subscription by Stripe subscription ID
        const { data: customerSubscription, error: selectError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('subscription_id', subscriptionData.id)
          .maybeSingle();
        
        if (selectError) {
          console.error("Error finding customer subscription:", selectError);
          throw selectError;
        }
        
        if (customerSubscription) {
          console.log(`Updating subscription status for user ${customerSubscription.user_id}`);
          console.log(`Current status: ${customerSubscription.status}`);
          
          // Determine the status
          let status;
          if (subscriptionData.cancel_at_period_end) {
            status = 'cancelled';
          } else if (subscriptionData.status === 'active') {
            status = 'active';
          } else {
            status = subscriptionData.status;
          }
          
          console.log(`Setting subscription status to: ${status}`);
          
          // Update the subscription record
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              status: status,
              updated_at: new Date().toISOString()
            })
            .eq('id', customerSubscription.id);
          
          if (updateError) {
            console.error("Error updating subscription status:", updateError);
            throw updateError;
          }
          
          console.log(`Successfully updated subscription status for user ${customerSubscription.user_id}`);
        } else {
          console.error(`No subscription record found for subscription ID ${subscriptionData.id}`);
          
          // Try finding by customer ID instead
          const { data: customerSub, error: customerSubError } = await supabase
            .from('customer_subscriptions')
            .select('*')
            .eq('customer_id', subscriptionData.customer)
            .maybeSingle();
            
          if (customerSubError) {
            console.error("Error finding customer by customer ID:", customerSubError);
          } else if (customerSub) {
            console.log(`Found subscription by customer ID instead: ${customerSub.id}`);
            console.log(`Updating subscription record for user ${customerSub.user_id}`);
            
            // Determine the status
            let status;
            if (subscriptionData.cancel_at_period_end) {
              status = 'cancelled';
            } else if (subscriptionData.status === 'active') {
              status = 'active';
            } else {
              status = subscriptionData.status;
            }
            
            // Update the subscription record with subscription ID and status
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                subscription_id: subscriptionData.id,
                status: status,
                updated_at: new Date().toISOString()
              })
              .eq('id', customerSub.id);
            
            if (updateError) {
              console.error("Error updating subscription by customer ID:", updateError);
            } else {
              console.log(`Successfully updated subscription by customer ID for user ${customerSub.user_id}`);
            }
          } else {
            console.error(`No customer found with customer ID ${subscriptionData.customer}`);
          }
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscriptionData = event.data.object;
        console.log("Processing customer.subscription.deleted:", subscriptionData.id);
        console.log("Customer ID:", subscriptionData.customer);
        
        // Find subscription by Stripe subscription ID
        const { data: customerSubscription, error: selectError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('subscription_id', subscriptionData.id)
          .maybeSingle();
        
        if (selectError) {
          console.error("Error finding customer subscription:", selectError);
          throw selectError;
        }
        
        if (customerSubscription) {
          console.log(`Setting subscription to expired for user ${customerSubscription.user_id}`);
          // Update the subscription record
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('id', customerSubscription.id);
          
          if (updateError) {
            console.error("Error updating subscription to expired:", updateError);
            throw updateError;
          }
          
          console.log(`Successfully updated subscription to expired for user ${customerSubscription.user_id}`);
        } else {
          console.error(`No subscription record found for subscription ID ${subscriptionData.id}`);
          
          // Try finding by customer ID instead
          const { data: customerSub, error: customerSubError } = await supabase
            .from('customer_subscriptions')
            .select('*')
            .eq('customer_id', subscriptionData.customer)
            .maybeSingle();
            
          if (customerSubError) {
            console.error("Error finding customer by customer ID:", customerSubError);
          } else if (customerSub) {
            console.log(`Found subscription by customer ID instead: ${customerSub.id}`);
            
            // Update the subscription record
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                status: 'expired',
                updated_at: new Date().toISOString()
              })
              .eq('id', customerSub.id);
            
            if (updateError) {
              console.error("Error updating subscription to expired by customer ID:", updateError);
            } else {
              console.log(`Successfully updated subscription to expired by customer ID for user ${customerSub.user_id}`);
            }
          } else {
            console.error(`No customer found with customer ID ${subscriptionData.customer}`);
          }
        }
        
        break;
      }
      
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    console.error(error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
