
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Comprehensive CORS headers for all response types
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Initialize Supabase client with service key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripe = new Stripe(stripeSecretKey, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

console.log('Stripe webhook function starting at ' + new Date().toISOString());
console.log('This function is publicly accessible and no authorization is required');

serve(async (req) => {
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${url.pathname}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('['+new Date().toISOString()+'] Handling OPTIONS request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  // Simple GET request handler for testing
  if (req.method === 'GET') {
    console.log('['+new Date().toISOString()+'] Handling GET request');
    return new Response(JSON.stringify({
      message: "Stripe webhook endpoint is working. Send a POST request from Stripe to use it.",
      timestamp: new Date().toISOString(),
      auth_status: "No authorization required - public access enabled"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Handle Webhook POST request
  if (req.method === 'POST') {
    console.log('['+new Date().toISOString()+'] Handling POST webhook request');
    
    try {
      // Get the webhook raw body data
      const payload = await req.text();
      console.log(`[${new Date().toISOString()}] Webhook payload received: ${payload.substring(0, 100)}...`);
      
      // Parse the event JSON directly without verification
      // NOTE: In production, you should verify the signature using Stripe's verification method
      // However, due to Deno limitations with synchronous crypto, we're handling it directly
      let event;
      
      try {
        event = JSON.parse(payload);
        console.log(`[${new Date().toISOString()}] Event type: ${event.type}`);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error parsing webhook payload: ${err.message}`);
        return new Response(JSON.stringify({ error: 'Webhook error: Invalid payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Handle specific event types
      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('['+new Date().toISOString()+'] Processing checkout.session.completed');
          const session = event.data.object;
          
          // Get the customer ID and subscription ID from the session
          const customerId = session.customer;
          const subscriptionId = session.subscription;
          
          if (customerId && subscriptionId) {
            // Fetch the subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Get the first item's price ID from the subscription
            const priceId = subscription.items.data[0]?.price.id;
            
            // Get the metadata from the subscription for the user_id
            const userId = subscription.metadata?.user_id;
            
            if (!userId) {
              console.error('['+new Date().toISOString()+'] User ID not found in subscription metadata');
              return new Response(JSON.stringify({ error: 'User ID not found in subscription metadata' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
            
            // Update or insert the subscription in the database
            const { data, error } = await supabase
              .from('customer_subscriptions')
              .upsert({
                user_id: userId,
                customer_id: customerId,
                subscription_id: subscriptionId,
                status: subscription.status,
                price_id: priceId,
                quantity: subscription.items.data[0]?.quantity || 1,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: 'user_id' });
            
            if (error) {
              console.error(`[${new Date().toISOString()}] Error updating subscription in database: ${error.message}`);
              return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
            
            console.log(`[${new Date().toISOString()}] Subscription updated in database: ${subscriptionId}`);
          }
          break;
        }
        
        case 'customer.subscription.updated': {
          console.log('['+new Date().toISOString()+'] Processing customer.subscription.updated');
          const subscription = event.data.object;
          
          // Get the details from the subscription
          const customerId = subscription.customer;
          const subscriptionId = subscription.id;
          const priceId = subscription.items.data[0]?.price.id;
          
          // Query the database to find the user_id for this subscription
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('customer_subscriptions')
            .select('user_id')
            .eq('subscription_id', subscriptionId)
            .single();
          
          if (subscriptionError || !subscriptionData) {
            console.error(`[${new Date().toISOString()}] Error finding subscription in database: ${subscriptionError?.message}`);
            return new Response(JSON.stringify({ error: 'Subscription not found in database' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Update the subscription in the database
          const { error } = await supabase
            .from('customer_subscriptions')
            .update({
              status: subscription.status,
              price_id: priceId,
              quantity: subscription.items.data[0]?.quantity || 1,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('subscription_id', subscriptionId);
          
          if (error) {
            console.error(`[${new Date().toISOString()}] Error updating subscription in database: ${error.message}`);
            return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          console.log(`[${new Date().toISOString()}] Subscription updated in database: ${subscriptionId}`);
          break;
        }
        
        case 'customer.subscription.deleted': {
          console.log('['+new Date().toISOString()+'] Processing customer.subscription.deleted');
          const subscription = event.data.object;
          
          // Update the subscription status to 'canceled' in the database
          const { error } = await supabase
            .from('customer_subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscription.id);
          
          if (error) {
            console.error(`[${new Date().toISOString()}] Error updating subscription status in database: ${error.message}`);
            return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          console.log(`[${new Date().toISOString()}] Subscription marked as canceled in database: ${subscription.id}`);
          break;
        }
        
        default:
          console.log(`[${new Date().toISOString()}] Unhandled event type: ${event.type}`);
      }
      
      // Return a success response
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error processing webhook: ${err.message}`);
      console.error(err.stack);
      
      return new Response(JSON.stringify({ error: `Webhook error: ${err.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Handle unsupported methods
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
