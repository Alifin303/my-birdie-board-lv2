
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Get Supabase admin client
const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or service role key');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
};

// Format date as ISO string
const formatDateFromUnixTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

// Initialize Stripe with the secret key from environment variables
const getStripe = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  console.log(`STRIPE_SECRET_KEY length: ${stripeKey.length} chars`);
  
  if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  
  return new Stripe(stripeKey, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2023-10-16',
  });
};

// Verify Stripe Webhook signature
const verifyStripeSignature = (body: string, signature: string): Stripe.Event | null => {
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
      return null;
    }
    
    console.log(`Using webhook secret with length: ${webhookSecret.length}`);
    
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log(`Webhook signature verified successfully for event: ${event.id}`);
    return event;
  } catch (error) {
    console.error(`⚠️ Webhook signature verification failed: ${error.message}`);
    return null;
  }
};

// Function to handle different event types
async function handleStripeEvent(event, supabase) {
  console.log(`Processing event type: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed event received');
      const checkoutSession = event.data.object;
      
      try {
        // Extract relevant data
        const customerId = checkoutSession.customer;
        const subscriptionId = checkoutSession.subscription;
        console.log(`Checkout session completed for customer: ${customerId}`);
        console.log(`Subscription: ${subscriptionId}`);
        
        if (!customerId || !subscriptionId) {
          throw new Error('Missing customer ID or subscription ID in checkout session');
        }
        
        // Get customer metadata to find the user ID
        const stripe = getStripe();
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.userId;
        
        console.log(`User ID from metadata: ${userId}`);
        
        let finalUserId = userId;
        
        if (!userId) {
          console.warn(`No user ID found in metadata for customer: ${customerId}`);
          
          // Try to find the user ID by querying the customer_subscriptions table
          const { data: existingData, error: queryError } = await supabase
            .from('customer_subscriptions')
            .select('user_id')
            .eq('customer_id', customerId)
            .single();
            
          if (queryError || !existingData) {
            console.error(`Unable to find user for customer ${customerId}: ${queryError?.message || 'No data found'}`);
            throw new Error(`Unable to find user for customer ${customerId}`);
          }
          
          console.log(`Found user ID from database: ${existingData.user_id}`);
          finalUserId = existingData.user_id;
        }
        
        // Fetch the subscription to get the status and other details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log(`Retrieved subscription details. Status: ${subscription.status}`);
        
        // Update or insert the subscription data in the database
        const { error: upsertError } = await supabase
          .from('customer_subscriptions')
          .upsert({
            user_id: finalUserId,
            customer_id: customerId,
            subscription_id: subscriptionId,
            status: subscription.status,
            current_period_end: formatDateFromUnixTimestamp(subscription.current_period_end),
            cancel_at_period_end: subscription.cancel_at_period_end,
            price_id: subscription.items.data[0]?.price.id,
            updated_at: new Date().toISOString()
          });
          
        if (upsertError) {
          console.error(`Error updating subscription in database: ${upsertError.message}`);
          throw upsertError;
        }
        
        console.log(`Subscription ${subscriptionId} data saved to database`);
        
      } catch (error) {
        console.error('Error processing checkout.session.completed event:', error.message);
        console.error(error.stack);
        throw error; // Re-throw to be caught by the main handler
      }
      break;
      
    case 'customer.subscription.updated':
      console.log('Subscription updated event received');
      const subscription = event.data.object;
      
      try {
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        console.log(`Subscription ${subscriptionId} updated for customer: ${customerId}`);
        console.log(`New status: ${subscription.status}`);
        
        // Find the user associated with this customer
        const { data: customerData, error: customerError } = await supabase
          .from('customer_subscriptions')
          .select('user_id')
          .eq('customer_id', customerId)
          .single();
          
        if (customerError || !customerData) {
          console.error(`Unable to find user for customer ${customerId}: ${customerError?.message || 'No data found'}`);
          // Get the customer from Stripe to check metadata
          const stripe = getStripe();
          const customer = await stripe.customers.retrieve(customerId);
          const userId = customer.metadata?.userId;
          
          if (!userId) {
            throw new Error(`Unable to find user for customer ${customerId}`);
          }
          
          console.log(`Found user ID from Stripe metadata: ${userId}`);
          
          // Create a new record
          const { error: insertError } = await supabase
            .from('customer_subscriptions')
            .insert({
              user_id: userId,
              customer_id: customerId,
              subscription_id: subscriptionId,
              status: subscription.status,
              current_period_end: formatDateFromUnixTimestamp(subscription.current_period_end),
              cancel_at_period_end: subscription.cancel_at_period_end,
              price_id: subscription.items.data[0]?.price.id,
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error inserting subscription in database: ${insertError.message}`);
            throw insertError;
          }
        } else {
          // Update the subscription data in the database
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              subscription_id: subscriptionId,
              status: subscription.status,
              current_period_end: formatDateFromUnixTimestamp(subscription.current_period_end),
              cancel_at_period_end: subscription.cancel_at_period_end,
              price_id: subscription.items.data[0]?.price.id,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', customerData.user_id);
            
          if (updateError) {
            console.error(`Error updating subscription in database: ${updateError.message}`);
            throw updateError;
          }
        }
        
        console.log(`Subscription ${subscriptionId} data updated in database`);
        
      } catch (error) {
        console.error('Error processing customer.subscription.updated event:', error.message);
        console.error(error.stack);
        throw error; // Re-throw to be caught by the main handler
      }
      break;
      
    case 'customer.subscription.deleted':
      console.log('Subscription deleted event received');
      const deletedSubscription = event.data.object;
      
      try {
        const customerId = deletedSubscription.customer;
        const subscriptionId = deletedSubscription.id;
        console.log(`Subscription ${subscriptionId} deleted for customer: ${customerId}`);
        
        // Update the database to mark the subscription as canceled
        const { error: updateError } = await supabase
          .from('customer_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', subscriptionId);
          
        if (updateError) {
          console.error(`Error updating deleted subscription in database: ${updateError.message}`);
          throw updateError;
        }
        
        console.log(`Subscription ${subscriptionId} marked as canceled in database`);
        
      } catch (error) {
        console.error('Error processing customer.subscription.deleted event:', error.message);
        console.error(error.stack);
        throw error; // Re-throw to be caught by the main handler
      }
      break;
    
    case 'customer.deleted':
      console.log('Customer deleted event received');
      const customer = event.data.object;
      
      try {
        const customerId = customer.id;
        console.log(`Customer ${customerId} was deleted`);
        
        // Update the customer_subscriptions table to mark the customer as deleted
        const { error: deleteError } = await supabase
          .from('customer_subscriptions')
          .update({
            status: 'customer_deleted',
            subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('customer_id', customerId);
          
        if (deleteError) {
          console.error(`Error updating customer deletion in database: ${deleteError.message}`);
          throw deleteError;
        }
        
        console.log(`Customer ${customerId} marked as deleted in database`);
        
      } catch (error) {
        console.error('Error processing customer.deleted event:', error.message);
        console.error(error.stack);
        throw error; // Re-throw to be caught by the main handler
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}. No action taken.`);
  }
}

serve(async (req) => {
  // Add timestamp to log entries for better debugging
  const requestTimestamp = new Date().toISOString();
  console.log(`[${requestTimestamp}] Webhook request received: ${req.method} ${new URL(req.url).pathname}`);
  
  // Detailed header logging
  const headers = Object.fromEntries(req.headers.entries());
  console.log(`[${requestTimestamp}] Request headers: ${JSON.stringify(headers)}`);
  
  // Check if there's a stripe-signature header
  const hasSignature = req.headers.has('stripe-signature');
  console.log(`[${requestTimestamp}] Has stripe-signature header: ${hasSignature}`);
  if (hasSignature) {
    console.log(`[${requestTimestamp}] Stripe signature value length: ${req.headers.get('stripe-signature')?.length || 0}`);
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestTimestamp}] Handling OPTIONS preflight request`);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  if (req.method !== 'POST') {
    console.error(`[${requestTimestamp}] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    // Get the request body as text
    const body = await req.text();
    console.log(`[${requestTimestamp}] Request body length: ${body.length} characters`);
    
    if (body.length === 0) {
      console.error(`[${requestTimestamp}] Request body is empty!`);
      return new Response(JSON.stringify({ error: 'Empty request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Log a small portion of the body for debugging
    if (body.length > 0) {
      console.log(`[${requestTimestamp}] Request body excerpt: ${body.substring(0, 100)}...`);
    }
    
    // Get the stripe signature header
    const signature = req.headers.get('stripe-signature');
    
    // Try to verify the webhook signature
    let event = null;
    if (signature) {
      console.log(`[${requestTimestamp}] Attempting to verify Stripe signature...`);
      event = verifyStripeSignature(body, signature);
    }
    
    // If signature verification failed or there was no signature, parse the body directly
    if (!event) {
      console.log(`[${requestTimestamp}] Processing event without signature verification (for debugging)`);
      try {
        event = JSON.parse(body);
      } catch (parseError) {
        console.error(`[${requestTimestamp}] Failed to parse request body: ${parseError.message}`);
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (!event || !event.type) {
      console.error(`[${requestTimestamp}] Event object is invalid or missing type`);
      return new Response(JSON.stringify({ error: 'Invalid event object' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`[${requestTimestamp}] Event id: ${event.id}`);
    console.log(`[${requestTimestamp}] Event type: ${event.type}`);
    
    try {
      // Process the event with Supabase client
      const supabase = getSupabaseAdmin();
      await handleStripeEvent(event, supabase);
      
      // Return a success response
      console.log(`[${requestTimestamp}] Webhook processing completed successfully`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (processingError) {
      console.error(`[${requestTimestamp}] Error processing webhook: ${processingError.message}`);
      console.error(processingError.stack);
      
      return new Response(JSON.stringify({ error: processingError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error(`[${requestTimestamp}] Webhook general error: ${error.message}`);
    console.error(error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
