
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

console.log('['+new Date().toISOString()+'] Stripe webhook function is starting up');

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

// Initialize Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: { persistSession: false }
  }
);

serve(async (req) => {
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] Received ${req.method} request to ${url.pathname}`);
  console.log(`[${new Date().toISOString()}] Request headers:`, Object.fromEntries([...req.headers.entries()]));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('['+new Date().toISOString()+'] Handling OPTIONS request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  // For direct browser testing - return a friendly message
  if (req.method === 'GET') {
    console.log('['+new Date().toISOString()+'] Handling GET request - browser test');
    return new Response(
      JSON.stringify({ 
        message: "This is the Stripe webhook endpoint. POST requests from Stripe will be processed.",
        timestamp: new Date().toISOString(),
        env_check: {
          stripe_key_exists: !!Deno.env.get('STRIPE_SECRET_KEY'),
          webhook_secret_exists: !!Deno.env.get('STRIPE_WEBHOOK_SECRET') || !!Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET'),
          supabase_url_exists: !!Deno.env.get('SUPABASE_URL'),
          supabase_service_role_exists: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        },
        note: "This endpoint does not require authorization. POST requests from Stripe will be processed."
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (req.method === 'POST') {
    try {
      console.log('['+new Date().toISOString()+'] Processing POST request from Stripe');
      
      // Get the raw request body
      const body = await req.text();
      console.log(`[${new Date().toISOString()}] Webhook body length: ${body.length} chars`);
      
      // Log the first 200 chars of the body for debugging (avoid logging sensitive info)
      if (body.length > 0) {
        console.log(`[${new Date().toISOString()}] Webhook body preview: ${body.substring(0, 200)}...`);
      }
      
      // Get the Stripe signature from the headers
      const signature = req.headers.get('stripe-signature');
      
      if (!signature) {
        console.error('['+new Date().toISOString()+'] No Stripe signature found in request headers');
        console.log('Headers received:', Object.fromEntries([...req.headers.entries()]));
        return new Response(
          JSON.stringify({ error: 'No Stripe signature found in request headers' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log(`[${new Date().toISOString()}] Stripe signature: ${signature.substring(0, 20)}...`);
      
      // Get the webhook secret from environment variables
      // Try both possible environment variable names
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
      
      if (!webhookSecret) {
        console.error('['+new Date().toISOString()+'] No webhook secret found in environment variables');
        return new Response(
          JSON.stringify({ error: 'No webhook secret found in environment variables' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log(`[${new Date().toISOString()}] Using webhook secret: ${webhookSecret.substring(0, 8)}...`);
      
      // Construct the Stripe event
      let event;
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`[${new Date().toISOString()}] Successfully constructed Stripe event: ${event.type}`);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error constructing webhook event: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('['+new Date().toISOString()+'] Processing checkout.session.completed event');
          
          try {
            const checkoutSession = event.data.object;
            
            // Get the subscription ID from the checkout session
            const subscriptionId = checkoutSession.subscription;
            
            // Get the customer ID from the checkout session
            const customerId = checkoutSession.customer;
            
            console.log(`[${new Date().toISOString()}] Checkout completed for customer: ${customerId}, subscription: ${subscriptionId}`);
            
            // Find or create a customer_subscriptions record
            if (customerId && subscriptionId) {
              // Retrieve the subscription to get its details
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              
              if (subscription) {
                console.log(`[${new Date().toISOString()}] Retrieved subscription: ${subscriptionId}, status: ${subscription.status}`);
                
                // Get customer's metadata to find the associated user ID
                const customer = await stripe.customers.retrieve(customerId);
                
                if (customer && !customer.deleted && customer.metadata && customer.metadata.userId) {
                  const userId = customer.metadata.userId;
                  console.log(`[${new Date().toISOString()}] Found user ID in customer metadata: ${userId}`);
                  
                  // Check if there's an existing record
                  const { data: existingSubscriptions } = await supabaseAdmin
                    .from('customer_subscriptions')
                    .select('*')
                    .eq('user_id', userId);
                  
                  if (existingSubscriptions && existingSubscriptions.length > 0) {
                    // Update the existing record
                    const updateResult = await supabaseAdmin
                      .from('customer_subscriptions')
                      .update({
                        customer_id: customerId,
                        subscription_id: subscriptionId,
                        status: subscription.status,
                        price_id: subscription.items.data[0]?.price.id,
                        quantity: subscription.items.data[0]?.quantity || 1,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        cancel_at: subscription.cancel_at,
                        canceled_at: subscription.canceled_at,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString()
                      })
                      .eq('user_id', userId);
                    
                    console.log(`[${new Date().toISOString()}] Updated existing subscription record, result:`, updateResult);
                  } else {
                    // Create a new record
                    const insertResult = await supabaseAdmin
                      .from('customer_subscriptions')
                      .insert({
                        user_id: userId,
                        customer_id: customerId,
                        subscription_id: subscriptionId,
                        status: subscription.status,
                        price_id: subscription.items.data[0]?.price.id,
                        quantity: subscription.items.data[0]?.quantity || 1,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        cancel_at: subscription.cancel_at,
                        canceled_at: subscription.canceled_at,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      });
                    
                    console.log(`[${new Date().toISOString()}] Created new subscription record, result:`, insertResult);
                  }
                } else {
                  console.error(`[${new Date().toISOString()}] Customer ${customerId} not found, was deleted, or has no userId in metadata`);
                }
              }
            }
          } catch (error) {
            console.error(`[${new Date().toISOString()}] Error processing checkout.session.completed: ${error.message}`);
          }
          break;
          
        case 'customer.subscription.updated':
          console.log('['+new Date().toISOString()+'] Processing customer.subscription.updated event');
          
          try {
            const subscription = event.data.object;
            const subscriptionId = subscription.id;
            const customerId = subscription.customer;
            
            console.log(`[${new Date().toISOString()}] Subscription updated for customer: ${customerId}, subscription: ${subscriptionId}`);
            
            // Find the customer in our database
            const { data: subscriptionRecords } = await supabaseAdmin
              .from('customer_subscriptions')
              .select('*')
              .eq('subscription_id', subscriptionId);
            
            if (subscriptionRecords && subscriptionRecords.length > 0) {
              // Update the existing record
              const updateResult = await supabaseAdmin
                .from('customer_subscriptions')
                .update({
                  status: subscription.status,
                  price_id: subscription.items.data[0]?.price.id,
                  quantity: subscription.items.data[0]?.quantity || 1,
                  cancel_at_period_end: subscription.cancel_at_period_end,
                  cancel_at: subscription.cancel_at,
                  canceled_at: subscription.canceled_at,
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('subscription_id', subscriptionId);
              
              console.log(`[${new Date().toISOString()}] Updated subscription record, result:`, updateResult);
            } else {
              console.log(`[${new Date().toISOString()}] No subscription record found for subscription: ${subscriptionId}`);
              
              // Try to find by customer ID
              const { data: customerRecords } = await supabaseAdmin
                .from('customer_subscriptions')
                .select('*')
                .eq('customer_id', customerId);
              
              if (customerRecords && customerRecords.length > 0) {
                // Update the existing record by customer ID
                const updateResult = await supabaseAdmin
                  .from('customer_subscriptions')
                  .update({
                    subscription_id: subscriptionId,
                    status: subscription.status,
                    price_id: subscription.items.data[0]?.price.id,
                    quantity: subscription.items.data[0]?.quantity || 1,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    cancel_at: subscription.cancel_at,
                    canceled_at: subscription.canceled_at,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .eq('customer_id', customerId);
                
                console.log(`[${new Date().toISOString()}] Updated subscription record by customer ID, result:`, updateResult);
              } else {
                console.error(`[${new Date().toISOString()}] No customer record found for customer: ${customerId}`);
              }
            }
          } catch (error) {
            console.error(`[${new Date().toISOString()}] Error processing customer.subscription.updated: ${error.message}`);
          }
          break;
          
        case 'customer.subscription.deleted':
          console.log('['+new Date().toISOString()+'] Processing customer.subscription.deleted event');
          
          try {
            const subscription = event.data.object;
            const subscriptionId = subscription.id;
            
            console.log(`[${new Date().toISOString()}] Subscription deleted: ${subscriptionId}`);
            
            // Update the subscription record
            const updateResult = await supabaseAdmin
              .from('customer_subscriptions')
              .update({
                status: 'canceled',
                cancel_at_period_end: false,
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('subscription_id', subscriptionId);
            
            console.log(`[${new Date().toISOString()}] Updated subscription record on deletion, result:`, updateResult);
          } catch (error) {
            console.error(`[${new Date().toISOString()}] Error processing customer.subscription.deleted: ${error.message}`);
          }
          break;
          
        default:
          console.log(`[${new Date().toISOString()}] Unhandled event type: ${event.type}`);
      }
      
      console.log(`[${new Date().toISOString()}] Successfully processed webhook event: ${event.type}`);
      
      // Return a success response
      return new Response(
        JSON.stringify({ received: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Unexpected error processing webhook: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
      
      return new Response(
        JSON.stringify({ error: `Unexpected error: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // For any other request methods
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed',
      note: "This endpoint does not require authorization. Use GET for browser testing or POST for Stripe webhooks."
    }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});
